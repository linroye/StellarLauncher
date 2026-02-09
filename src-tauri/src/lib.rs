// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::Emitter;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

static PROCESS_LIST: Lazy<Mutex<HashMap<i32, CommandChild>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
async fn run_frpc(app: tauri::AppHandle, id: i32, token: String) -> Result<(), String> {
    let sidecar_command = app
        .shell()
        .sidecar("frpc")
        .map_err(|e| format!("Failed to create sidecar command: {}", e))?
        .args(["-u", token.as_str(), "-t", id.to_string().as_str(), "-d"]);
    
    let (mut rx, child) = sidecar_command
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

    PROCESS_LIST.lock().unwrap().insert(id, child);

    tauri::async_runtime::spawn(async move {
        // 监听消息
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let line_str = String::from_utf8_lossy(&line);
                    app.emit(&format!("message-{}", id), Some(format!("'{}'", line_str)))
                        .expect("failed to emit event");
                }
                CommandEvent::Stderr(line) => {
                    let line_str = String::from_utf8_lossy(&line);
                    app.emit(&format!("message-{}", id), Some(format!("'[E] {}'", line_str)))
                        .expect("failed to emit event");
                }
                CommandEvent::Error(err) => {
                    app.emit(&format!("error-{}", id), Some(format!("Error: {}", err)))
                        .expect("failed to emit event");
                }
                CommandEvent::Terminated(payload) => {
                    if let Some(code) = payload.code {
                        if code != 0 {
                            app.emit(&format!("terminated-{}", id), Some(format!("Process terminated with exit code: {}", code)))
                                .expect("failed to emit event");
                        } else {
                            app.emit(&format!("terminated-{}", id), Some(format!("Process terminated with exit code: {}", code)))
                                .expect("failed to emit event");
                        }
                    } else if let Some(signal) = payload.signal {
                        app.emit(&format!("terminated-{}", id), Some(format!("Process terminated with signal: {}", signal)))
                            .expect("failed to emit event");
                    }
                }
                _ => {}
            }
        }
    });
    
    Ok(())
}

#[tauri::command]
fn stop_frpc(id: i32) {
    if let Some(child) = PROCESS_LIST.lock().unwrap().remove(&id) {
        child.kill().expect("Failed to kill process");
    }
}

#[tauri::command]
async fn get_local_ports() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "windows")]
    {
        use std::collections::HashMap;
        let output = std::process::Command::new("netstat")
            .args(["-ano"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| e.to_string())?;
        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut tcp_ports = Vec::new();
        let mut udp_ports = Vec::new();
        let mut pid_map: HashMap<u32, String> = HashMap::new();
        // 获取进程名
        if let Ok(tasklist) = std::process::Command::new("tasklist")
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            let taskout = String::from_utf8_lossy(&tasklist.stdout);
            for line in taskout.lines().skip(3) {
                let parts: Vec<_> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(pid) = parts[1].parse::<u32>() {
                        pid_map.insert(pid, parts[0].to_string());
                    }
                }
            }
        }
        for line in stdout.lines() {
            let line = line.trim();
            let parts: Vec<_> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let proto = parts[0].to_uppercase();
                let addr = parts[1];
                let pid = parts.last().and_then(|s| s.parse::<u32>().ok());
                if let Some(idx) = addr.rfind(':') {
                    if let Ok(port) = addr[idx + 1..].parse::<u16>() {
                        let process = pid.and_then(|p| pid_map.get(&p)).cloned();
                        let entry = serde_json::json!({
                            "port": port,
                            "pid": pid,
                            "process": process,
                        });
                        if proto.starts_with("TCP") {
                            tcp_ports.push(entry);
                        } else if proto.starts_with("UDP") {
                            udp_ports.push(entry);
                        }
                    }
                }
            }
        }
        return Ok(serde_json::json!({ "tcp": tcp_ports, "udp": udp_ports }));
    }
    #[cfg(not(target_os = "windows"))]
    {
        use std::collections::HashMap;
        let output = std::process::Command::new("netstat")
            .args(["-tunlp"])
            .output()
            .map_err(|e| e.to_string())?;
        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut tcp_ports = Vec::new();
        let mut udp_ports = Vec::new();
        let mut pid_map: HashMap<u32, String> = HashMap::new();
        // 解析 /proc 获取进程名
        if let Ok(entries) = std::fs::read_dir("/proc") {
            for entry in entries.flatten() {
                if let Ok(pid) = entry.file_name().to_string_lossy().parse::<u32>() {
                    if let Ok(cmdline) = std::fs::read_to_string(format!("/proc/{}/cmdline", pid)) {
                        let name = cmdline
                            .split('\0')
                            .next()
                            .unwrap_or("")
                            .split('/')
                            .last()
                            .unwrap_or("")
                            .to_string();
                        pid_map.insert(pid, name);
                    }
                }
            }
        }
        for line in stdout.lines() {
            let line = line.trim();
            let parts: Vec<_> = line.split_whitespace().collect();
            if parts.len() >= 6 {
                let proto = parts[0].to_lowercase();
                let addr = parts[3];
                let pid_info = parts[6];
                let pid = pid_info
                    .split('/')
                    .next()
                    .and_then(|s| s.parse::<u32>().ok());
                if let Some(idx) = addr.rfind(':') {
                    if let Ok(port) = addr[idx + 1..].parse::<u16>() {
                        let process = pid.and_then(|p| pid_map.get(&p)).cloned();
                        let entry = serde_json::json!({
                            "port": port,
                            "pid": pid,
                            "process": process,
                        });
                        if proto.starts_with("tcp") {
                            tcp_ports.push(entry);
                        } else if proto.starts_with("udp") {
                            udp_ports.push(entry);
                        }
                    }
                }
            }
        }
        return Ok(serde_json::json!({ "tcp": tcp_ports, "udp": udp_ports }));
    }
    #[allow(unreachable_code)]
    Ok(serde_json::json!({ "tcp": [], "udp": [] }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            // 判断args长度以确保有传入URL参数
            if args.len() < 2 {
                return;
            }
            let url = args[1].clone();
            app.emit("deep-link", url).unwrap();
        }))
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
       
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            run_frpc,
            stop_frpc,
            get_local_ports
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
