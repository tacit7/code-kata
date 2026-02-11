use sha2::{Sha256, Digest};

#[tauri::command]
fn get_hw_fingerprint() -> Result<String, String> {
    use sysinfo::System;

    let mut sys = System::new_all();
    sys.refresh_all();

    // Combine: hostname + OS + CPU count + total memory
    let hostname = System::host_name().unwrap_or_else(|| "unknown".to_string());
    let os = System::name().unwrap_or_else(|| "unknown".to_string());
    let cpu_count = sys.cpus().len().to_string();
    let total_mem = sys.total_memory().to_string();

    let fingerprint_data = format!("{}-{}-{}-{}", hostname, os, cpu_count, total_mem);

    // Hash it for privacy
    let mut hasher = Sha256::new();
    hasher.update(fingerprint_data.as_bytes());
    let result = hasher.finalize();

    Ok(format!("{:x}", result))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![get_hw_fingerprint])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
