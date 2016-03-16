console.log("Event Page is loaded");

//One option is get the selectedText and put it into Chrome Storage. Other option is to watch the Tuts video and see how the guy used the functions between scripts.

function clickHandler(text) {

  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({'selectedText': text}, function() {
    // Notify that we saved.
    console.log("selectedText is saved in the Chrome Storage");
  });
  chrome.storage.sync.get('selectedText', function(items) {
    console.log(items);
  });
}
// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "contextMenu Item",
        type: "normal",
        title: "Send to Chalo",
        contexts: ["selection"],
        documentUrlPatterns: ["<all_urls>"]
    });
});


function cMenuClick(info) {
    var selectedText = info.selectionText;
    clickHandler(selectedText);
}

//Below happens when the context menu is clicked
chrome.contextMenus.onClicked.addListener(cMenuClick);
//When someone clicks the browser action then pass nothing/
chrome.browserAction.onClicked.addListener(function(a) {
    clickHandler("")
});

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (request) {
            if (request.message) {
                if (request.message == "version") {
                    sendResponse({version: 1.0});
                }
            }
        }
        return true;
    });
