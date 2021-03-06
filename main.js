/*
 *  Get speechrecognition
 * */
var SpeechRecognition = window.mozSpeechRecognition     ||
                        window.msSpeechRecognition      ||
                        window.oSpeechRecognition       ||
                        window.webkitSpeechRecognition  ||
                        window.SpeechRecognition;

// current color
var current
  , lang = "en-US";

$(".select-language").dropdown({
    onChange: function (value) {
        lang = value;
    }
});

$(".start").on("click", function () {

    $(".hide-after-start").fadeOut(function () {
        $(".show-after-start").fadeIn();

        // new instance
        speech = new SpeechRecognition();
        speech.lang = lang;

        // and start the speech recognition
        startSpeechRecognition();
    });
});

/*
 *  Start the speech recognition
 *
 * */
function startSpeechRecognition() {

    // settings
    speech.continuous = true;
    speech.interimResults = true;

    // on start handler
    speech.onstart = function() {

        // next test
        nextTest();
    };

    var data = "";

    var timer;

    // on result handler
    speech.onresult = function(event) {

        var message = ''
          , results = event.results;

        // create the message
        for (var i = event.resultIndex; i < results.length; i++) {
            if (!results[i].isFinal) {
                message += results[i][0].transcript;
            }
        }

        // check the answer
        checkAnswer(message);
    };

    // start the speech
    speech.start();
}

// possible colors
var possible = [
    {
        color: {
            name: {
                "ro-RO": "ROSU",
                "en-US": "RED"
            },
            value: "red"
        }
    },
    {
        color: {
            name: {
                "ro-RO": "PORTOCALIU",
                "en-US": "ORANGE"
            },
            value: "orange"
        }
    },
    {
        color: {
            name: {
                "ro-RO": "GALBEN",
                "en-US": "YELLOW"
            },
            value: "yellow"
        }
    },
    {
        color: {
            name: {
                "ro-RO": "VERDE",
                "en-US": "GREEN"
            },
            value: "green"
        }
    },
    {
        color: {
            name: {
                "ro-RO": "ALBASTRU",
                "en-US": "BLUE"
            },
            value: "blue"
        }
    }
];

var messages = [
    {
        "en-US": "Correct answer",
        "ro-RO": "Răspuns corect"
    },
    {
        "en-US": "Try again...",
        "ro-RO": "Mai incearcă"
    },
    {
        "en-US": "You won! <i class='smile icon'></i> Don't forget to Start the project.",
        "ro-RO": "Ai câștigat! <i class='smile icon'></i>"
    }
]

/*
 *  Take another color, now
 *
 * */
function nextTest () {

    $(".info").text("");

    // if no colors, you won
    if (!possible.length) {
        $(".ui.modal .header").html('<i class="smile icon"></i>');
        $(".ui.modal .content").html(messages[2][speech.lang]);
        $('.ui.modal').modal("show");
        setTimeout(function () {
            location = "https://github.com/IonicaBizau/Color-Puzzle";
        }, 1000);
        speech.stop();
        return;
    }

    // index
    var i = Math.floor(Math.random() * possible.length);

    // randomized test
    current = possible[i];

    // remove this from possible
    possible.splice(i, 1);

    // change the backrground
    $(".color-panel").css("background", current.color.value);
}

/*
 *  This checks if the answer is ok
 *
 * */
var loading = false;
function checkAnswer(guess) {

    // trim
    guess = guess.trim();

    // if loading, try again latter
    if (!guess || loading || guess.length <= 2) { return; }

    // use levenstein algorithm to see if the answer is good
    if (levDist(guess.toUpperCase(), current.color.name[speech.lang]) < 3) {

        // yes, correct
        $(".info").text(messages[0][speech.lang]);
        $(".color-panel").html('<i class="smile icon"></i>');

        // loading true
        loading = true;

        // timeout
        setTimeout(function () {

            // empty the textarea
            $(".info").text("");

            // loading false
            loading = false;

            // next test
            nextTest();
        }, 500);
    } else {
        // incorrect answer
        $(".info").text(messages[1][speech.lang]);
        $(".color-panel").html('<i class="frown icon"></i>');
    }

    $(".color-panel i.icon").stop(true).transition('tada');
}

/*
 *  Is speech suported?
 *
 * */
function detectIfSpeechSupported() {

    //  supported
    if (SpeechRecognition) {
        $(".hide-after-start").fadeIn();
        return;
    }

    // sorry...
    $(".ui.modal .content").text("Sorry... Your browser doesn't support speech recognition yet.  Try Google Chrome version 25.");

    // show the message to the user
    $('.ui.modal').modal("show");
}

detectIfSpeechSupported();


// Thanks!
// http://stackoverflow.com/a/11958496/1420197
//
// Levenshtein Distance
var levDist = function(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (var j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
}

