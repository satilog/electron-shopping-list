const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
  //Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration:true
    }
  });

  //load the html file into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  })); // file://dirname/mainWindow.html

  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  //if mac add empty object to menuTemplate
  if(process.platform=='darwin'){
    mainMenuTemplate.unshift({label: ''}); //adding it to the beginning of the array
  }

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // Insert the menu
  Menu.setApplicationMenu(mainMenu);

});

// Handle create add window
function createAddWindow(){
  //Create new window
  addWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration:true
    },
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });

  //load the html file into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Garbage Collection handle
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// Catch item add
ipcMain.on('item:add', function(event, item){
  console.log(item);
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});


// Shortcut to close application
const quitShortCutPlatformChecker = () => {
  if (process.platform == 'darwin'){
    return "Command + Q";
  }
  else{
    return "Ctrl + Q";
  }
}

// Create menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu: [
      {
        label: 'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label:'Quit',
        accelerator:quitShortCutPlatformChecker(), //process.platform == 'darwin' ? 'Command + Q' : 'Ctrl + Q'
        click(){
          app.quit();
        }
      }
    ]
  }
];


// Add developer tools items if not in production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform == 'darwin' ? 'Command + I' : 'Ctrl + I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
