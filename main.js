$(document).ready(function () {
    // Variables
    let lang = "en-US"; // Changed from 'var' to 'let' for block-level scope.
    let currentColor; // Changed from 'var' to 'let' for block-level scope.
    let speech; // Changed from 'var' to 'let' for block-level scope.

    // DOM Elements
    const $selectLanguage = $(".select-language"); // Changed from 'var' to 'const' for constant reference.
    const $startButton = $(".start"); // Changed from 'var' to 'const' for constant reference.
    const $hideAfterStart = $(".hide-after-start"); // Changed from 'var' to 'const' for constant reference.
    const $showAfterStart = $(".show-after-start"); // Changed from 'var' to 'const' for constant reference.
    const $info = $(".info"); // Changed from 'var' to 'const' for constant reference.
    const $colorPanel = $(".color-panel"); // Changed from 'var' to 'const' for constant reference.
    const $modal = $('.ui.modal'); // Changed from 'var' to 'const' for constant reference.

    // Messages
    const messages = {
        "en-US": ["Correct answer", "Try again...", "You won! <i class='smile icon'></i> Don't forget to Start the project."],
        "ro-RO": ["Răspuns corect", "Mai încearcă...", "Ai câștigat! <i class='smile icon'></i> Nu uita să începi proiectul."],
    };

    // Language Change Event
    $selectLanguage.dropdown({
        onChange: function (value) {
            lang = value;
        }
    });

    // Start Voice Recognition
    $startButton.on("click", function () {
        $hideAfterStart.fadeOut(function () {
            $showAfterStart.fadeIn();
            startSpeechRecognition();
        });
    });

    // Start Voice Recognition
    function startSpeechRecognition() {
        speech = new SpeechRecognition();
        speech.lang = lang;
        speech.continuous = true;
        speech.interimResults = true;

        speech.onstart = function () {
            nextTest();
        };

        speech.onresult = function (event) {
            let message = '';
            let results = event.results;

            for (let i = event.resultIndex; i < results.length; i++) {
                if (!results[i].isFinal) {
                    message += results[i][0].transcript;
                }
            }

            checkAnswer(message);
        };

        speech.start();
    }

    // Possible Colors
    const possibleColors = [
        {
            name: { "ro-RO": "ROSU", "en-US": "RED" },
            value: "red"
        },
        {
            name: { "ro-RO": "PORTOCALIU", "en-US": "ORANGE" },
            value: "orange"
        },
        {
            name: { "ro-RO": "GALBEN", "en-US": "YELLOW" },
            value: "yellow"
        },
        {
            name: { "ro-RO": "VERDE", "en-US": "GREEN" },
            value: "green"
        },
        {
            name: { "ro-RO": "ALBASTRU", "en-US": "BLUE" },
            value: "blue"
        }
    ];

    // Start Next Test
    function nextTest() {
        $info.text("");
        if (possibleColors.length === 0) {
            $modal.find('.header').html('<i class="smile icon"></i>');
            $modal.find('.content').html(messages[lang][2]);
            $modal.modal("show");
            setTimeout(function () {
                window.location.href = "https://github.com/IonicaBizau/Color-Puzzle";
            }, 1000);
            speech.stop();
            return;
        }

        let randomIndex = Math.floor(Math.random() * possibleColors.length);
        currentColor = possibleColors[randomIndex];
        possibleColors.splice(randomIndex, 1);
        $colorPanel.css("background", currentColor.value);
    }

    // Check Answer
    function checkAnswer(guess) {
        guess = guess.trim();

        if (!guess || guess.length <= 2) {
            return;
        }

        let correctColorName = currentColor.name[lang].toUpperCase();
        let distance = levDist(guess.toUpperCase(), correctColorName);

        if (distance < 3) {
            $info.text(messages[lang][0]);
            $colorPanel.html('<i class="smile icon"></i>');
            setTimeout(function () {
                $info.text("");
                nextTest();
            }, 500);
        } else {
            $info.text(messages[lang][1]);
            $colorPanel.html('<i class="frown icon"></i>');
        }

        $colorPanel.find("i.icon").stop(true).transition('tada');
    }

    // Check if Speech Recognition is Supported
    function detectIfSpeechSupported() {
        if (!SpeechRecognition) {
            $modal.find('.content').text("Sorry... Your browser doesn't support speech recognition yet. Try Google Chrome version 25.");
            $modal.modal("show");
        } else {
            $hideAfterStart.fadeIn();
        }
    }

    // Levenshtein Distance Function
    const levDist = function (s, t) {
        let d = [];
        let n = s.length;
        let m = t.length;

        if (n === 0) return m;
        if (m === 0) return n;

        for (let i = n; i >= 0; i--) d[i] = [];

        for (let i = n; i >= 0; i--) d[i][0] = i;
        for (let j = m; j >= 0; j--) d[0][j] = j;

        for (let i = 1; i <= n; i++) {
            let s_i = s.charAt(i - 1);

            for (let j = 1; j <= m; j++) {
                if (i == j && d[i][j] > 4) return n;

                let t_j = t.charAt(j - 1);
                let cost = (s_i == t_j) ? 0 : 1;

                let mi = d[i - 1][j] + 1;
                let b = d[i][j - 1] + 1;
                let c = d[i - 1][j - 1] + cost;

                if (b < mi) mi = b;
                if (c < mi) mi = c;

                d[i][j] = mi;

                if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                }
            }
        }

        return d[n][m];
    };

    // Start Speech Recognition Support Detection
    detectIfSpeechSupported();
});
