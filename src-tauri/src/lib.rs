use serde::{Deserialize, Serialize};
use std::{
    env, fs,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::menu::{ContextMenu, MenuBuilder, MenuItem, MenuItemBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};

const JAVA_RUN_TIMEOUT: Duration = Duration::from_secs(5);

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

// Native right-click menu for a kata row in the Problems table. Item ids
// encode the action + kata id ("kata-ctx-<action>:<id>") so the single
// app-wide on_menu_event handler below can route them by re-emitting a
// "kata-context-action" event — the frontend owns navigation/store state/
// clipboard, this just shows the native menu and relays which item fired.
#[tauri::command]
fn show_kata_context_menu(
    app: tauri::AppHandle,
    window: tauri::Window,
    kata_id: i64,
    is_favorite: bool,
) -> Result<(), String> {
    let favorite_label = if is_favorite {
        "Remove from Favorites"
    } else {
        "Add to Favorites"
    };

    let start = MenuItemBuilder::with_id(format!("kata-ctx-start:{kata_id}"), "Start Kata")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let favorite = MenuItemBuilder::with_id(format!("kata-ctx-favorite:{kata_id}"), favorite_label)
        .build(&app)
        .map_err(|e| e.to_string())?;
    let reset = MenuItemBuilder::with_id(format!("kata-ctx-reset:{kata_id}"), "Reset Progress")
        .build(&app)
        .map_err(|e| e.to_string())?;
    let copy = MenuItemBuilder::with_id(format!("kata-ctx-copy:{kata_id}"), "Copy Kata Name")
        .build(&app)
        .map_err(|e| e.to_string())?;

    let menu = MenuBuilder::new(&app)
        .item(&start)
        .separator()
        .item(&favorite)
        .item(&reset)
        .separator()
        .item(&copy)
        .build()
        .map_err(|e| e.to_string())?;

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
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
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
                if let Some(rest) = id.strip_prefix("kata-ctx-") {
                    if let Some((action, kata_id)) = rest.split_once(':') {
                        if let (Some(window), Ok(kata_id)) =
                            (app.get_webview_window("main"), kata_id.parse::<i64>())
                        {
                            let _ = window.emit(
                                "kata-context-action",
                                serde_json::json!({
                                    "action": action,
                                    "kataId": kata_id,
                                }),
                            );
                        }
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
