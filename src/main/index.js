'use strict'
import env from 'common/env'
import {app, BrowserWindow, screen} from 'electron'
import * as path from 'path'
import {format as formatUrl} from 'url'
import initDevTools from './dev/initDevTools'
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const display = screen.getPrimaryDisplay()
  const maxiSize = display.workAreaSize
  const window = new BrowserWindow({
    webPreferences: {nodeIntegration: true, contextIsolation: false},
    height: maxiSize.height,
    width: maxiSize.width
  })

  let url

  if (env.isDevelopment) {
    url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    initDevTools(window, true)
  } else {
    url = formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    })
  }

  window.on('error', error => {
    console.error({error})
  })
  window.on('closed', () => {
    mainWindow = null
  })

  window.loadURL(url)

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})

app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
});

if (module.hot) {
  module.hot.accept()
}
