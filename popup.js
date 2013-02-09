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

	$("li#inbox").click(function() {
		$(".display").fadeOut(150).promise().done(function() {
			$("#inbox_display").fadeIn(150);
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
		$(".addquestionitem .result_item").attr("href", "http://www.quora.com/question/add?q=" + query);
		parseLinks();
		parsePosts();
	});
}

function parseLinks() {
	$("a").unbind('.openNewTab');
	$("a").bind('click.openNewTab', function() {
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

function parsePosts() {
	$("#search_results a").unbind(".openNewTab");
	$("#search_results a").bind('click.showPost', function() {
		var url = "http://www.quora.com" + $(this).attr("href");

		$("#post_display").html("<p class=\"loading_message\">Loading...</p>");
		$(".display").fadeOut(150).promise().done(function() {
			$("#post_display").fadeIn(150);
		});
		$.get(url, {}, function(data) {
			var topicHeader = $(".topic_header", $(data));
			var questionHeader = $(".question_text_edit_row", $(data));
			var content = $(".main_col", $(data));

			$(".loading_message").fadeOut(150, function() {
				$("#post_display").append(topicHeader.html());
				$("#post_display").append(questionHeader.html());
				content.each(function () {
					$("#post_display").append($(this).html());
				});
			});
		});
		return false;
	});
}

function parseNotifs() {
	var notifs = JSON.parse(localStorage.getItem("notifs"));
	var unseen_count = parseInt(notifs.unseen_count);
	$("#notifs_display").html("<ul></ul>");
	for(var i in notifs.unseen) {
		var elemToAdd = $("<li>" + notifs.unseen[i].replace(/<a href="#">(\w\D*)<\/a>(\.|)/ig, "") + "</li>");
		$("#notifs_display ul").append(elemToAdd);
	}

	$("#notifs_display ul").append("<li id=\"more_notifs_link\"><a href=\"http://quora.com/notifications\">"
		+ (unseen_count > 5 ? (unseen_count - 5) + " more notifications" : "All notifications")
		+ " &gt;</a></li>");

	// update menu bar count
	$("li#notifs").html("<span>" + notifs.unseen_count + "</span>");
	parseLinks();
};

function parseInbox() {
	var inbox = JSON.parse(localStorage.getItem("inbox"));
	$("li#inbox").html("<span>" + inbox.unread_count + "</span>");

	$.get("http://www.quora.com/inbox", {}, function(data) {
		var inboxPage = $(".main_col", $(data));
		inboxPage.find("h1.heading span").html("+");
		inboxPage.find(".timestamp_wrapper").after("<div class=\"clear\"></div>");
		$("#inbox_display").html(inboxPage.html());
		$("#inbox_display").append("<div id=\"inbox_link\"><a href=\"http://quora.com/inbox\">Go to your inbox &gt;</a></>");
	});
};

function handleStorageUpdate(e) {
	parseNotifs();
	parseInbox();
}
