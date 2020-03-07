const path = require("path");
const notifier = require("node-notifier");
const { app, Menu, Tray } = require("electron");
const {
  setToken,
  getTempUploadHistory,
  uploadImageFromClipboard
} = require("./image-upload.js");
let tray = null;

const MenuConfig = [
  {
    label: "setup API token",
    click: () => setToken(),
    accelerator: "CommandOrControl+N+R"
  },
  {
    label: "upload image from clipboard",
    click: () =>
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
        }),
    accelerator: "CommandOrControl+N+U"
  },
  {
    label: "view history",
    click: () => getTempUploadHistory(),
    accelerator: "CommandOrControl+N+H"
  }
];

app.on("ready", () => {
  if (app.dock) {
    app.dock.hide();
  }
  tray = new Tray(path.join(__dirname, "icons", "ninja.png"));
  const menu = Menu.buildFromTemplate(MenuConfig);
  tray.setToolTip("md-ninja");
  tray.setContextMenu(menu);
  console.log("ready");
});
