use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    env, fs,
    io::{Read, Write},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::{
        atomic::{AtomicU64, Ordering},
        Mutex,
    },
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::menu::{ContextMenu, MenuBuilder, MenuItem, MenuItemBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager, State};

const JAVA_RUN_TIMEOUT: Duration = Duration::from_secs(5);
const AGENT_CONTEXT_DIR: &str = "agent";
const AGENT_CONTEXT_FILE: &str = "current-context.json";

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct JavaTestResult {
    name: String,
    passed: bool,
    error: Option<String>,
    output: Option<String>,
    expected: Option<String>,
    got: Option<String>,
}

struct TerminalState {
    next_id: AtomicU64,
    sessions: Mutex<HashMap<u64, TerminalSession>>,
}

struct TerminalSession {
    writer: Mutex<Box<dyn Write + Send>>,
    master: Mutex<Box<dyn portable_pty::MasterPty + Send>>,
    child: Mutex<Box<dyn portable_pty::Child + Send>>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalOutputPayload {
    terminal_id: u64,
    data: Vec<u8>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalExitPayload {
    terminal_id: u64,
}

impl Default for TerminalState {
    fn default() -> Self {
        Self {
            next_id: AtomicU64::new(1),
            sessions: Mutex::new(HashMap::new()),
        }
    }
}

#[tauri::command]
fn agent_context_path(app: tauri::AppHandle) -> Result<String, String> {
    Ok(agent_context_file(&app)?.to_string_lossy().to_string())
}

#[tauri::command]
fn write_agent_context(app: tauri::AppHandle, context_json: String) -> Result<String, String> {
    let parsed: serde_json::Value =
        serde_json::from_str(&context_json).map_err(|e| e.to_string())?;
    let path = agent_context_file(&app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let pretty = serde_json::to_string_pretty(&parsed).map_err(|e| e.to_string())?;
    fs::write(&path, pretty).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

fn agent_context_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|dir| dir.join(AGENT_CONTEXT_DIR).join(AGENT_CONTEXT_FILE))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn spawn_terminal(
    app: tauri::AppHandle,
    kind: String,
    cwd: Option<String>,
    cols: Option<u16>,
    rows: Option<u16>,
    state: State<'_, TerminalState>,
) -> Result<u64, String> {
    let cols = cols.unwrap_or(80).max(1);
    let rows = rows.unwrap_or(24).max(1);
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Failed to open terminal: {e}"))?;

    let working_dir = terminal_working_dir(&app, cwd);
    let (program, args) = terminal_command(&kind);
    let mut cmd = CommandBuilder::new(program);
    cmd.args(&args);
    cmd.cwd(&working_dir);
    configure_terminal_env(&app, &mut cmd);

    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| format!("Failed to start {kind}: {e}"))?;
    drop(pair.slave);

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("Failed to attach terminal reader: {e}"))?;
    let writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("Failed to attach terminal writer: {e}"))?;

    let terminal_id = state.next_id.fetch_add(1, Ordering::SeqCst);
    let emitter = app.clone();
    thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let _ = emitter.emit(
                        "terminal-output",
                        TerminalOutputPayload {
                            terminal_id,
                            data: buf[..n].to_vec(),
                        },
                    );
                }
                Err(_) => break,
            }
        }
        let _ = emitter.emit("terminal-exit", TerminalExitPayload { terminal_id });
    });

    let session = TerminalSession {
        writer: Mutex::new(writer),
        master: Mutex::new(pair.master),
        child: Mutex::new(child),
    };
    state
        .sessions
        .lock()
        .map_err(|e| format!("Terminal lock error: {e}"))?
        .insert(terminal_id, session);

    Ok(terminal_id)
}

#[tauri::command]
fn write_terminal(
    terminal_id: u64,
    data: Vec<u8>,
    state: State<'_, TerminalState>,
) -> Result<(), String> {
    let sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Terminal lock error: {e}"))?;
    let session = sessions
        .get(&terminal_id)
        .ok_or_else(|| "Terminal session not found".to_string())?;
    let result = session
        .writer
        .lock()
        .map_err(|e| format!("Terminal writer lock error: {e}"))?
        .write_all(&data)
        .map_err(|e| format!("Terminal write failed: {e}"));
    result
}

