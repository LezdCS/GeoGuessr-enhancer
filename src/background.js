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

//chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    //if(request.message==="screenshot"){
        //chrome.tabs.captureVisibleTab((screenshotUrl) => {
            //sendResponse({message: screenshotUrl});
            //});
        //}
    //  return true;
//});

chrome.runtime.onUpdateAvailable.addListener(function(details) {
    console.log("updating to version " + details.version);
    chrome.runtime.reload();
});