import { app, BrowserWindow, ipcMain, screen, session } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as https from 'https';
import * as querystring from 'querystring';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// namdien177 - github oauth app
const GITHUB_OAUTH = {
  redirect_uri: 'http://localhost:4200',
  url: `https://github.com/login/oauth/authorize?`,
  client_id: 'b2c1fa872f64704b94a4',
  client_secret: '1e3c5e56102b01548e6f8b450eb7df8afc5b8b56',
  // Full access public & private repo.
  // More Infor: https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
  scopes: ['repo']
};

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: size.width / 2 - (size.width > 1280 ? 1280 : size.width) / 2,
    y: size.height / 2 - (size.height > 720 ? 720 : size.height) / 2,
    width: size.width > 1280 ? 1280 : size.width,
    height: size.height > 720 ? 720 : size.height,
    frame: false,
    minHeight: 620,
    minWidth: 1050,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${ __dirname }/node_modules/electron`),
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true,
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
    // BrowserWindow.addDevToolsExtension(
    //   path.join(os.homedir(), '/AppData/Local/Google/Chrome/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0'),
    // );
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

ipcMain.on('github-authenticate', function (event, arg) {
  let access_token = null;
  let crashError = null;
  const filter = {
    urls: ['https://*.github.com/*']
  };
  const githubAuthUrl = `${ GITHUB_OAUTH.url }client_id=${ GITHUB_OAUTH.client_id }&scope=${ GITHUB_OAUTH.scopes }`;
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  const authWindow = new BrowserWindow({
    width: size.width > 1280 ? 1280 : size.width,
    height: size.height > 720 ? 720 : size.height,
    show: false,
    parent: win,
    modal: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false
    }
  });
  authWindow.loadURL(githubAuthUrl);
  authWindow.webContents.on('did-finish-load', function () {
    authWindow.show();
    if (serve) {
      authWindow.webContents.openDevTools();
    }
  });

  authWindow.webContents.on('will-navigate', async (eventNavigate, urlPassing) => {
    await clearSession(urlPassing, authWindow);
    const data = await handleUrl(urlPassing, authWindow);
    access_token = !!data ? data : access_token;
    authWindow.close();
  });

  session.defaultSession.webRequest.onCompleted(filter, async (details) => {
    const onCompleteUrl = details.url;
    await clearSession(onCompleteUrl, authWindow);
    access_token = await handleUrl(onCompleteUrl, authWindow);
  });

  authWindow.on('close', () => event.returnValue = { access_token, crashError });
});

async function clearSession(urlSession: string, authWindowPassing: BrowserWindow) {
  if (urlSession.includes('code=')) { // Chưa biết xử lý chỗ này như nào cho tối ưu. Hehe
    const githubSession = authWindowPassing.webContents.session;
    // clear cookies for next time login;
    await githubSession.clearStorageData({ // Clear để có thể login nhiều tài khoản chăng? Hoặc logout sẽ tiện hơn.
      storages: [
        'cookies', 'localstorage'
      ]
    });
  }
}

async function handleUrl(codeUrl, authWindow: BrowserWindow) {
  const raw_code = /code=([^&]*)/.exec(codeUrl) || null,
    code = (raw_code && raw_code.length > 1) ? raw_code[1] : null,
    error = /\?error=(.+)$/.exec(codeUrl);

  // If there is a code in the callback, proceed to get token from github
  if (code) {
    const postData = querystring.stringify({
      'client_id': GITHUB_OAUTH.client_id,
      'client_secret': GITHUB_OAUTH.client_secret,
      'code': code
    });

    const post = {
      host: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers:
        {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length,
          'Accept': 'application/json'
        }
    };

    const requestGitHub = new Promise((resolve, reject) => {
      const req = https.request(post, function (response) {
        let result = '';
        response.on('data', function (data) {
          result = result + data;
        });
        response.on('end', function () {
          const json = JSON.parse(result.toString());
          console.log('access token:' + json.access_token); // Also other information
          resolve(json.access_token);
        });
        response.on('error', function (err) {
          console.error('ERROR: ' + err.message);
          resolve(null);
        });
      });

      req.write(postData);
      req.end();
    });
    return await requestGitHub;
  } else if (error) {
    console.error('couldnt login to github!');
    return null;
  }
}
