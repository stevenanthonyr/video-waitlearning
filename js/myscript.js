
//the LearnBox object is responsible for all UI interactions with the learningPanel
//It is composed of a container div that is passed in (learningPanel) and other divs
//that are created to store/display content for the questions.
var LearnBox = function(leftpos, toppos, learningPanel){
	var that = {};

	var l2panel = $("<div>").addClass("l2panel");
	var l1panel = $("<div>").addClass("l1panel");
	var revealbutton = $("<div>").addClass("reveal").html("flip");

	//this method is private to this function only.
	var setPosition = function(){
		learningPanel.css("left", leftpos + "px");
		learningPanel.css("top", toppos + "px");
	};

    //this is, basically, a class method that can be called outside of this function on a LearnBox.
	that.showExercise = function(l1, l2){
		l1panel.html(l1);
		l2panel.html(l2);

		learningPanel.append(l2panel).append(l1panel).append(revealbutton);
		revealbutton.click(function(){
			revealbutton.hide();
			l1panel.show();
		});
		return;
	};

	setPosition();
	Object.freeze(that);
	return that;
};

//$('.videoAdUiAttribution') contains ad time left information, and returns null if no ad is playing.
//design based on this, so that our extension doesn't show when this selector returns null.
$(document).ready(function(){
	attach_css();

	// get controls and position
	var controls = $(".html5-video-controls");
	var controls_leftpos = controls.position().left;
	var controls_toppos = controls.position().top;
	
	// create and attach learningPanel before controls
	var learnbox_leftpos = controls_leftpos;
	var learnbox_toppos = controls_toppos - 100;
	var learningPanel = $("<div>").attr("id", "learningPanel").addClass("learningPanel");
	learningPanel.insertBefore(controls);

	// create LearnBox object, giving it the learningPanel element
	var learnbox = LearnBox(learnbox_leftpos, learnbox_toppos, learningPanel);
	learnbox.showExercise("people", "personas");

	// ------ other useful methods (currently these don't do anything) --------
	var videoElement = document.getElementsByClassName('video-stream')[0];

	videoElement.addEventListener("timeupdate", function () { 
	    var vTime = videoElement.currentTime;
	   // console.log("current timestamp: " + vTime);
	}, false);


	videoElement.addEventListener("play",function(){
		console.log("started playing!");
	});

	//----------------------------------------------------

});

var Exercises = function(){
	var vocab = [{"l1": "people", "l2": "personas"}, {"l1": "government", "l2": "gobierno"}, {"l1": "thing", "l2": "cosa"}];

};

function attach_css(){
	var link = document.createElement("link");
	link.href = chrome.extension.getURL("css/learning.css"); 
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}
