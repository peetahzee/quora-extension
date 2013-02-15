function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}
if(getURLParameter("chrome_new_message") == "1") {
	setTimeout(function() {
		$("h1.heading").find("a.action_button").trigger('click');
	}, 200);
}