console.log("Event Page is loaded");

//What happends when some text is selected on a webpage and right clicked.
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

// Set up context menu right click when Chrome web pages load.
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "contextMenu Item",
        type: "normal",
        title: "Send to Unwander",
        contexts: ["selection"],
        documentUrlPatterns: ["<all_urls>"]
    });
});

//function to pass on when the context menu item is clicked.
function cMenuClick(info) {
    var selectedText = info.selectionText;
    clickHandler(selectedText);
}

//Below happens when the context menu is clicked
chrome.contextMenus.onClicked.addListener(cMenuClick);
//When someone clicks the browser action(Top right icon)then pass nothing/
chrome.browserAction.onClicked.addListener(function(a) {
    clickHandler("")
});

// chrome.runtime.onMessageExternal.addListener(
//     function(request, sender, sendResponse) {
//         if (request) {
//             if (request.message) {
//                 if (request.message == "version") {
//                     sendResponse({version: 1.0});
//                 }
//             }
//         }
//         return true;
//     });
