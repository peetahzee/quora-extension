function syncNotifsInbox(syncTimer) {
	if(syncTimer != undefined) { syncTimer = null; }

	$.ajax({url: "https://api.quora.com/api/logged_in_user?fields=notifs,inbox", dataType: "text"})
		.done(function(data) { 
			dataJson = JSON.parse(data.substring(9));
			localStorage.setItem("notifs", JSON.stringify(dataJson.notifs));
			localStorage.setItem("inbox", JSON.stringify(dataJson.inbox));

			var notifsCount = parseInt(dataJson.notifs.unseen_count) + parseInt(dataJson.inbox.unread_count);
			chrome.browserAction.setBadgeText({text: "" + notifsCount});
			chrome.browserAction.setBadgeBackgroundColor({color: "#2678c4"})
		});

	if(syncTimer != undefined) {
		syncTimer = setTimeout(function() {
			syncNotifsInbox();
		}, 5 * 60 * 1000);
	}

	
}