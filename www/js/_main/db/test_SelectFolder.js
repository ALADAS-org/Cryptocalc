const { dialog } = require('electron');
const fs = require('fs');

// In main process
async function selectDirectory() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const directory = result.filePaths[0];
    console.log('Selected directory:', directory);
    return directory;
  }
  return null;
}

selectDirectory()