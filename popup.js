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

	$("li#compose").click(function() {
		chrome.tabs.query({ active : true, currentWindow : true}, function(tabs) {
			var url = "";
			if(tabs[0] != undefined) {
				url = tabs[0].url;
			}

			chrome.windows.getCurrent(null, function(w) {
				var leftPos = w.width - 410;
				var d=document,w=window,f='http://www.quora.com/board/bookmarklet',l=d.location,e=encodeURIComponent,p='?v=1&url='+e(url),u=f+p;try{if(!/^(.*\.)?quora[^.]*$/.test(l.host))throw(0);}catch(z){a=function(){if(!w.open(u,'_blank','toolbar=0,scrollbars=no,resizable=1,status=1,width=430,height=400,left='+leftPos))l.href=u;};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else a();} 
			});
		})
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
		parsePosts();
		parseLinks($(".addquestionitem .result_item"));
	});
}

// (default) parse all the links in the document to open a new tab pointing to specified location
// if specified el, only parse that element.
function parseLinks(el) {
	if(el == undefined) el = $("a");
	el.unbind('.openNewTab');
	el.unbind('.showPost');
	el.bind('click.openNewTab', function() {
		var url = $(this).attr("href");
		if(url.substring(0,1) == "/") {
			url = "http://quora.com" + url;
		}
		chrome.tabs.create({ url: url });
		return false;
	});
}

function parsePosts() {
	$("#search_results a").unbind(".openNewTab");
	$("#search_results a").each(function() {
		var resultType = $.trim($(this).find("span.desc div:not(.pic)").html() || $(this).find("span.desc").html());
		if(resultType == "Profile" || resultType == "Blog") {
			// don't try to display content in the pop up if it's a profile or blog
			parseLinks($(this));
		} else {
			$(this).bind('click.showPost', function() {
				var url = "http://www.quora.com" + $(this).attr("href");

				$("#post_display").html("<p class=\"loading_message\">Loading...</p>");
				$(".display").fadeOut(150).promise().done(function() {
					$("#post_display").fadeIn(150);
				});
				$.get(url, {}, function(data) {
					$("#post_display").html("");
					var topicHeader = $(".topic_header", $(data));
					var questionHeader = $(".question_text_edit_row", $(data));
					var content = $(".main_col", $(data));

					var titleHtml = topicHeader.find("h1").parent().html();
					// don't add link here like we do with profile pic. add with all other h1's.

					var profilePic = topicHeader.find(".profile_photo_img");
					profilePic = profilePic.wrap("<a href=\"" + url + "\" />").parent();

					$(".loading_message").fadeOut(150, function() {
						$("#post_display").append(titleHtml);
						$("#post_display").append(profilePic.parent().html());
						$("#post_display").append("<div class=\"clear\"></div>");
						$("#post_display").append(questionHeader.html());
						content.each(function () {
							$("#post_display").append($(this).html());
						});

						$("#post_display").append("<div id=\"read_more_link\"><a href=\"" + url + "\"><b>Continue on Quora.com &gt;</b></a></div>");

						$("#post_display").find("h1").wrap("<a href=\"" + url + "\" />");

						parseLinks();
					});
				});
				return false;
			});
		}
	});
}

function parseNotifs() {
	var notifs = JSON.parse(localStorage.getItem("notifs"));
	var unseen_count = parseInt(notifs.unseen_count);
	$("#notifs_display").html("<ul></ul>");
	for(var i in notifs.unseen) {
		// get rid of fake links in notifs
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
		inboxPage.find("h1.heading span").html("+").wrap("<a href=\"http://www.quora.com/inbox?chrome_new_message=1\" />");
		inboxPage.find(".timestamp_wrapper").after("<div class=\"clear\"></div>");
		$("#inbox_display").html(inboxPage.html());
		$("#inbox_display").append("<div id=\"inbox_link\"><a href=\"http://quora.com/inbox\">Go to your inbox &gt;</a></>");
		parseLinks();
	});
};

function handleStorageUpdate(e) {
	parseNotifs();
	parseInbox();
}
