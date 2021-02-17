const electron = require("electron");
const url = require("url");
const path = require("path");

const {
    app,
    Menu,
    ipcMain,
    BrowserWindow,
    session
} = electron;

const mainMenuTemplate = [
    {
        label: 'Geliştirici Penceresi',
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        }
    }
];

let mainWindow;

app.on('ready', () => {
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    mainWindow = new BrowserWindow({
        width: 1600,
        height: 800,
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
