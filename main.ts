import { app, BrowserWindow, screen, ipcMain, session } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
var https = require("https");
var querystring = require('querystring');

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

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
      electron: require(`${__dirname}/node_modules/electron`),
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
  //Manhnd - github oauth app
  const GITHUB_OAUTH = {
    redirect_uri: 'http://localhost:4200',
    url : `https://github.com/login/oauth/authorize?`,
    client_id: 'ef1953071ea4ad95f02d',
    client_secret: '3010fcc008c4254c3f502201315241e2ecf717cd',
    scopes: ["repo"] // Full access public & private repo. More Infor: https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
  }
  const githubAuthUrl = `${GITHUB_OAUTH.url}client_id=${GITHUB_OAUTH.client_id}&scope=${GITHUB_OAUTH.scopes}`;
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
	var authWindow = new BrowserWindow({
    width: size.width > 1280 ? 1280 : size.width,
    height: size.height > 720 ? 720 : size.height,
		show: false,
		parent: win,
		modal: true,
		webPreferences: {
			nodeIntegration: false
		}
	});

	authWindow.loadURL(githubAuthUrl);
	authWindow.webContents.on('did-finish-load', function () {
    authWindow.show();
    authWindow.webContents.openDevTools();
	});

	var access_token, error;
	var closedByUser = true;

	var handleUrl = function (url) {
    console.log(url);
		var raw_code = /code=([^&]*)/.exec(url) || null,
    code = (raw_code && raw_code.length > 1) ? raw_code[1] : null,
    error = /\?error=(.+)$/.exec(url);

    if (code || error) {
      // Close the browser if code found or error
      authWindow.close();
    }

    // If there is a code in the callback, proceed to get token from github
    if (code) {
      console.log("code recieved: " + code);
      
      const postData = querystring.stringify({
          "client_id" : GITHUB_OAUTH.client_id,
          "client_secret" : GITHUB_OAUTH.client_secret,
          "code" : code
      });
      
      const post = {
        host: "github.com",
        path: "/login/oauth/access_token",
        method: "POST",
        headers: 
          { 
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': postData.length,
              "Accept": "application/json"
          }
      };
      
      const req = https.request(post, function(response){
        let result = '';
        response.on('data', function(data) {
          result = result + data;
        });
        response.on('end', function () {
              const json = JSON.parse(result.toString());
              console.log("access token:" + json.access_token);
              if (response && response.ok) {
                  console.log(response.body.access_token);
              }
          });
        response.on('error', function (err) {
              console.error("ERROR: " + err.message);
          });
      });
      
      req.write(postData);
      req.end();
  } else if (error) {
      console.error("couldn't login to github!");
  }

	}

	authWindow.webContents.on('will-navigate', (event, url) => handleUrl(url));
	var filter = {
		urls: ['https://*.github.com/*']
	};
	session.defaultSession.webRequest.onCompleted(filter, (details) => {
    var url = details.url;
    if(url.includes('code=')){
      const githubSession = authWindow.webContents.session;
      //clear cookies for next time login;
      githubSession.clearStorageData({
        storages: [
          'cookies', 'localstorage'
        ]
      })
    }
		handleUrl(url);
	});

	authWindow.on('close', () => event.returnValue = closedByUser ? { error: 'popup closed!' } : { access_token, error })
})
