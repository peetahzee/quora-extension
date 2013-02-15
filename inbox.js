/*
 * Injects inbox_embed.js in quora.com/inbox
 */

var s = document.createElement('script');
s.src = chrome.extension.getURL("inbox_embed.js");
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);