#[tauri::command]
fn resize_terminal(
    terminal_id: u64,
    cols: u16,
    rows: u16,
    state: State<'_, TerminalState>,
) -> Result<(), String> {
    if cols == 0 || rows == 0 {
        return Ok(());
    }

    let sessions = state
        .sessions
        .lock()
        .map_err(|e| format!("Terminal lock error: {e}"))?;
    let session = sessions
        .get(&terminal_id)
        .ok_or_else(|| "Terminal session not found".to_string())?;
    let result = session
        .master
        .lock()
        .map_err(|e| format!("Terminal resize lock error: {e}"))?
        .resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| format!("Terminal resize failed: {e}"));
    result
}

#[tauri::command]
fn close_terminal(terminal_id: u64, state: State<'_, TerminalState>) -> Result<(), String> {
    let session = state
        .sessions
        .lock()
        .map_err(|e| format!("Terminal lock error: {e}"))?
        .remove(&terminal_id);

    if let Some(session) = session {
        if let Ok(mut child) = session.child.into_inner() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }

    Ok(())
}

fn terminal_command(kind: &str) -> (String, Vec<String>) {
    match kind {
        "claude" => terminal_shell_command(Some("claude")),
        "codex" => terminal_shell_command(Some("codex -c check_for_update_on_startup=false")),
        _ => terminal_shell_command(None),
    }
}

fn terminal_shell_command(command: Option<&str>) -> (String, Vec<String>) {
    #[cfg(windows)]
    {
        let shell = env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string());
        if let Some(command) = command {
            (shell, vec!["/C".to_string(), command.to_string()])
        } else {
            (shell, Vec::new())
        }
    }

    #[cfg(not(windows))]
    {
        let shell = env::var("SHELL").unwrap_or_else(|_| {
            if Path::new("/bin/zsh").exists() {
                "/bin/zsh".to_string()
            } else {
                "/bin/sh".to_string()
            }
        });
        if let Some(command) = command {
            (
                shell,
                vec!["-lc".to_string(), terminal_agent_launch_command(command)],
            )
        } else {
            (shell, Vec::new())
        }
    }
}

#[cfg(not(windows))]
fn terminal_agent_launch_command(command: &str) -> String {
    format!(
        "exec env -u NO_COLOR -u NODE_DISABLE_COLORS -u CODEX_CI TERM=xterm-256color COLORTERM=truecolor FORCE_COLOR=3 CLICOLOR=1 CLICOLOR_FORCE=1 {command}"
    )
}

fn terminal_working_dir(app: &tauri::AppHandle, cwd: Option<String>) -> PathBuf {
    explicit_terminal_working_dir(cwd)
        .or_else(|| default_terminal_working_dir(app))
        .or_else(|| env::current_dir().ok().filter(|path| path.is_dir()))
        .or_else(home_dir)
        .unwrap_or_else(|| PathBuf::from("."))
}

fn explicit_terminal_working_dir(cwd: Option<String>) -> Option<PathBuf> {
    cwd.map(PathBuf::from).filter(|path| path.is_dir())
}

fn default_terminal_working_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    if cfg!(debug_assertions) {
        terminal_dev_project_dir()
    } else {
        terminal_app_data_dir(app)
    }
}

fn terminal_dev_project_dir() -> Option<PathBuf> {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest_dir
        .parent()
        .map(Path::to_path_buf)
        .filter(|path| path.is_dir())
}

