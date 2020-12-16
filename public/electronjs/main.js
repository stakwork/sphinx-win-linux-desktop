const { app, BrowserWindow, Menu, shell, dialog, nativeImage } = require('electron')
const { Deeplink } = require('electron-deeplink');
const isDev = require('electron-is-dev');
const defaultMenu = require('electron-default-menu');
const unhandled = require('electron-unhandled');
const VERSION = require('./version')
require('./ipc')

unhandled();

app.dirname = __dirname

const path = require('path');
const url = require('url');

const iconPath = path.join(__dirname, "..", "static", "icon.png")
const appIcon = nativeImage.createFromPath(iconPath);

let mainWindow;
const protocol = "sphinx.chat"
const deeplink = new Deeplink({ app, mainWindow, protocol, isDev, debugLogging:true });

deeplink.on('received', (link) => {
    // do stuff here
    mainWindow.webContents.send('deeplink', link);

});

// app.setName('Sphinx Chat');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1150, height: 750,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
        },
    });

    // We set an intercept on incoming requests to disable x-frame-options headers.
    mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: ["*://*/*"] },
        (d, c) => {
            if (d.responseHeaders['X-Frame-Options']) {
                delete d.responseHeaders['X-Frame-Options'];
            } else if (d.responseHeaders['x-frame-options']) {
                delete d.responseHeaders['x-frame-options'];
            }
            c({ cancel: false, responseHeaders: d.responseHeaders });
        }
    );

    // and load the index.html of the app.
    // console.log(path.join(__dirname, '/../../build/index.html'))
    const startUrl = process.env.ELECTRON_DEV_URL || url.format({
        pathname: path.join(__dirname, '/../../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);

    if (process.env.ELECTRON_DEV_URL) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    let menu = defaultMenu(app, shell);
    menu[0].submenu[0] = { 
        label: 'About Sphinx', 
        click: () => {
            dialog.showMessageBox({
                message: 'Sphinx Chat \n\nVersion: '+VERSION, 
                buttons: ['OK'],
                icon: appIcon
            })
        }
    },
    menu[0].submenu.splice(menu[0].submenu.length-2,0,{
        type:'separator'
    })
    menu[0].submenu.splice(menu[0].submenu.length-2,0,{
        label: 'Profile',
        click: () => {
            mainWindow.webContents.send('profile', '')
        }
    })
    menu[0].submenu.splice(menu[0].submenu.length-2,0,{
        type:'separator'
    })
    menu[0].submenu.splice(menu[0].submenu.length-2,0,{
        label: 'Remove account from this computer',
        click: () => {
            dialog.showMessageBox({
                message: 'Are you sure you want to logout? All data will be deleted', 
                buttons: ['OK','Cancel'],
                icon: appIcon
            }).then(function(ret){
                if(ret.response===0) {
                    mainWindow.webContents.send('reset', '')
                }
            });
        }
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

