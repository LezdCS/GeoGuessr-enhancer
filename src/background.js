chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
        if (changeInfo.status === 'complete'){
            chrome.tabs.sendMessage(tabId, {
                message: 'changingWindow'
            });
        }
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if(request.message==="screenshot"){
        chrome.tabs.captureVisibleTab((screenshotUrl) => {
            sendResponse({message: screenshotUrl});
            });
        }
    return true;
});
