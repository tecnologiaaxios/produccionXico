// C:\Users\sdkca\Desktop\electron-workspace\build.js
var electronInstaller = require('electron-winstaller');

// In this case, we can use relative paths
var settings = {
    // Specify the folder where the built app is located
    appDirectory: './release-builds/ProduccionXico-win32-x64',
    // Specify the existing folder where 
    outputDirectory: './installers',
    // The name of the Author of the app (the name of your company)
    authors: 'Our Code World Inc.',
    // The name of the executable of your built
    exe: './ProduccionXico.exe',
    description: 'test description',
    setupIcon: './icon.ico'
};

resultPromise = electronInstaller.createWindowsInstaller(settings);
 
resultPromise.then(() => {
    console.log("El instalador fue creado con exito!");
}, (e) => {
    console.log(`No se pudo crear el instalador: ${e.message}`)
});