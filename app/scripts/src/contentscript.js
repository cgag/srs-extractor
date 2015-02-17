'use strict';

// TODO: change app to something less likely to have a collision,
// requires change in cljs

var div = $("<div />")
            .attr({ 'id' : 'incReadingExtension'
                  , 'text': 'my div'})
            .prependTo('body')

var port = chrome.runtime.connect({name: 'incReading'})


// // will need to receive persisted highlights and stuff like that
// port.onMessage.addListener(function(msg) {
//   // if(msg.to !== 'contentScript') { return }
//   console.log('recv contentscript: ' + JSON.stringify(msg))
// });

