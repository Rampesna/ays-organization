const electron = require("electron");
const url = require("url");
const path = require("path");

const {
    app,
    BrowserWindow,
    Menu,
    nativeTheme,
    ipcMain
} = electron;

const mainMenuTemplate = [];

let mainWindow;

app.on('ready', () => {
    nativeTheme.themeSource = 'dark';

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    mainWindow = new BrowserWindow({
        width: 1900,
        height: 768,
        titleBarStyle: "hidden",
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "main.html"),
            protocol: 'file',
            slashes: true
        })
    );

});

try {
    require('electron-reloader')(module)
} catch (error) {
    console.log(error);
}