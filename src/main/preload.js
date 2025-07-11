const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  verifyLogin: (email, password) => ipcRenderer.invoke('verify-login', email, password),
  checkEmailExists: (email) => ipcRenderer.invoke('check-email-exists', email),
  
  createUser: (userData) => ipcRenderer.invoke('create-user', userData),
  createRealEstateAgent: (realEstateAgentData) => ipcRenderer.invoke('create-real-estate-agent', realEstateAgentData),
  
  getRealEstateAgent: () => ipcRenderer.invoke('get-real-estate-agent'),
  getRealEstateAgentByName: (name) => ipcRenderer.invoke('get-real-estate-agent-by-name', name),
  getRealEstateAgentById: (id) => ipcRenderer.invoke('get-real-estate-agent-by-id', id),
  updateRealEstateAgent: (data) => ipcRenderer.invoke('update-real-estate-agent', data),
  deleteRealEstateAgent: (id) => ipcRenderer.invoke('delete-real-estate-agent', id),
  
  createProperty: (propertyData) => ipcRenderer.invoke('create-property', propertyData),
  getAllProperties: () => ipcRenderer.invoke('get-all-properties'),
  getFilteredProperties: (filters) => ipcRenderer.invoke('get-filtered-properties', filters),
});
