function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//IMPORTANT:
//FOR ALL CLASSES, THE ORDER OF WORDS IS:
//Foreign Word (on top)
//Native Word (on bottom)

//the Flashcard object is responsible for all UI interactions with the learningPanel
//It is composed of a container div that is passed in (learningPanel) and other divs
//that are created to store/display content for the questions.
var Flashcard = function(leftpos, toppos, learningPanel){
    var that = {};
    var self = this;
    //console.log(Exercises[0])
    var left = $("<div>").addClass("left flashcard");
    var right = $("<div>").addClass("right flashcard");
    var foreignPanel = $("<div>").addClass("foreignPanel flashcard");
    var nativePanel = $("<div>").addClass("nativePanel flashcard");
    var revealButton = $("<div>").addClass("reveal").text("flip");
    //var yesButton = $("<div>").addClass("checkbutton").text("I knew this word");
    //var noButton = $("<div>").addClass("checkbutton").text("I didn't know this word");

    //this method is private to this function only.
    var setPosition = function(){
        learningPanel.css("left", leftpos + "px");
        learningPanel.css("top", toppos + "px");
    };

    //this is, basically, a class method that can be called outside of this function on a Flashcard.
    //l1 = native, l2 = foreign
    that.showExercise = function(l1, l2){
        foreignPanel.text(l2);
        nativePanel.text(l1);

        learningPanel.append(left);
        learningPanel.append(right);
        left.append(foreignPanel).append(nativePanel).append(revealButton);
        //right.append(yesButton).append(noButton);
        
        if (Math.random() >= .5) {
            nativePanel.hide();
            //nativePanel.append(revealButton);
        }
        else {
            foreignPanel.hide();
            //foreignPanel.append(revealButton);
        }
        
        revealButton.click(function() {
            console.log('click')
            if (nativePanel.is(':hidden')) {
                revealButton.hide();
                nativePanel.show();
            }
            else {
                revealButton.hide();
                foreignPanel.show();
            }
        });
        
        $('.checkbutton').click(function() {
            learningPanel.empty();
            var newCard = Flashcard(leftpos, toppos, learningPanel);
            
            var i = getRandomInt(0,vocab.length);
            while (vocab[i].l1 == l1) {
                i = getRandomInt(0,vocab.length);
            }
            
            newCard.showExercise(vocab[i].l1, vocab[i].l2);
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
    //variables below used for showExercise method.
    var answer;
    var nativeBlank = true;
    var rand = Math.random();

    var left = $("<div>").addClass("left fill_in_the_blank");
    var right = $("<div>").addClass("right fill_in_the_blank");
    var foreignPanel = $("<div>").addClass("foreignPanel fill_in_the_blank");
    var nativePanel = $("<div>").addClass("nativePanel fill_in_the_blank");
    var answerStatus = $("<div>").addClass("answerStatus fill_in_the_blank");
    var revealButton = $("<div>").addClass("revealButton fill_in_the_blank");

    var setPosition = function(){
        learningPanel.css("left", leftpos + "px");
        learningPanel.css("top", toppos + "px");
    };

    var compareAnswer = function(answer) {
        var submittedTranslation = $('#fitb_translation_field').val().toLowerCase();
        if (submittedTranslation == answer) {
            //success message
            learningPanel.css('display', 'none');
            console.log('correct');
        }
        else {
            //TODO: have a 'reveal answer' button appear.
            $('#fitb_translation_field').attr('placeholder', 'try again').val('');
        }
    }

    //l1 and l2 are strings
    that.showExercise = function(l1, l2){
        foreignPanel.html(l2);
        nativePanel.html(l1);
        var inputField = '<div id="fitb_translation_container"><input type="text" id="fitb_translation_field" placeholder="translate"></div>';
        if (rand > .5) {
            nativePanel.html(inputField);
            //case where nativeBlank is true.
            answer = l1;
        }
        else {
            foreignPanel.html(inputField);
            nativeBlank = false;
            answer = l2;
        }
        
        left.append(foreignPanel).append(nativePanel);
        right.append(answerStatus).append(revealButton);
        learningPanel.append(left).append(right);

        $('#fitb_translation_field').keydown(function(e) {
            if (e.which==13 || e.keyCode==13) {
                compareAnswer(answer);
                e.preventDefault();
                return false;
            }
        });

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
    var flashcard = Flashcard(flashcard_leftpos + 400, flashcard_toppos - 300, learningPanel);
    flashcard.showExercise("people", "personas");
    
    //create Fill_In_The_Blank object
//    var fitb = Fill_In_The_Blank(flashcard_leftpos, flashcard_toppos, learningPanel)
//    fitb.showExercise("people", "personas");

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
