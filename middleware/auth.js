const electron = require("electron");
const env = require('./env.json');
const apiToken = env.auth.apiToken;

const {
    BrowserWindow
} = electron;

function authControl() {
    if (!apiToken) {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 800,
            titleBarStyle: "hidden",
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                preload: path.join(__dirname, 'loader.js')
            }
        });

        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "login.html"),
                protocol: 'file',
                slashes: true
            })
        );
    } else {
        mainWindow = new BrowserWindow({
            width: 1800,
            height: 768,
            titleBarStyle: "hidden",
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                preload: path.join(__dirname, 'loader.js')
            }
        });

        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "main.html"),
                protocol: 'file',
                slashes: true
            })
        );
    }
}

authControl();