fn terminal_app_data_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    let dir = app.path().app_data_dir().ok()?;
    fs::create_dir_all(&dir).ok()?;
    Some(dir)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::ffi::OsStr;

    #[test]
    fn explicit_terminal_working_dir_uses_existing_directory() {
        let dir = env::temp_dir().join(format!(
            "kata-terminal-cwd-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system clock before unix epoch")
                .as_nanos()
        ));
        fs::create_dir_all(&dir).expect("create temp dir");

        assert_eq!(
            explicit_terminal_working_dir(Some(dir.to_string_lossy().to_string())),
            Some(dir.clone())
        );

        fs::remove_dir_all(dir).expect("remove temp dir");
    }

    #[test]
    fn explicit_terminal_working_dir_ignores_missing_directory() {
        let dir = env::temp_dir().join(format!(
            "missing-kata-terminal-cwd-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system clock before unix epoch")
                .as_nanos()
        ));

        assert_eq!(
            explicit_terminal_working_dir(Some(dir.to_string_lossy().to_string())),
            None
        );
    }

    #[test]
    fn terminal_dev_project_dir_points_at_repo_root() {
        let dir = terminal_dev_project_dir().expect("dev project dir");

        assert!(dir.join("package.json").is_file());
        assert!(dir.join("src-tauri").join("Cargo.toml").is_file());
    }

    #[test]
    fn terminal_color_env_removes_color_suppression() {
        let mut cmd = CommandBuilder::new("dummy");
        cmd.env("NO_COLOR", "1");
        cmd.env("NODE_DISABLE_COLORS", "1");
        cmd.env("CODEX_CI", "1");

        configure_terminal_color_env(&mut cmd);

        assert!(cmd.get_env("NO_COLOR").is_none());
        assert!(cmd.get_env("NODE_DISABLE_COLORS").is_none());
        assert!(cmd.get_env("CODEX_CI").is_none());
        assert_eq!(cmd.get_env("TERM"), Some(OsStr::new("xterm-256color")));
        assert_eq!(cmd.get_env("COLORTERM"), Some(OsStr::new("truecolor")));
        assert_eq!(cmd.get_env("FORCE_COLOR"), Some(OsStr::new("3")));
        assert_eq!(cmd.get_env("CLICOLOR"), Some(OsStr::new("1")));
        assert_eq!(cmd.get_env("CLICOLOR_FORCE"), Some(OsStr::new("1")));
    }

    #[cfg(not(windows))]
    #[test]
    fn agent_launch_command_forces_color_after_shell_startup() {
        let command = terminal_agent_launch_command("codex -c check_for_update_on_startup=false");

        assert!(command.starts_with("exec env "));
        assert!(command.contains("-u NO_COLOR"));
        assert!(command.contains("-u NODE_DISABLE_COLORS"));
        assert!(command.contains("-u CODEX_CI"));
        assert!(command.contains("TERM=xterm-256color"));
        assert!(command.contains("COLORTERM=truecolor"));
        assert!(command.contains("FORCE_COLOR=3"));
        assert!(command.contains("CLICOLOR_FORCE=1"));
        assert!(command.ends_with(" codex -c check_for_update_on_startup=false"));
    }

    #[cfg(not(windows))]
    #[test]
    fn codex_terminal_command_disables_startup_update_check() {
        let (_program, args) = terminal_command("codex");

        assert_eq!(args[0], "-lc");
        assert!(args[1].contains("codex -c check_for_update_on_startup=false"));
    }
}

fn home_dir() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        env::var_os("USERPROFILE").map(PathBuf::from)
    }

    #[cfg(not(windows))]
    {
        env::var_os("HOME").map(PathBuf::from)
    }
}

fn configure_terminal_env(app: &tauri::AppHandle, cmd: &mut CommandBuilder) {
    configure_terminal_color_env(cmd);
    cmd.env("KATA_TERMINAL", "1");
    cmd.env("PATH", enriched_terminal_path());
    if let Ok(path) = agent_context_file(app) {
        cmd.env(
            "KATA_AGENT_CONTEXT_PATH",
            path.to_string_lossy().to_string(),
        );
    }
}

fn configure_terminal_color_env(cmd: &mut CommandBuilder) {
    cmd.env_remove("NO_COLOR");
    cmd.env_remove("NODE_DISABLE_COLORS");
    cmd.env_remove("CODEX_CI");
    cmd.env("TERM", "xterm-256color");
    cmd.env("COLORTERM", "truecolor");
    cmd.env("FORCE_COLOR", "3");
    cmd.env("CLICOLOR", "1");
    cmd.env("CLICOLOR_FORCE", "1");
    cmd.env(
        "LANG",
        env::var("LANG").unwrap_or_else(|_| "en_US.UTF-8".to_string()),
    );
    cmd.env(
        "LC_ALL",
        env::var("LC_ALL").unwrap_or_else(|_| "en_US.UTF-8".to_string()),
    );
}

