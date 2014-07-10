
//the LearnBox object is responsible for all UI interactions with the learningPanel
var LearnBox = function(leftpos, toppos, learningPanel){
	var that = {};

	var l2panel = $("<div>").addClass("l2panel");
	var l1panel = $("<div>").addClass("l1panel");
	var revealbutton = $("<div>").addClass("reveal").html("flip");

	
	var setPosition = function(){
		learningPanel.css("left", leftpos + "px");
		learningPanel.css("top", toppos + "px");
	}

	that.showExercise = function(l1, l2){
		l1panel.html(l1);
		l2panel.html(l2);

		learningPanel.append(l2panel).append(l1panel).append(revealbutton);
		revealbutton.click(function(){
			revealbutton.hide();
			l1panel.show();
		});
		return;
	}

	setPosition();
	Object.freeze(that);
	return that;
}


$(document).ready(function(){
	attach_css();

	// get scrollbar and position
	var scrollbar = $(".html5-video-controls");
	var scrollbar_leftpos = scrollbar.position().left;
	var scrollbar_toppos = scrollbar.position().top;
	
	// create and attach learningPanel before scrollbar
	var learnbox_leftpos = scrollbar_leftpos;
	var learnbox_toppos = scrollbar_toppos - 100;
	var learningPanel = $("<div>").attr("id", "learningPanel").addClass("learningPanel");
	learningPanel.insertBefore(scrollbar);

	// create LearnBox object, giving it the learningPanel element
	var learnbox = LearnBox(learnbox_leftpos, learnbox_toppos, learningPanel);
	learnbox.showExercise("people", "personas");

	// ------ other useful methods (currently these don't do anything) --------
	var videoElement = document.getElementsByClassName('video-stream')[0];

	videoElement.addEventListener("timeupdate", function () { 
	    var vTime = videoElement.currentTime;
	    console.log("current timestamp: " + vTime);
	}, false);


	videoElement.addEventListener("play",function(){
		console.log("started playing!");
	});

	//----------------------------------------------------

});



var Exercises = function(){
	var vocab = [{"l1": "people", "l2": "personas"}, {"l1": "government", "l2": "gobierno"}, {"l1": "thing", "l2": "cosa"}];

}



function attach_css(){
	var link = document.createElement("link");
	link.href = chrome.extension.getURL("css/learning.css"); 
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}

