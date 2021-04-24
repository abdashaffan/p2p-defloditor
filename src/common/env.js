require('dotenv').config()

import Path from 'path'
import electron from 'electron'
import os from 'os';

// Config adopted from: https://github.com/automerge/pushpin/blob/master/src/renderer/constants.ts

export const USER = process.env.USER || os.hostname();

// We want these constants available from both the main and render threads.
const app = electron.app || electron.remote.app
export const DATA_PATH = app.getPath('userData')
export const USER_PATH = Path.join(DATA_PATH, 'p2p-defloditor-react', USER)
export const HYPERMERGE_PATH = Path.join(USER_PATH, 'hypermerge')
export const LAST_WORKSPACE_URL_PATH = Path.join(HYPERMERGE_PATH, 'url.json');

export default {
  // ...process.env,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  DATA_PATH,
  USER_PATH,
  HYPERMERGE_PATH,
  LAST_WORKSPACE_URL_PATH
}