fn enriched_terminal_path() -> String {
    let mut parts: Vec<String> = env::var_os("PATH")
        .map(|path| {
            env::split_paths(&path)
                .map(|p| p.to_string_lossy().to_string())
                .collect()
        })
        .unwrap_or_default();

    let home = home_dir();
    let mut candidates = vec![
        "/opt/homebrew/bin".to_string(),
        "/usr/local/bin".to_string(),
        "/usr/bin".to_string(),
        "/bin".to_string(),
        "/usr/sbin".to_string(),
        "/sbin".to_string(),
    ];
    if let Some(home) = home {
        let home = home.to_string_lossy();
        candidates.push(format!("{home}/.local/bin"));
        candidates.push(format!("{home}/.cargo/bin"));
        candidates.push(format!("{home}/.npm-global/bin"));
    }

    for candidate in candidates {
        if !parts.iter().any(|part| part == &candidate) {
            parts.push(candidate);
        }
    }

    env::join_paths(parts.iter().map(Path::new))
        .map(|path| path.to_string_lossy().to_string())
        .unwrap_or_else(|_| parts.join(if cfg!(windows) { ";" } else { ":" }))
}

// Native right-click menu for a kata row in the Problems table. The frontend
// registers hidden row-scoped commands before showing this menu; Rust only
// presents native menu items and lets the generic "cmd:" bridge dispatch them.
#[tauri::command]
fn show_kata_context_menu(
    app: tauri::AppHandle,
    window: tauri::Window,
    kata_id: i64,
    is_favorite: bool,
    is_custom: bool,
    has_leetcode: bool,
) -> Result<(), String> {
    let _ = kata_id;
    let favorite_label = if is_favorite {
        "Remove from Favorites"
    } else {
        "Add to Favorites"
    };

    let open = MenuItemBuilder::with_id("cmd:library:context:open", "Open Kata")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let favorite = MenuItemBuilder::with_id("cmd:library:context:favorite", favorite_label)
        .build(&app)
        .map_err(|e| e.to_string())?;
    let reset = MenuItemBuilder::with_id("cmd:library:context:reset-progress", "Reset Progress")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let copy = MenuItemBuilder::with_id("cmd:library:context:copy-name", "Copy Kata Name")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let open_leetcode =
        MenuItemBuilder::with_id("cmd:library:context:open-leetcode", "Open on LeetCode")
            .build(&app)
            .map_err(|e| e.to_string())?;
    let edit = MenuItemBuilder::with_id("cmd:library:context:edit", "Edit Kata")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let delete = MenuItemBuilder::with_id("cmd:library:context:delete", "Delete Kata")
        .build(&app)
        .map_err(|e| e.to_string())?;

    let mut menu_builder = MenuBuilder::new(&app)
        .item(&open)
        .separator()
        .item(&favorite)
        .item(&reset)
        .separator()
        .item(&copy);

    if has_leetcode {
        menu_builder = menu_builder.item(&open_leetcode);
    }

    if is_custom {
        menu_builder = menu_builder
            .separator()
            .item(&edit)
            .item(&delete);
    }

    let menu = menu_builder.build().map_err(|e| e.to_string())?;

    menu.popup(window).map_err(|e| e.to_string())
}

// Native right-click menu for the Monaco editor surface. Item ids map directly
// to registered frontend commands; availability-sensitive items are omitted.
#[tauri::command]
fn show_editor_context_menu(
    app: tauri::AppHandle,
    window: tauri::Window,
    has_solution: bool,
    has_leetcode: bool,
    repl_supported: bool,
    agent_open: bool,
    agent_provider: String,
) -> Result<(), String> {
    let ask_agent_label = match agent_provider.as_str() {
        "claude" => "Ask Claude",
        "codex" => "Ask Codex",
        _ => "Ask Agent",
    };
    let run_tests = MenuItemBuilder::with_id("cmd:editor:run-tests", "Run Tests")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let reset_code = MenuItemBuilder::with_id("cmd:editor:reset-code", "Reset Code")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let toggle_problem_panel =
        MenuItemBuilder::with_id("cmd:editor:toggle-problem-panel", "Toggle Problem Panel")
            .build(&app)
            .map_err(|e| e.to_string())?;
    let toggle_solution = MenuItemBuilder::with_id("cmd:editor:toggle-solution", "Toggle Solutions")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let copy_solution =
        MenuItemBuilder::with_id("cmd:editor:copy-solution", "Copy Solution to Editor")
            .build(&app)
            .map_err(|e| e.to_string())?;
    let toggle_repl = MenuItemBuilder::with_id("cmd:editor:toggle-repl", "Toggle REPL")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let ask_agent = MenuItemBuilder::with_id("cmd:editor:ask-agent", ask_agent_label)
        .build(&app)
        .map_err(|e| e.to_string())?;
    let send_agent_prompt = MenuItemBuilder::with_id(
        "cmd:editor:send-agent-prompt-to-terminal",
        "Send Agent Prompt",
    )
    .build(&app)
    .map_err(|e| e.to_string())?;
    let open_leetcode = MenuItemBuilder::with_id("cmd:editor:open-leetcode", "Open on LeetCode")
        .build(&app)
        .map_err(|e| e.to_string())?;

    let mut menu_builder = MenuBuilder::new(&app)
        .item(&run_tests)
        .separator()
        .item(&reset_code)
        .item(&toggle_problem_panel);

    if has_solution {
        menu_builder = menu_builder.item(&toggle_solution).item(&copy_solution);
    }

    menu_builder = menu_builder.separator();

    if repl_supported {
        menu_builder = menu_builder.item(&toggle_repl);
    }

    menu_builder = menu_builder.item(&ask_agent);

    if agent_open {
        menu_builder = menu_builder.item(&send_agent_prompt);
    }

    if has_leetcode {
        menu_builder = menu_builder.separator().item(&open_leetcode);
    }

    let menu = menu_builder.build().map_err(|e| e.to_string())?;

    menu.popup(window).map_err(|e| e.to_string())
}

