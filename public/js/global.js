
/*
 * display the room
 */
$("#chooseRoom").live("click", function (event) {
	$(".maskDiv").show();
	$("#roomBox").animate({"top" : "40px"}, 200, "ease");
});
$(".roomClose, .maskDiv").live("click", function (event) {
	$("#roomBox").animate({"top" : "-510px"}, 200, "ease", function () {
		$(".maskDiv").hide();
	});
	$("#gameOverBox").animate({"top" : "-510px"}, 200, "ease", function () {
		$(".maskDiv").hide();
	});
});

/*
 * friend list
 */
$(".friend_list .fl_popup, .friend_list").live("mouseover", function (event) {
	$(".friend_list").animate({"right" : "0px"}, 100, "ease");
});
$(".friend_list").live("mouseout", function (event) {
	$(".friend_list").animate({"right" : "-165px"}, 100, "ease");
});

/*
 * operate box
 */
 $("#addWordBtn").live("click", function () {
 	$(".o_ciyu").show();
 });
  $("#leaveMsgBtn").live("click", function () {
 	$(".o_yiyan").show();
 });
   $("#guessWordbtn").live("click", function () {
 	$(".o_caici").show();
 });
 $(".ob_close").live("click", function () {
 	$(".operateBox").hide();
 });
