const { app, dialog, ipcMain, shell, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let mainWindow;

const startUrl = isDev ? "http://localhost:3000" : url.format({
  pathname: path.join(__dirname, '..', 'build', 'index.html'),
  protocol: 'file:',
  slashes: true,
});

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// PDF
function createPDF(path) {
  dialog.showSaveDialog(mainWindow, {
    title: "Save PDF",
    filters: [{
      name: "PDF Document",
      extensions: ["pdf"]
    }]
  }).then(({filePath, canceled}) => {
    if (canceled) {
      return false;
    }

    let win = new BrowserWindow({
      x: 0,
      y: 0,
      show: false,
      enableLargerThanScreen: true,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true
      }
    })

    win.webContents.on('did-stop-loading', () => {
      win.webContents.insertCSS('::-webkit-scrollbar { display: none; } nav, footer, .LegalNotes, .PrintNotes, .WIP { display: none; }')
         .then(() => {
           setTimeout(() => {
             win.webContents.printToPDF({
               marginsType: 0,
               printBackground: true
             }).then((buffer) => {
               fs.writeFileSync(filePath, buffer);
               shell.openPath(filePath);
               win.close();
             });
           }, 100);
         });
    });

    win.loadURL(`${startUrl}#${path}`);
  });
}

ipcMain.on('pdf', (event, path) => {
  createPDF(path);
});

// Screenshots
function createScreenshot(path, width, height) {
  dialog.showSaveDialog(mainWindow, {
    title: "Save Screenshot",
    filters: [{
      name: "PNG Image",
      extensions: ["png"]
    }]
  }).then(({filePath, canceled}) => {
    if (canceled) {
      return false;
    }

    let win = new BrowserWindow({
      x: 0,
      y: 0,
      width,
      height,
      show: false,
      enableLargerThanScreen: true,
      frame: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: true
      }
    })

    win.webContents.on('did-stop-loading', () => {
      win.webContents.insertCSS('::-webkit-scrollbar { display: none; } nav, footer, .LegalNotes, .PrintNotes, .WIP { display: none; }')
         .then(() => {
           setTimeout(() => {
             win.webContents.capturePage()
                .then((image) => {
                  let buffer = image.toPNG();
                  fs.writeFileSync(filePath, buffer);
                  shell.openPath(filePath);
                  win.close();
                });
           }, 100);
         });
    });

    win.loadURL(`${startUrl}#${path}`);
  });
}

ipcMain.on('screenshot', (event, path, width, height) => {
  createScreenshot(path, width, height);
});
