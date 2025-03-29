import { app, BrowserWindow } from 'electron';
import createWindow from './createWindow';
import registerOllamaStreamHandler from './registerOllamaStreamHandler';
import registerStoreHandlers from './registerStoreHandlers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let win: BrowserWindow | null;

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    win = createWindow();
  }
});

void app.whenReady().then(() => {
  win = createWindow();
  registerOllamaStreamHandler();
  registerStoreHandlers();
});
