chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
        if (changeInfo.status === 'complete'){
            chrome.tabs.sendMessage(tabId, {
                message: 'changingWindow'
            });
            /*if(tabs[0].url.includes("geoguessr.com/challenge")){
                chrome.tabs.sendMessage(tabId, {
                    message: 'TabChall'
                });
            }*/
        }
    });
});