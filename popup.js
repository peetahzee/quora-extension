var currentSearch = "";
$(document).ready(function() {
	$("#searchbar input").focus();
	$("#searchbar input").keyup(function() {
		if($(this).val() != currentSearch) {
			currentSearch = $(this).val();
			search(currentSearch);
		}
	});
});

function search(query) {
	$.get("http://www.quora.com/ajax/full_navigator_results?q=" + currentSearch + "&data=%7B%7D&___W2_parentId=&___W2_windowId=", {}, function(msg) {
		$("#search_results").html(msg.html);
	});
}