#[tauri::command]
fn run_java_tests(user_code: String, test_code: String) -> Result<Vec<JavaTestResult>, String> {
    let test_names = extract_java_test_names(&test_code);
    if test_names.is_empty() {
        return Ok(vec![JavaTestResult {
            name: "No tests found".to_string(),
            passed: false,
            error: Some("No test_* methods in test code".to_string()),
            output: None,
            expected: None,
            got: None,
        }]);
    }

    let tools = JavaTools::resolve();
    let run_dir = create_java_run_dir()?;
    let result = run_java_tests_in_dir(&tools, &run_dir, &user_code, &test_code, &test_names);
    let _ = fs::remove_dir_all(&run_dir);
    result
}

struct JavaTools {
    javac: PathBuf,
    java: PathBuf,
}

impl JavaTools {
    fn resolve() -> Self {
        if let Ok(java_home) = env::var("JAVA_HOME") {
            let home = PathBuf::from(java_home);
            let javac = home.join("bin").join(exe_name("javac"));
            let java = home.join("bin").join(exe_name("java"));
            if javac.exists() && java.exists() {
                return Self { javac, java };
            }
        }
        Self {
            javac: PathBuf::from(exe_name("javac")),
            java: PathBuf::from(exe_name("java")),
        }
    }
}

fn exe_name(name: &str) -> String {
    if cfg!(windows) {
        format!("{name}.exe")
    } else {
        name.to_string()
    }
}

fn create_java_run_dir() -> Result<PathBuf, String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    let dir = env::temp_dir().join(format!("code-kata-java-{}-{now}", std::process::id()));
    fs::create_dir_all(dir.join("out")).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn run_java_tests_in_dir(
    tools: &JavaTools,
    run_dir: &Path,
    user_code: &str,
    test_code: &str,
    test_names: &[String],
) -> Result<Vec<JavaTestResult>, String> {
    fs::write(run_dir.join("Solution.java"), user_code).map_err(|e| e.to_string())?;
    fs::write(
        run_dir.join("KataTest.java"),
        compose_java_test_harness(test_code, test_names),
    )
    .map_err(|e| e.to_string())?;

    let compile = Command::new(&tools.javac)
        .current_dir(run_dir)
        .arg("-encoding")
        .arg("UTF-8")
        .arg("-d")
        .arg("out")
        .arg("Solution.java")
        .arg("KataTest.java")
        .output()
        .map_err(|e| format!("Java compiler not found. Install JDK 17+ or set JAVA_HOME. ({e})"))?;

    if !compile.status.success() {
        let stderr = String::from_utf8_lossy(&compile.stderr);
        let stdout = String::from_utf8_lossy(&compile.stdout);
        let msg = first_meaningful_lines(&format!("{stderr}\n{stdout}"), 8);
        return Ok(test_names
            .iter()
            .map(|name| JavaTestResult {
                name: name.clone(),
                passed: false,
                error: Some(if msg.is_empty() {
                    "javac failed".to_string()
                } else {
                    msg.clone()
                }),
                output: None,
                expected: None,
                got: None,
            })
            .collect());
    }

    let run_output = run_with_timeout(
        Command::new(&tools.java)
            .current_dir(run_dir)
            .arg("-cp")
            .arg("out")
            .arg("KataTest"),
        JAVA_RUN_TIMEOUT,
    )?;

    if run_output.timed_out {
        return Ok(vec![JavaTestResult {
            name: "Timeout".to_string(),
            passed: false,
            error: Some(format!(
                "Execution exceeded {}s — possible infinite loop",
                JAVA_RUN_TIMEOUT.as_secs()
            )),
            output: None,
            expected: None,
            got: None,
        }]);
    }

    let stdout = String::from_utf8_lossy(&run_output.stdout);
    let mut results = Vec::new();
    for line in stdout
        .lines()
        .filter(|line| line.trim_start().starts_with('{'))
    {
        if let Ok(result) = serde_json::from_str::<JavaTestResult>(line) {
            results.push(result);
        }
    }

    if !results.is_empty() {
        return Ok(results);
    }

    let stderr = String::from_utf8_lossy(&run_output.stderr);
    let msg = first_meaningful_lines(&format!("{stderr}\n{stdout}"), 8);
    Ok(test_names
        .iter()
        .map(|name| JavaTestResult {
            name: name.clone(),
            passed: false,
            error: Some(if msg.is_empty() {
                "Java test runner produced no results".to_string()
            } else {
                msg.clone()
            }),
            output: None,
            expected: None,
            got: None,
        })
        .collect())
}

