const {app, BrowserWindow} = require('electron')
const unhandled = require('electron-unhandled');
require('./ipc')

unhandled();

const path = require('path');
const url = require('url');

let mainWindow;

// app.setName('Sphinx Chat');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 999, height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // We set an intercept on incoming requests to disable x-frame-options headers.
    mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: [ "*://*/*" ] },
        (d, c)=>{
            if(d.responseHeaders['X-Frame-Options']){
                delete d.responseHeaders['X-Frame-Options'];
            } else if(d.responseHeaders['x-frame-options']) {
                delete d.responseHeaders['x-frame-options'];
            }
            c({cancel: false, responseHeaders: d.responseHeaders});
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

    if(process.env.ELECTRON_DEV_URL) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null
    })
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



