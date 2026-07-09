use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager};
use tauri::menu::{ContextMenu, MenuBuilder, MenuItem, MenuItemBuilder, SubmenuBuilder};

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
    let favorite_label = if is_favorite { "Remove from Favorites" } else { "Add to Favorites" };

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

// WKWebView on macOS suspends a backgrounded window's renderer process to
// save memory, and occasionally fails to repaint it when the window regains
// focus (renderer process silently gone, leaving a blank webview). The
// frontend pings `heartbeat` on an interval; if that stops landing for a
// while and the window then regains focus, we force a reload rather than
// leaving the user stuck on a dead window.
struct HeartbeatState(Mutex<Instant>);

const HEARTBEAT_STALE_AFTER: Duration = Duration::from_secs(6);
const HEARTBEAT_WATCHDOG_INTERVAL: Duration = Duration::from_secs(3);
const HEARTBEAT_RELOAD_COOLDOWN: Duration = Duration::from_secs(10);

#[tauri::command]
fn heartbeat(state: tauri::State<HeartbeatState>) {
    if let Ok(mut last) = state.0.lock() {
        *last = Instant::now();
    }
}

fn is_stale_heartbeat(last: Instant, now: Instant) -> bool {
    now.duration_since(last) > HEARTBEAT_STALE_AFTER
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
        .manage(HeartbeatState(Mutex::new(Instant::now())))
        .invoke_handler(tauri::generate_handler![heartbeat, show_kata_context_menu])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let settings_item = MenuItem::with_id(app, "settings", "Settings...", true, Some("CmdOrCtrl+,"))?;

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

            let devtools_item = MenuItem::with_id(
                app,
                "toggle-devtools",
                "Toggle Web Inspector",
                true,
                Some("CmdOrCtrl+Alt+I"),
            )?;

            let view_submenu = SubmenuBuilder::new(app, "View")
                .item(&devtools_item)
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&app_submenu)
                .item(&edit_submenu)
                .item(&view_submenu)
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                let id = event.id().as_ref();
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
                        if let (Some(window), Ok(kata_id)) = (app.get_webview_window("main"), kata_id.parse::<i64>()) {
                            let _ = window.emit("kata-context-action", serde_json::json!({
                                "action": action,
                                "kataId": kata_id,
                            }));
                        }
                    }
                }
            });

            if let Some(window) = app.get_webview_window("main") {
                let watchdog = window.clone();
                std::thread::spawn(move || {
                    let mut last_reload: Option<Instant> = None;
                    loop {
                        std::thread::sleep(HEARTBEAT_WATCHDOG_INTERVAL);

                        let now = Instant::now();
                        let state = watchdog.state::<HeartbeatState>();
                        let stale = state
                            .0
                            .lock()
                            .map(|last| is_stale_heartbeat(*last, now))
                            .unwrap_or(false);

                        let recently_reloaded = last_reload
                            .map(|last| now.duration_since(last) < HEARTBEAT_RELOAD_COOLDOWN)
                            .unwrap_or(false);

                        if stale && !recently_reloaded {
                            let _ = watchdog.reload();
                            last_reload = Some(now);
                        }
                    }
                });

                let handle = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(true) = event {
                        let handle = handle.clone();
                        std::thread::spawn(move || {
                            std::thread::sleep(Duration::from_millis(1200));
                            let state = handle.state::<HeartbeatState>();
                            let stale = state
                                .0
                                .lock()
                                .map(|last| is_stale_heartbeat(*last, Instant::now()))
                                .unwrap_or(false);
                            if stale {
                                // .reload() goes through the native webview dispatcher, unlike
                                // .eval() which requires a live JS execution context to receive
                                // the script — the whole point here is that context may be dead.
                                let _ = handle.reload();
                            }
                        });
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stale_heartbeat_requires_more_than_threshold() {
        let now = Instant::now();

        assert!(!is_stale_heartbeat(now - HEARTBEAT_STALE_AFTER, now));
        assert!(is_stale_heartbeat(
            now - HEARTBEAT_STALE_AFTER - Duration::from_millis(1),
            now,
        ));
    }
}
