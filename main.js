const electron = require("electron")
const url = require("url")
const path = require("path")
const fileSystem = require('fs')
const envFile = './env.json'
const envVariables = require(envFile)
const axios = require('axios')

const {
    app,
    Menu,
    ipcMain,
    BrowserWindow
} = electron;

const mainMenuTemplate = [
    {
        label: 'Geliştirici Penceresi',
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        }
    }
];

let applicationWindow

function storeApiToken(user, model) {
    envVariables.auth.user = user
    envVariables.auth.user.model = model
    envVariables.auth.apiToken = user.api_token
    fileSystem.writeFile(__dirname + '/' + envFile, JSON.stringify(envVariables), () => {
    });
}

function clearApiToken() {
    envVariables.auth.user = null
    envVariables.auth.apiToken = ""
    fileSystem.writeFile(__dirname + '/' + envFile, JSON.stringify(envVariables), () => {
    });
}

app.on('ready', () => {
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    if (!envVariables.auth.apiToken) {
        loginWindow = new BrowserWindow({
            width: 900,
            height: 700,
            titleBarStyle: "hidden",
            frame: false,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });

        loginWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "login.html"),
                protocol: 'file',
                slashes: true
            })
        );
    } else {
        applicationWindow = new BrowserWindow({
            width: 1800,
            height: 650,
            titleBarStyle: "hidden",
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        applicationWindow.setPosition(applicationWindow.getPosition()[0], 10)
        applicationWindow.toggleDevTools()

        applicationWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "main.html"),
                protocol: 'file',
                slashes: true
            })
        );
    }

    ipcMain.on('login', (err, data) => {
        axios.post('http://192.168.2.31:8000/api/v1/authentication/login',
            {
                email: data.email,
                password: data.password,
                model: data.model
            }).then((response) => {
            if (response.data.progress_code === "0003") {
                mainWindow.webContents.send('userNotFound', response.data);
            } else if (response.data.progress_code === "0007") {
                mainWindow.webContents.send('failedLogin', response.data);
            } else if (response.data.progress_code === "A000") {
                storeApiToken(response.data.content, data.model)

                applicationWindow = new BrowserWindow({
                    width: 1800,
                    height: 650,
                    titleBarStyle: "hidden",
                    frame: false,
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                        preload: path.join(__dirname, 'preload.js')
                    }
                });

                applicationWindow.setPosition(applicationWindow.getPosition()[0], 10)
                applicationWindow.toggleDevTools()

                applicationWindow.loadURL(
                    url.format({
                        pathname: path.join(__dirname, "main.html"),
                        protocol: 'file',
                        slashes: true
                    })
                );

                loginWindow.close();
                loginWindow = null;
            }
        }, (error) => {
            console.log(error);
        });
    });

    ipcMain.on('logout', (err, data) => {
        clearApiToken();

        loginWindow = new BrowserWindow({
            width: 900,
            height: 700,
            titleBarStyle: "hidden",
            frame: false,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });

        loginWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "login.html"),
                protocol: 'file',
                slashes: true
            })
        );

        applicationWindow.close();
        applicationWindow = null;
    });
});

// try {
//     require('electron-reloader')(module)
// } catch (error) {
//     console.log(error);
// }
