const path = require("path");
const { app, Menu, Tray } = require("electron");

let tray = null;

app.on("ready", () => {
  if (app.dock) {
    app.dock.hide();
  }
  tray = new Tray(path.join(__dirname, "icons", "ninja.png"));
  const menu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click() {
        app.quit();
      }
    }
  ]);
  tray.setToolTip("md-ninja");
  tray.setContextMenu(menu);
  console.log("ready");
});
