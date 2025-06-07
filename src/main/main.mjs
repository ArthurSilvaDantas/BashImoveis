import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { sincronizar, reconectar } from './database/sync.js';
import { verifyLogin, checkEmailExists, createUser, createRealEstateAgent, getRealEstateAgent, getRealEstateAgentByName, updateRealEstateAgent, deleteRealEstateAgent} from './database/db.js';
import { ipcMain } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  }

  ipcMain.handle('verify-login', async (email, password) => {
    try {
      return verifyLogin(email, password);
    } catch (err) {
      console.error('Erro ao verificar login:', err);
      return null;
    }
  });

  ipcMain.handle('check-email-exists', async (email) => {
    try {
      return checkEmailExists(email);
    } catch (err) {
      console.error('Erro ao verificar se email existe:', err);
      return false;
    }
  });
  
  ipcMain.handle('create-user', async (event, userData) => {
    try {
      return createUser(userData);
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      return null;
    }
  });

  ipcMain.handle('create-real-estate-agent', async (realEstateAgentData) => {
    try {
      return createRealEstateAgent(realEstateAgentData);
    } catch (err) {
      console.error('Erro ao criar corretor:', err);
      return null;
    }
  });

  ipcMain.handle('get-real-estate-agent', async () => {
    try {
      return getRealEstateAgent();
    } catch (err) {
      console.error('Erro ao obter corretores:', err);
      return [];
    }
  });
  
  ipcMain.handle('get-real-estate-agent-by-name', async (name) => {
    try {
      return getRealEstateAgentByName(name);
    } catch (err) {
      console.error('Erro ao obter corretor por nome:', err);
      return null;
    }
  });

  ipcMain.handle('update-real-estate-agent', async (event, data) => {
    try {
      return updateRealEstateAgent(data);
    } catch (err) {
      console.error('Erro ao atualizar corretor:', err);
      return { success: false, message: 'Erro interno ao atualizar corretor.' };
    }
  });

  ipcMain.handle('delete-real-estate-agent', async (event, id) => {
    try {
      return deleteRealEstateAgent(id);
    } catch (err) {
      console.error('Erro no ipcMain ao excluir corretor:', err);
      return { success: false, message: 'Erro interno ao excluir corretor.' };
    }
  });
}

app.whenReady().then(() => {
  setInterval(async () => {
    await reconectar();
    await sincronizar();
  }, 2000);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    app.quit();
  }
});
