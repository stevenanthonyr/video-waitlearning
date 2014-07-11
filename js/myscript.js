
//the Flashcard object is responsible for all UI interactions with the learningPanel
//It is composed of a container div that is passed in (learningPanel) and other divs
//that are created to store/display content for the questions.
var Flashcard = function(leftpos, toppos, learningPanel){
	var that = {};
    //console.log(Exercises[0])
    var lSpan = $("<span>").addClass("lSpan");
    var rSpan = $("<span>").addClass("rSpan");
	var foreignPanel = $("<span>").addClass("foreignPanel");
	var nativePanel = $("<span>").addClass("nativePanel");
    var revealButton = $("<span>").addClass("reveal").text("flip");
	var yesButton = $("<span>").addClass("checkbutton").text("I knew this word");
	var noButton = $("<span>").addClass("checkbutton").text("I didn't know this word");

	//this method is private to this function only.
	var setPosition = function(){
		learningPanel.css("left", leftpos + "px");
		learningPanel.css("top", toppos + "px");
	};

    //this is, basically, a class method that can be called outside of this function on a Flashcard.
	that.showExercise = function(l1, l2){
		foreignPanel.html(l2);
		nativePanel.html(l1);

		learningPanel.append(lSpan);
		learningPanel.append(rSpan);
		lSpan.append(foreignPanel).append(revealButton).append(nativePanel);
		rSpan.append(yesButton).append(noButton);
		
		revealButton.click(function() {
			revealButton.hide();
			nativePanel.show();
		});
		
		var i = 0;
		yesButton.click(function() {
            i++;
            that.showExercise(vocab[i].l1, vocab[i].l2);
		});
		return;
	};

	setPosition();
	Object.freeze(that);
	return that;
};

//Fill_In_The_Blank is a question type that lets the user
//type in their translation to a word, either native or foreign.
//Takes in two position arguments (left and top) and a learningPanel div.
var Fill_In_The_Blank = function(leftpos, toppos, learningPanel) {
    var that = {};
    
    var foreignPanel = $("<div>").addClass("foreignPanel");
    var nativePanel = $("<div>").addClass("nativePanel");
    
	var setPosition = function(){
		learningPanel.css("left", leftpos + "px");
		learningPanel.css("top", toppos + "px");
	};
	
	var compareAnswer = function(answer) {
        var submittedTranslation = $('#translation').val().toLowercase();
        if (submittedTranslation == answer) {
            //success message
            console.log('correct')
        }
        else {
            //failure message
            console.log('nope')
        }
    }


    //l1 and l2 are strings
	that.showExercise = function(l1, l2){
		foreignPanel.html(l2);
		nativePanel.html(l1);
		//submit is display:none so that the user can press enter to submit answer.
		var nativeBlank = true;
		var answer = l1;
		var rand = Math.random();
		//don't think onsubmit will work.
        var inputField = '<form onsubmit="compareAnswer(answer)"><input type="text" id="translation" placeholder="translate"><br><input type="submit" style="display:none"/></form>'
		if (rand > .5) {
            nativePanel.html(inputField);
        }
		else {
            foreignPanel.html(inputField);
            nativeBlank = false;
            answer = l2;
		}
	
		learningPanel.append(foreignPanel).append(nativePanel);
		
		return;
	};

	setPosition();
	Object.freeze(that);
	return that;
}

//$('.videoAdUiAttribution') contains ad time left information, and returns null if no ad is playing.
//design based on this, so that our extension doesn't show when this selector returns null.
$(document).ready(function(){
	attach_css();

	// get controls and position
	var controls = $(".html5-video-controls");
	var controls_leftpos = controls.position().left;
	var controls_toppos = controls.position().top;
	
	// create and attach learningPanel before controls
	var flashcard_leftpos = controls_leftpos;
	var flashcard_toppos = controls_toppos - 100;
	var learningPanel = $("<div>").attr("id", "learningPanel").addClass("learningPanel");
	learningPanel.insertBefore(controls);

	// create Flashcard object, giving it the learningPanel element
//  	var flashcard = Flashcard(flashcard_leftpos + 200, flashcard_toppos, learningPanel);
//  	flashcard.showExercise("people", "personas");
	
	//create Fill_In_The_Blank object
	var fitb = Fill_In_The_Blank(flashcard_leftpos, flashcard_toppos, learningPanel)
	fitb.showExercise("people", "personas");

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

//all vocab should be lowercase, no punctuation.
//var Exercises = function(){
	var vocab = [{"l1": "people", "l2": "personas"}, {"l1": "government", "l2": "gobierno"}, {"l1": "thing", "l2": "cosa"}];

//};

function attach_css(){
	var link = document.createElement("link");
	link.href = chrome.extension.getURL("css/learning.css"); 
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
}
