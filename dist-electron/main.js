import { app as o, BrowserWindow as a, ipcMain as c, shell as d } from "electron";
import n from "node:path";
import { fileURLToPath as p } from "node:url";
const s = n.dirname(p(import.meta.url));
process.env.DIST = n.join(s, "../dist");
process.env.VITE_PUBLIC = o.isPackaged ? process.env.DIST : n.join(s, "../public");
let e;
const i = process.env.VITE_DEV_SERVER_URL;
function l() {
  e = new a({
    width: 1200,
    height: 800,
    icon: n.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: n.join(s, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    },
    //Path A: Acrylic/Vibrancy Integration
    vibrancy: "under-window",
    // macOS
    backgroundMaterial: "acrylic",
    // Windows 11
    transparent: !0,
    titleBarStyle: "hiddenInset",
    show: !1
  }), e.once("ready-to-show", () => {
    e == null || e.show();
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(n.join(process.env.DIST, "index.html")), e.webContents.setWindowOpenHandler(({ url: t }) => (t.startsWith("https:") && d.openExternal(t), { action: "deny" }));
}
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  a.getAllWindows().length === 0 && l();
});
o.whenReady().then(l);
c.handle("execute-command", async (t, r) => (console.log(`[Electron Main] Executing native command: ${r}`), {
  stdout: `Native execution of "${r}" success.
GlassOS Kernel v1.0.4`,
  stderr: "",
  code: 0
}));
c.handle("get-system-info", () => ({
  platform: process.platform,
  arch: process.arch,
  version: o.getVersion(),
  memory: process.getProcessMemoryInfo()
}));