struct TimedOutput {
    stdout: Vec<u8>,
    stderr: Vec<u8>,
    timed_out: bool,
}

fn run_with_timeout(command: &mut Command, timeout: Duration) -> Result<TimedOutput, String> {
    let mut child = command
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Java runtime not found. Install JDK 17+ or set JAVA_HOME. ({e})"))?;

    let start = SystemTime::now();
    loop {
        if child.try_wait().map_err(|e| e.to_string())?.is_some() {
            let output = child.wait_with_output().map_err(|e| e.to_string())?;
            return Ok(TimedOutput {
                stdout: output.stdout,
                stderr: output.stderr,
                timed_out: false,
            });
        }
        if start.elapsed().map_err(|e| e.to_string())? >= timeout {
            let _ = child.kill();
            let output = child.wait_with_output().map_err(|e| e.to_string())?;
            return Ok(TimedOutput {
                stdout: output.stdout,
                stderr: output.stderr,
                timed_out: true,
            });
        }
        thread::sleep(Duration::from_millis(25));
    }
}

fn first_meaningful_lines(text: &str, limit: usize) -> String {
    text.lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .take(limit)
        .collect::<Vec<_>>()
        .join("\n")
}

fn extract_java_test_names(test_code: &str) -> Vec<String> {
    let mut names = Vec::new();
    for line in test_code.lines() {
        let Some(idx) = line.find("test_") else {
            continue;
        };
        let rest = &line[idx..];
        let name: String = rest
            .chars()
            .take_while(|ch| ch.is_ascii_alphanumeric() || *ch == '_')
            .collect();
        if !name.is_empty()
            && rest[name.len()..].trim_start().starts_with('(')
            && !names.contains(&name)
        {
            names.push(name);
        }
    }
    names
}

