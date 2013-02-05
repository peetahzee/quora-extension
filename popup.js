var currentSearch = "";

$(document).ready(function() {

	// focus on searchbox. hack needed to get focus on popup page.
	if (!document.hasFocus()) {
		document.location.reload();
	} else {
		$("#searchbar input").focus();
	}
	
	$("#searchbar input").keyup(function() {
		if($(this).val() != "") {
			$(".display").not("#search_results").fadeOut(150).promise().done(function(){
				$("#search_results").fadeIn(150);
			});
			if($(this).val() != currentSearch) {
				currentSearch = $(this).val();
				search(currentSearch);
			}	
		} else {
			$(".display").fadeOut(150).promise().done(function() {
				$("#welcome").fadeIn(150);
			});
		}
	});

	$("li#notifs").click(function() {
		$(".display").fadeOut(150).promise().done(function() {
			$("#notifs_display").fadeIn(150);
		});
	});

	parseNotifs();
	parseInbox();
	syncNotifsInbox();
	window.addEventListener("storage", handleStorageUpdate, false);
});

function search(query) {
	$.get("http://www.quora.com/ajax/full_navigator_results?q=" + currentSearch + "&data=%7B%7D&___W2_parentId=&___W2_windowId=", {}, function(msg) {
		$("#search_results").html(msg.html);
		parseLinks();
	});
}

function parseLinks() {
	$("a").click(function() {
		var url = $(this).attr("href");
		if(url.substring(0,1) == "/") {
			url = "http://quora.com" + url;
		}
		chrome.tabs.create({
			url: url
		});
		return false;
	});
}

function parseNotifs() {
	var notifs = JSON.parse(localStorage.getItem("notifs"));
	$("#notifs_display").html("<ul></ul>");
	for(var i in notifs.unseen) {
		var elemToAdd = $("<li>" + notifs.unseen[i].replace(/<a href="#">(\w\D*)<\/a>(\.|)/ig, "") + "</li>");
		$("#notifs_display ul").append(elemToAdd);
	}
	$("#notifs_display ul").append("<li id=\"more_notifs_link\"><a href=\"http://quora.com/notifications\">"
		+ (parseInt(notifs.unseen_count) - parseInt(notifs.unseen_aggregated_count))
		+ " more notifications &gt;</a></li>");

	// update menu bar count
	$("li#notifs").html("<span>" + notifs.unseen_count + "</span>");
	parseLinks();
};

function parseInbox() {
	var inbox = JSON.parse(localStorage.getItem("inbox"));
	console.log(inbox);
};

function handleStorageUpdate(e) {
	parseNotifs();
	parseInbox();
}
