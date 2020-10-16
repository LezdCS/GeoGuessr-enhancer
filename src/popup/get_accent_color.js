function changeAccent(color) {
    document.documentElement.style
        .setProperty('--color-accent', color);
}

chrome.storage.local.get(['accentColor'], function(items) {
    if(items.accentColor!==undefined) {
        changeAccent(items.accentColor)
    }
});


