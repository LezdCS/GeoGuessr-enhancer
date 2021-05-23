const settings = [
    ['notes-screenshot-theme',true],
    ['censor_nicknames',false],
    ['blurring_photos',false]
];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.message==="screenshot"){
        chrome.tabs.captureVisibleTab((screenshotUrl) => {
            sendResponse({message: screenshotUrl});
        });
    }
    return true;
});

function setSetting(name, value) {
    let payload = {};
    payload[name] = value;
    chrome.storage.sync.set(payload);
}

chrome.runtime.onInstalled.addListener(() => {
    settings.forEach(setting => {
        chrome.storage.sync.get(setting[0], data => {
            if (Object.keys(data).length === 0) {
                setSetting(setting[0], setting[1]);
            }
        });
    });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url.includes('/game') || details.url.includes('/challenge')) {
        chrome.storage.sync.get('notes-screenshot-theme', data => {
            if (data['notes-screenshot-theme']) {
                chrome.scripting.executeScript({
                    target: {tabId: details.tabId},
                    files: ['./src/scripts/notes-screenshot-theme.js']
                });
            }
        });
    } else if (details.url.includes('/battle-royale/')) {
        chrome.storage.sync.get(['blurring_photos','censor_nicknames'], data => {
            if (data['blurring_photos']) {
                chrome.scripting.insertCSS({
                    target: {tabId: details.tabId},
                    files: ['./src/br_blur.css']
                });
            }
            if(data['censor_nicknames']){
                chrome.scripting.executeScript({
                    target: {tabId: details.tabId},
                    files: ['./src/scripts/battleroyale-censoring.js']
                });
            }
        });
    }
});
