const path = require("path");
const notifier = require("node-notifier");
const { app, Menu, Tray, globalShortcut } = require("electron");
const {
  setToken,
  getTempUploadHistory,
  uploadImageFromClipboard
} = require("./image-upload.js");
let tray = null;

const uploadImage = () =>
  uploadImageFromClipboard()
    .then(url => {
      notifier.notify({
        title: "上传成功，已将markdown图片复制到剪切板",
        message: url
      });
    })
    .catch(e => {
      notifier.notify({
        title: "上传失败",
        message: e.message
      });
    });

const MenuConfig = [
  {
    label: "设置 API token",
    click: () => setToken(),
    accelerator: "CommandOrControl+Option+S"
  },
  {
    label: "将剪切板的图片上传至图床",
    click: () => uploadImage(),
    accelerator: "CommandOrControl+Option+U"
  },
  //   {
  //     label: "chan'kan",
  //     click: () => getTempUploadHistory(),
  //     accelerator: "CommandOrControl+N+H"
  //   },
  {
    label: "Quit",
    click: () => app.quit(),
    accelerator: "CommandOrControl+Q"
  }
];

const GlobalShortCutConfig = [
  {
    accelerator: "CommandOrControl+Option+U",
    click() {
      uploadImageFromClipboard();
    }
  }
];

const setupGlobalShortCuts = () => {
  GlobalShortCutConfig.forEach(({ accelerator, click }) =>
    globalShortcut.register(accelerator, click)
  );
};

app.on("ready", () => {
  if (app.dock) {
    app.dock.hide();
  }
  tray = new Tray(path.join(__dirname, "icons", "ninja.png"));
  const menu = Menu.buildFromTemplate(MenuConfig);
  setupGlobalShortCuts();
  tray.setToolTip("md-ninja");
  tray.setContextMenu(menu);
  console.log("ready");
});