fn compose_java_test_harness(test_code: &str, test_names: &[String]) -> String {
    let test_array = test_names
        .iter()
        .map(|name| format!("\"{}\"", java_string_escape(name)))
        .collect::<Vec<_>>()
        .join(", ");
    format!(
        r#"
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.Objects;

public class KataTest {{
  static final Solution solution = new Solution();

  {test_code}

  public static void main(String[] args) {{
    String[] tests = new String[] {{ {test_array} }};
    for (String name : tests) {{
      try {{
        KataTest.class.getDeclaredMethod(name).invoke(null);
        emitPass(name);
      }} catch (InvocationTargetException e) {{
        Throwable root = e.getCause() == null ? e : e.getCause();
        emitFailure(name, root);
      }} catch (Throwable e) {{
        emitFailure(name, e);
      }}
    }}
  }}

  static void assertEquals(Object expected, Object actual) {{
    assertEquals(expected, actual, null);
  }}

  static void assertEquals(Object expected, Object actual, String message) {{
    if (!deepEquals(expected, actual)) {{
      throw new AssertionError("__ASSERT__\"error\":\"" + jsonEscape(message != null ? message : ("Expected " + render(expected) + ", got " + render(actual))) + "\",\"expected\":\"" + jsonEscape(render(expected)) + "\",\"got\":\"" + jsonEscape(render(actual)) + "\"");
    }}
  }}

  static void assertArrayEquals(int[] expected, int[] actual) {{
    assertEquals(expected, actual);
  }}

  static void assertArrayEquals(int[] expected, int[] actual, String message) {{
    assertEquals(expected, actual, message);
  }}

  static void assertTrue(boolean condition) {{
    assertTrue(condition, "Expected true, got false");
  }}

  static void assertTrue(boolean condition, String message) {{
    if (!condition) throw new AssertionError(message);
  }}

  static void assertFalse(boolean condition) {{
    assertFalse(condition, "Expected false, got true");
  }}

  static void assertFalse(boolean condition, String message) {{
    if (condition) throw new AssertionError(message);
  }}

  static boolean deepEquals(Object expected, Object actual) {{
    if (expected == actual) return true;
    if (expected == null || actual == null) return false;
    if (expected instanceof int[] && actual instanceof int[]) return Arrays.equals((int[]) expected, (int[]) actual);
    if (expected instanceof long[] && actual instanceof long[]) return Arrays.equals((long[]) expected, (long[]) actual);
    if (expected instanceof double[] && actual instanceof double[]) return Arrays.equals((double[]) expected, (double[]) actual);
    if (expected instanceof boolean[] && actual instanceof boolean[]) return Arrays.equals((boolean[]) expected, (boolean[]) actual);
    if (expected instanceof Object[] && actual instanceof Object[]) return Arrays.deepEquals((Object[]) expected, (Object[]) actual);
    return Objects.equals(expected, actual);
  }}

  static String render(Object value) {{
    if (value == null) return "null";
    if (value instanceof int[]) return Arrays.toString((int[]) value);
    if (value instanceof long[]) return Arrays.toString((long[]) value);
    if (value instanceof double[]) return Arrays.toString((double[]) value);
    if (value instanceof boolean[]) return Arrays.toString((boolean[]) value);
    if (value instanceof Object[]) return Arrays.deepToString((Object[]) value);
    return String.valueOf(value);
  }}

  static void emitPass(String name) {{
    System.out.println("{{\"name\":\"" + jsonEscape(name) + "\",\"passed\":true}}");
  }}

  static void emitFailure(String name, Throwable error) {{
    String msg = error.getMessage() == null ? error.toString() : error.getMessage();
    if (msg.startsWith("__ASSERT__")) {{
      System.out.println("{{\"name\":\"" + jsonEscape(name) + "\",\"passed\":false," + msg.substring(10) + "}}");
      return;
    }}
    System.out.println("{{\"name\":\"" + jsonEscape(name) + "\",\"passed\":false,\"error\":\"" + jsonEscape(msg) + "\"}}");
  }}

  static String jsonEscape(String raw) {{
    return raw
      .replace("\\", "\\\\")
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("\r", "\\r")
      .replace("\t", "\\t");
  }}
}}
"#,
    )
}

