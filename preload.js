const path = require('path');
const url = require('url');

const customTitleBar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    new customTitleBar.Titlebar({
        backgroundColor: customTitleBar.Color.fromHex('#22262a'),
        titleHorizontalAlignment: 'left'
    });

    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})


