'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'Badge'});

// var i = 0;
// chrome.extension.onConnect.addListener(function(port) {
//   console.log('got incoming connection on port: ' + port.name + Math.random())
//   console.assert(port.name === 'iframe')
//   port.onMessage.addListener(function(request) {
//     console.log('-----');
//     console.log('recv bg ' + i + ': ' + JSON.stringify(request));
//     console.log('-----');
//     i = i + 1;

//     port.postMessage({ to: 'iframe'
//                      , content: 'sending reply for iframe'
//                      });
//   });
// });
