
/*
	display the room
*/
$("#chooseRoom").live("click", function (event) {
	$(".maskDiv").show();
	$("#roomBox").animate({"top" : "40px"}, 200, "ease");
})
$(".roomClose, .maskDiv").live("click", function (event) {
	$("#roomBox").animate({"top" : "-510px"}, 200, "ease", function () {
		$(".maskDiv").hide();
	});
	$("#gameOverBox").animate({"top" : "-510px"}, 200, "ease", function () {
		$(".maskDiv").hide();
	});
})
$(".friend_list .fl_popup, .friend_list").live("mouseover", function (event) {
	$(".friend_list").animate({"right" : "0px"}, 100, "ease");
})
$(".friend_list").live("mouseout", function (event) {
	$(".friend_list").animate({"right" : "-165px"}, 100, "ease");
})
