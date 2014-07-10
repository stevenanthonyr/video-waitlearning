// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  // If 'youtube' is found in the tab's URL...
  if (tab.url.indexOf('youtube') > -1 && changeInfo.status=="complete") {
    chrome.tabs.executeScript(tabId, {
          code: "if(!window.ChatChromeExtensionLoaded){chrome.extension.sendRequest({});}"
    });
  }
};

chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
      var tabId = sender.tab.id;
      console.log("tabId :" + tabId);
        // ... show the page action.
        chrome.pageAction.show(tabId);

          chrome.tabs.executeScript(tabId, {file: "js/jquery-1.8.1.min.js"}, function(){
              chrome.tabs.executeScript(tabId, {file: "js/myscript.js"},function(){
                 if (chrome.runtime.lastError) {
                    console.log("ERROR: " + chrome.runtime.lastError.message);
                  }
                  chrome.tabs.executeScript(tabId, { code: "window.ChatChromeExtensionLoaded = true;" }, function(){ });
              });
        });
     
});
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);