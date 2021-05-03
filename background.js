const settings = [
    'notes-screenshot-theme',
    'battleroyale-censoring',
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
        chrome.storage.sync.get(setting, data => {
            if (Object.keys(data).length === 0) {
                setSetting(setting, true);
            }
        });
    });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url.includes('/game')) {
        chrome.storage.sync.get('notes-screenshot-theme', data => {
            if (data['notes-screenshot-theme']) {
                chrome.scripting.executeScript({
                    target: {tabId: details.tabId},
                    files: ['./src/scripts/notes-screenshot-theme.js']
                });
            }
        });
    } else if (details.url.includes('/battle-royale/')) {
        chrome.storage.sync.get('battleroyale-censoring', data => {
            if (data['battleroyale-censoring']) {
                chrome.scripting.insertCSS({
                    target: {tabId: details.tabId},
                    files: ['./src/br_blur.css']
                });
                chrome.scripting.executeScript({
                    target: {tabId: details.tabId},
                    files: ['./src/scripts/battleroyale-censoring.js']
                });
            }
        });
    }
});
