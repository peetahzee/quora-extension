var currentSearch = "";
$(document).ready(function() {
	$("#searchbar input").focus();
	$("#searchbar input").keyup(function() {
		if($(this).val() != "") {
			$("#welcome").fadeOut(150, function(){
				$("#search_results").fadeIn(150);
			});
			if($(this).val() != currentSearch) {
				currentSearch = $(this).val();
				search(currentSearch);
			}	
		} else {
			$("#search_results").fadeOut(150, function() {
				$("#welcome").fadeIn(150);
			});
		}
	});
	parseLinks();
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