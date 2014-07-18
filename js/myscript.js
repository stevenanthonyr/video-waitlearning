//HELPER METHODS

function attach_css(){
    var link = document.createElement("link");
    link.href = chrome.extension.getURL("css/learning.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//map = {'type': 'flashcard', 'native': word.englishWord, 'foreign': translationDict[foreignLanguage],
//                      'learningPanel': learningPanel, 'leftpos': leftpos, 'toppos': toppos};
function parseMap(map) {
    if (map['type'] == 'flashcard') {
//        return Flashcard(map['leftpos'], map['toppos'], map['learningPanel'], map['model']);
    }
    else if (map['type'] == 'fill_in_the_blank') {
//        return Fill_In_The_Blank(map['leftpos'], map['toppos'], map['learningPanel'], map['model']);
    }
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
//    return o;
};

//MODELS

//Objects of the Word class are stored in model to pull words
//for the user to use in their exercises.
//englishWord - the word in English
//translationDict - a dictionary of the words translations, in the form {language: translation}
//numUnderstood - number of times the user has said they understand this word.
var Word = function(englishWord, translationDict) {
    var that = {};
    var self = this;
    that.numUnderstood = 0;

    that.addTranslation = function(language, translation) {
        translationDict[language] = translation;
    }

    that.getEnglishWord = function () {
        return englishWord;
    }

    that.getTranslationDict = function() {
        return translationDict;
    }

    // Object.freeze(that); don't think this should be done : adding words to dictionary in future?
    return that;
}

//vocab - list of Word objects
var Model = function(learningPanel, vocab, leftpos, toppos) {
    var that = {};
    var self = this;
    var foreignLang = 'spanish';
    var nativeLang = 'english';
    var languageCodeDict = {'spanish': 'ESP', 'english': 'ENG', 'german': 'DEU', 'italian': 'ITA', 'portuguese': 'POR', 'elvish': 'elf'}

    //Gets a random Word object stored in vocab and returns it to the user.
    var getRandomWord = function() {
        var num = getRandomInt(0, vocab.length);
        return vocab[num];
    }

    //word - Word object to be added to the vocab list
    that.addWord = function(word) {
        vocab.append(word)
    }

    that.getNativeLanguage = function() {
        return nativeLang;
    }

    that.getForeignLanguage = function() {
        return foreignLang;
    }

    //returns the languageCodeDict
    that.getLanguageCodeDict = function() {
        return languageCodeDict;
    }

    //Returns an object of information to be used to create the exercise.
    that.getExerciseMap = function(model) {
        var map;
        var selectNewCard = true;
        while (selectNewCard) {
            var word = getRandomWord();
            var translationDict = word.getTranslationDict();
            if (word.numUnderstood < 2) {
                map = {'type': 'flashcard', 'native': word.getEnglishWord(), 'foreign': translationDict[foreignLang],
                      'learningPanel': learningPanel, 'leftpos': leftpos, 'toppos': toppos, 'model': model};
                selectNewCard = false;
            }
            else if (word.numUnderstood < 4) {
                map = {'type': 'fill_in_the_blank', 'native': word.getEnglishWord(), 'foreign': translationDict[foreignLang],
                      'learningPanel': learningPanel, 'leftpos': leftpos, 'toppos': toppos, 'model': model};
                selectNewCard = false;
            }
        }
        return map;
    }
    return that;
}

//CARD TYPES

//IMPORTANT:
//FOR ALL CLASSES, THE ORDER OF WORDS IS:
//Foreign Word (on top)
//Native Word (on bottom)

//the Flashcard object is responsible for all UI interactions with the learningPanel
//It is composed of a container div that is passed in (learningPanel) and other divs
//that are created to store/display content for the questions.
var Flashcard = function(leftpos, toppos, learningPanel, model){
    var that = {};
    var self = this;
    var left = $("<div>").addClass("flash-left");
    var left_top = $("<div>").addClass("subsection").attr('id', 'topPanel');
    var left_bottom = $("<div>").addClass("subsection").attr('id', 'bottomPanel');
    var right = $("<div>").addClass("flash-right").attr("id", "not-clickable");
    var right_top = $("<div>").addClass("subsection").text("Got it!")
                                                     .css({'font-size':'50%', 'font-style':'italic'});
    var right_bottom = $("<div>").addClass("subsection").text("Darn! Missed it.")
                                                        .css({'font-size':'50%', 'font-style':'italic'});
    var foreignPanel = $("<div>").addClass("flash-langPanel");
    var nativePanel = $("<div>").addClass("flash-langPanel");
    var revealButton = $("<button>").addClass("flash-reveal").text("reveal");
    var revealed = false;
    var correct = $("<img>").addClass("check")//.addClass("not-clickable");
    correct.attr('src', chrome.extension.getURL('static/right.png'));
    var wrong = $("<img>").addClass("check")//.addClass("not-clickable");
    wrong.attr('src', chrome.extension.getURL('static/wrong.png'));

    var setPosition = function(){
        learningPanel.css("width", "400px");
        learningPanel.css("height", "125px");
        learningPanel.css("left", leftpos + "px");
        learningPanel.css("top", toppos + "px");
    };

    //l1 and l2 are strings
    //l1 = native, l2 = foreign
    that.showExercise = function(l1, l2){
        foreignPanel.text(l2);
        nativePanel.text(l1);

        var langCodeDict = model.getLanguageCodeDict();
        var l1Code = langCodeDict[model.getNativeLanguage()];
        var l2Code = langCodeDict[model.getForeignLanguage()];

        left.append(left_top).append(left_bottom);
        left_top.text(l2Code).append(foreignPanel);
        left_bottom.text(l1Code).append(nativePanel);
        right.append(right_top).append(right_bottom);
        right_top.append(correct);
        right_bottom.append(wrong);
        learningPanel.append(left);
        learningPanel.append(right);

        //randomly choose which language is hidden
        if (Math.random() >= .5) {
            nativePanel.hide();
            left_bottom.append(revealButton);
        }
        else {
            foreignPanel.hide();
            left_top.append(revealButton);
        }

        revealButton.click(function() {
            revealed = true;
            right.attr('id', 'clickable');
            if (nativePanel.is(':hidden')) {
                left_bottom.find('p').remove(); //removes alert text if present
                revealButton.hide();
                nativePanel.show();
            }
            else {
                left_top.find('p').remove(); //removes alert text if present
                revealButton.hide();
                foreignPanel.show();
            }
        });

        $('.check').click(function() {
            if (revealed) {
                right.attr('id', 'not-clickable');
                var map = model.getExerciseMap(model);
                learningPanel.empty();
                var newCard = parseMap(map);
                setTimeout(function(){newCard.showExercise(map['native'], map['foreign'])}, 300);
            }
            else {
                if (nativePanel.is(':hidden')) {
                    left_bottom.find('p').remove();
                    left_bottom.append($('<p>Reveal the word first!</p>'));
                }
                else {
                    left_top.find('p').remove();
                    left_top.append($('<p>Reveal the word first!</p>'));
                }
            }
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
var Fill_In_The_Blank = function(leftpos, toppos, learningPanel, model) {
    var that = {};
    //variables below used for showExercise method.
    var answer; //this is set as l1 or l2 in showExercise.
    var rand = Math.random();

    var left = $("<div>").addClass("left fill_in_the_blank");
    var right = $("<div>").addClass("right fill_in_the_blank");
    var lefttop = $("<div>").addClass("left_subsection fill_in_the_blank");
    var leftbottom = $("<div>").addClass("left_subsection fill_in_the_blank");
    var foreignPanel = $("<div>").addClass("foreignPanel fill_in_the_blank");
    var nativePanel = $("<div>").addClass("nativePanel fill_in_the_blank");
    var answerStatus = $("<div>").addClass("answerStatus fill_in_the_blank");
    var revealButton = $("<button>").addClass("revealButton fill_in_the_blank").text('reveal').attr('type', 'button');

    var setPosition = function(){
        learningPanel.css("width", "400px");
        learningPanel.css("height", "125px");
        learningPanel.css("left", leftpos + "px");
        learningPanel.css("top", toppos + "px");
    };

    var compareAnswer = function(answer) {
        var submittedTranslation;

        try {
            submittedTranslation = $('#fitb_translation_field').val().toLowerCase();
        }

        catch(err) {
            console.log('Your string was improperly formatted.');
        }

        if (submittedTranslation == answer) {
            var url = chrome.extension.getURL("static/right.png");
            $('.answerStatus.fill_in_the_blank').html('<img id="right" src=' + url + ' />')
            var map = model.getExerciseMap(model);
            var newCard = parseMap(map);
            setTimeout(function(){ newCard.showExercise(map['native'], map['foreign']); }, 1250);
        }

        else {
            var url = chrome.extension.getURL("static/wrong.png");
            $('.answerStatus.fill_in_the_blank').html('<img id="wrong" src=' + url + ' />');
            $('#fitb_translation_field').attr('placeholder', '').val('');
            $('#fitb_translation_field').addClass('fitb_try_again');
            setTimeout(function(){
                $('#fitb_translation_field').attr('placeholder', 'try again');
                $('.fitb_try_again::-webkit-input-placeholder').fadeIn(500);
            }, 500);
            $('.revealButton.fill_in_the_blank').css('display', 'inline');


            revealButton.click(function() {
                var replacementDiv = $('<div>').addClass("fitb_translation").attr('id', 'fitb_translation_div').text(answer);
                $('#fitb_translation_field').replaceWith(replacementDiv);
                replacementDiv.css('position', 'absolute').css('left', '4px');
                $('.revealButton.fill_in_the_blank').css('display', 'none');
                $('.answerStatus.fill_in_the_blank').html('<img id="wrong" src=' + url + ' />')
                var map = model.getExerciseMap(model);
                var newCard = parseMap(map);
                setTimeout(function(){ newCard.showExercise(map['native'], map['foreign']); }, 1750);
            });
        }
    }

    //l1 and l2 are strings
    //l1 = native, l2 = foreign
    that.showExercise = function(l1, l2){
        var lang;
        var topQuantity;
        var nativeBlank;
        var langDict = model.getLanguageCodeDict();
        learningPanel.empty();
        foreignPanel.html(l2);
        nativePanel.html(l1);
        var inputField = '<input type="text" value="" autocomplete="off" class="fitb_translation" id="fitb_translation_field">';
        if (rand > .5) {
            nativePanel.html(inputField);
            lang = model.getNativeLanguage();
            answer = l1;
            nativeBlank = true;

        }
        else {
            foreignPanel.html(inputField);
            lang = model.getForeignLanguage();
            answer = l2;
            nativeBlank = false;
        }

        lefttop.append(foreignPanel);
        leftbottom.append(nativePanel);
        left.append(lefttop).append(leftbottom);
        right.append(answerStatus).append(revealButton);
        learningPanel.append(left).append(right);

        //CSS below used to align text in input field and text in div.
        if (nativeBlank) {
            $('.foreignPanel.fill_in_the_blank').css('left', '4px').css('top', '14px');
            $('.revealButton.fill_in_the_blank').css('top', '64%');
        }
        else {
            $('.nativePanel.fill_in_the_blank').css('left', '4px').css('top', '77px');
            $('.revealButton.fill_in_the_blank').css('top', '23%');
        }
        $('#fitb_translation_field').attr('placeholder', 'translate to ' + lang);
        $('#fitb_translation_field').focus();

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

//Class that creates objects to be used for larger, draggable problems.
//helpText - text to accompany the image or, if no filename is provided, text used for the draggable item.
//filename - optional argument, used to link to an existing image. if passed in, start with static/...
var Item = function(helpText, filename) {
    //note: if filename not passed in, expect it to be 'undefined'
    var that = {};
    var self = this;
    var atTop = false;

    that.getInfo = function() {
        return {'helpText': helpText, 'filename': filename};
    }

    that.getAtTop = function() {
        return atTop;
    }

    that.getFilename = function() {
        return filename;
    }

    that.toggleAtTop = function() {
        atTop = !atTop;
    }

    return that;
}

//A group is a collection of items, representing steps in a problem or in a sentence, that follow each other in order, with
//the first step at the 0 index and the last step at the nth index, where n is len(items) - 1.
var Group = function(name, items) {
    var that = {};

    that.getName = function() {
        return this.name;
    }

    that.getItems = function() {
        return this.items;
    }

    return that;
}

var Draggable_Box = function() {
    var that = {};
    var top = $('<div>').attr('id', 'draggable-top');
    var bottom = $('<div>').attr('id', 'draggable-bottom');
    var userAnswer = []

    var allAtTop = function() {
        if (bottom.contents().length == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    var compareAnswer = function() {
        //overridden in subclasses
    }

    that.getUserAnswer = function() {
        return userAnswer;
    }

    //todo: do animations in here.
    that.moveItem = function(item) {
        if (item.getAtTop() == true) {
            var index = userAnswer.indexOf(item);
            item.toggleAtTop();
            userAnswer.splice(index, 1);
            bottom.append(item);
        }
        else {
            item.toggleAtTop();
            userAnswer.append(item);
            top.append(item);
        }
        if (allAtTop) {
            compareAnswer();
        }
    }
    return that;
}

var How_To = function(leftpos, toppos, learningPanel, model, group) {
    var self = this;
    var that = {};
    var ANSWER = group.getItems();

    var setPosition = function() {
        learningPanel.css('width', '854px');
        learningPanel.css('height', '480px');
        learningPanel.css("left", leftpos + "px");
        learningPanel.css("top", toppos + "px");
    }

    var createDashedBox = function() {

    }

    that.compareAnswer = function() {
        if (ANSWER === getUserAnswer()) {
            //yay
        }
        else {
            //wrong
        }
    }

    that.showExercise = function() {
        //TODO: TEST THIS HARD
        //IF THIS IS BROKEN, LIFE SUCKS
        var userItems = $.extend([], ANSWER);
        shuffle(userItems);
        for (i in userItems) {
            item = userItems[i];
            bottom.append(item);
            createDashedBox();

            item.click(function() {
                self.moveItem(item);
            })
        }

        learningPanel.append(top, bottom);
    }

    setPosition();
    Object.freeze(that);
    return that;
}
How_To.prototype = new Draggable_Box();
//How_To.prototype = Object.create(Draggable_Box.prototype);

var Sentence_Order = function(leftpos, toppos, learningPanel, model) {
    var that = {};

    var setPosition = function() {
        learningPanel.css("left", leftpos + "px");
        learningPanel.css("top", toppos + "px");
    }

    that.showExercise = function(l1, l2) {

    }

    setPosition();
    Object.freeze(that);
    return that;
}
Sentence_Order.prototype = new Draggable_Box();

//all vocab should be lowercase, no punctuation.
var people = Word('people', {'spanish': 'personas'})
var government = Word('government', {'spanish': 'gobierno'})
var thing = Word('thing', {'spanish': 'cosa'})
var cat = Word('cat', {'spanish': 'gato'})
var war = Word('war', {'spanish': 'guerra'})
var computer = Word('computer', {'spanish': 'computadora'})
var sad = Word('sad', {'spanish': 'triste'})
var vocab = [people, government, thing, cat, war, computer, sad];
//var vocab = [cat];
console.log(vocab);

//VIEW (kind of)

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
    var flashcard_toppos = controls_toppos - 131;
    var learningPanel = $("<div>").attr("id", "learningPanel").addClass("learningPanel");
    learningPanel.insertBefore(controls);

    //create the model object
    var model = Model(learningPanel, vocab, flashcard_leftpos, flashcard_toppos);
    var map = model.getExerciseMap(model);
    var newCard = parseMap(map);
    $('input[autocomplete]').removeAttr('autocomplete');
    //UNCOMMENT ME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//    newCard.showExercise(map['native'], map['foreign']);

    // create Flashcard object, giving it the learningPanel element
    //var flashcard = Flashcard(flashcard_leftpos, flashcard_toppos, learningPanel);
    //flashcard.showExercise("people", "personas");
    var egg1 = Item('1.', 'static/stepimages/egg1.png')
    var group = Group('eggs', [egg1])

    //create HowTo
    var how_to = How_To(0, 0, learningPanel, model, group);

    //create Fill_In_The_Blank object
    //var fitb = Fill_In_The_Blank(flashcard_leftpos, flashcard_toppos, learningPanel)
    //fitb.showExercise("people", "personas");
    //var flashcard = Flashcard(flashcard_leftpos, flashcard_toppos, learningPanel, model);
    //flashcard.showExercise("people", "personas");

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
