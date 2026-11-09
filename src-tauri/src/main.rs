#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

fn main() {
    // Linux 上 WebKitGTK 偶发整窗黑屏，常见两类根因：
    //   1) 新版 WebKitGTK 默认走 dmabuf 渲染路径的已知回归；
    //   2) 无边框窗口（decorations:false）在 Wayland 会话下渲染异常。
    // 在 WebKit/GTK 初始化之前设置环境变量即可规避，无需改动界面或降级体验。
    #[cfg(target_os = "linux")]
    {
        // 关闭 dmabuf 渲染器，回退到共享内存渲染路径，解决绝大多数黑屏。
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        // 若系统存在 X11/XWayland 显示（DISPLAY 已设置），强制 GTK 走 X11 后端，
        // 规避原生 Wayland 下无边框窗口黑屏；纯 Wayland（无 XWayland）则仍走 Wayland。
        if std::env::var_os("DISPLAY").is_some() {
            std::env::set_var("GDK_BACKEND", "x11");
        }
    }

    huangguo_client_lib::run()
}
