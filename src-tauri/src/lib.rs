use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager};
use tauri::menu::{MenuBuilder, MenuItem, SubmenuBuilder};

// WKWebView on macOS suspends a backgrounded window's renderer process to
// save memory, and occasionally fails to repaint it when the window regains
// focus (renderer process silently gone, leaving a blank webview). The
// frontend pings `heartbeat` on an interval; if that stops landing for a
// while and the window then regains focus, we force a reload rather than
// leaving the user stuck on a dead window.
struct HeartbeatState(Mutex<Instant>);

#[tauri::command]
fn heartbeat(state: tauri::State<HeartbeatState>) {
    if let Ok(mut last) = state.0.lock() {
        *last = Instant::now();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(HeartbeatState(Mutex::new(Instant::now())))
        .invoke_handler(tauri::generate_handler![heartbeat])
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

            let menu = MenuBuilder::new(app)
                .item(&app_submenu)
                .item(&edit_submenu)
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                if event.id().as_ref() == "settings" {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("menu:open-settings", ());
                    }
                }
            });

            if let Some(window) = app.get_webview_window("main") {
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
                                .map(|last| last.elapsed() > Duration::from_secs(6))
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