fn java_string_escape(raw: &str) -> String {
    raw.replace('\\', "\\\\").replace('"', "\\\"")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(TerminalState::default())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            agent_context_path,
            close_terminal,
            resize_terminal,
            spawn_terminal,
            write_agent_context,
            write_terminal,
            show_editor_context_menu,
            show_kata_context_menu,
            run_java_tests
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let command_palette_item = MenuItem::with_id(
                app,
                "cmd:app:command-palette",
                "Command Palette...",
                true,
                Some("CmdOrCtrl+Shift+P"),
            )?;
            let settings_item = MenuItem::with_id(
                app,
                "cmd:app:settings",
                "Settings...",
                true,
                Some("CmdOrCtrl+,"),
            )?;
            let new_kata_item =
                MenuItem::with_id(app, "cmd:nav:new-kata", "New Kata", true, None::<&str>)?;
            let practice_item = MenuItem::with_id(
                app,
                "cmd:practice:start-or-resume",
                "Start or Resume Practice",
                true,
                None::<&str>,
            )?;
            let run_tests_item = MenuItem::with_id(
                app,
                "cmd:editor:run-tests",
                "Run Tests",
                true,
                Some("CmdOrCtrl+Enter"),
            )?;
            let prev_kata_item = MenuItem::with_id(
                app,
                "cmd:editor:previous-kata",
                "Previous Kata",
                true,
                None::<&str>,
            )?;
            let next_kata_item =
                MenuItem::with_id(app, "cmd:editor:next-kata", "Next Kata", true, None::<&str>)?;
            let toggle_problem_panel_item = MenuItem::with_id(
                app,
                "cmd:editor:toggle-problem-panel",
                "Toggle Problem Panel",
                true,
                None::<&str>,
            )?;
            let toggle_solution_item = MenuItem::with_id(
                app,
                "cmd:editor:toggle-solution",
                "Toggle Solutions",
                true,
                Some("CmdOrCtrl+Shift+S"),
            )?;
            let toggle_repl_item = MenuItem::with_id(
                app,
                "cmd:editor:toggle-repl",
                "Toggle REPL",
                true,
                None::<&str>,
            )?;
            let open_terminal_item = MenuItem::with_id(
                app,
                "cmd:editor:open-agent-terminal",
                "Open Terminal",
                true,
                None::<&str>,
            )?;
            let open_claude_terminal_item = MenuItem::with_id(
                app,
                "cmd:editor:open-claude-terminal",
                "Open Claude Terminal",
                true,
                None::<&str>,
            )?;
            let open_codex_terminal_item = MenuItem::with_id(
                app,
                "cmd:editor:open-codex-terminal",
                "Open Codex Terminal",
                true,
                None::<&str>,
            )?;
            let copy_solution_item = MenuItem::with_id(
                app,
                "cmd:editor:copy-solution",
                "Copy Selected Solution to Editor",
                true,
                None::<&str>,
            )?;
            let reset_code_item = MenuItem::with_id(
                app,
                "cmd:editor:reset-code",
                "Reset Code",
                true,
                None::<&str>,
            )?;
            let open_leetcode_item = MenuItem::with_id(
                app,
                "cmd:editor:open-leetcode",
                "Open on LeetCode",
                true,
                None::<&str>,
            )?;
            let zoom_in_item = MenuItem::with_id(
                app,
                "cmd:view:zoom-in",
                "Zoom In",
                true,
                Some("CmdOrCtrl+="),
            )?;
            let zoom_out_item = MenuItem::with_id(
                app,
                "cmd:view:zoom-out",
                "Zoom Out",
                true,
                Some("CmdOrCtrl+-"),
            )?;
            let actual_size_item = MenuItem::with_id(
                app,
                "cmd:view:actual-size",
                "Actual Size",
                true,
                Some("CmdOrCtrl+0"),
            )?;

            let app_submenu = SubmenuBuilder::new(app, "App")
                .about(None)
                .separator()
                .item(&settings_item)
                .separator()
                .services()
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;

            let edit_submenu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;

            let file_submenu = SubmenuBuilder::new(app, "File")
                .item(&new_kata_item)
                .separator()
                .item(&practice_item)
                .build()?;

            let kata_submenu = SubmenuBuilder::new(app, "Kata")
                .item(&run_tests_item)
                .separator()
                .item(&prev_kata_item)
                .item(&next_kata_item)
                .separator()
                .item(&toggle_problem_panel_item)
                .item(&toggle_solution_item)
                .item(&toggle_repl_item)
                .item(&open_terminal_item)
                .item(&open_claude_terminal_item)
                .item(&open_codex_terminal_item)
                .separator()
                .item(&copy_solution_item)
                .item(&reset_code_item)
                .separator()
                .item(&open_leetcode_item)
                .build()?;

            let devtools_item = MenuItem::with_id(
                app,
                "toggle-devtools",
                "Toggle Web Inspector",
                true,
                Some("CmdOrCtrl+Alt+I"),
            )?;

            let view_submenu = SubmenuBuilder::new(app, "View")
                .item(&command_palette_item)
                .separator()
                .item(&zoom_in_item)
                .item(&zoom_out_item)
                .item(&actual_size_item)
                .separator()
                .item(&devtools_item)
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&app_submenu)
                .item(&file_submenu)
                .item(&edit_submenu)
                .item(&kata_submenu)
                .item(&view_submenu)
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                let id = event.id().as_ref();
                if let Some(command_id) = id.strip_prefix("cmd:") {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit(
                            "menu:run-command",
                            serde_json::json!({
                                "commandId": command_id,
                            }),
                        );
                    }
                    return;
                }
                if id == "settings" {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu:open-settings", ());
                    }
                    return;
                }
                if id == "toggle-devtools" {
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_devtools_open() {
                            window.close_devtools();
                        } else {
                            window.open_devtools();
                        }
                    }
                    return;
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
