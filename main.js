const electron = require("electron");
const url = require("url");
const path = require("path");
const net = require('net');
const fileSystem = require('fs');

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

    try {
        let apiToken = require('./authentication.json').apiToken;
        mainWindow = new BrowserWindow({
            width: 1800,
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
    } catch (exception) {
        mainWindow = new BrowserWindow({
            width: 900,
            height: 750,
            titleBarStyle: "hidden",
            frame: true,
            minimizable: false,
            maximizable: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
            }
        });

        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "login.html"),
                protocol: 'file',
                slashes: true
            })
        );
    }

    ipcMain.on('login', (err, data) => {
        const {net} = require('electron')
        const request = net.request({
            method: 'post',
            protocol: 'http:',
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/organization/login',
            data: {
                email: data.email,
                password: data.password
            }
        })

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                fileSystem.writeFileSync('authentication.json', chunk.toString('utf-8'), 'utf-8');
            });
        })
        request.end()
    });
});

try {
    require('electron-reloader')(module)
} catch (error) {
    console.log(error);
}