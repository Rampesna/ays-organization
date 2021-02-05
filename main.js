const electron = require("electron");
const url = require("url");
const path = require("path");

const mainMenuTemplate = [
    {
        label: 'Geliştirici Penceresi',
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        }
    }
];

const {
    app,
    BrowserWindow,
    Menu
} = electron;

let mainWindow;

app.on('ready', () => {
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
        width: 1366,
        height: 768
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "main.html"),
            protocol: 'file',
            slashes: true
        })
    );

    const {ipcMain, dialog} = require('electron')

    ipcMain.on("customShutdownRenderer", () => {
        app.quit();
    })

    Menu.setApplicationMenu(mainMenu);

});


try {
    require('electron-reloader')(module)
} catch (_) {}