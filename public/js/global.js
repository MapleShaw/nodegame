
/*
	display the room
*/
$("#chooseRoom").live("click", function (event) {
	$(".maskDiv").show();
	$("#roomBox").animate({"top" : "40px"}, 300, "ease");
})
$(".roomClose, .maskDiv").live("click", function (event) {
	$("#roomBox").animate({"top" : "-510px"}, 300, "ease");
	$(".maskDiv").hide();
})
