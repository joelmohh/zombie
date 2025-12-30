(function() {
    const tutorialSeen = localStorage.getItem('zombieTutorialSeen');
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (!tutorialSeen) {
                startTutorial();
            }
        }, 1000);
    });

    function startTutorial() {
        const intro = introJs();
        
        intro.setOptions({
            nextLabel: 'Next',
            prevLabel: 'Back',
            doneLabel: 'Let\'s Play!',
            skipLabel: 'x',
            exitOnOverlayClick: false,
            exitOnEsc: false,
            showStepNumbers: true,
            showBullets: true,
            showProgress: true,
            scrollToElement: true,
            steps: []
        });

        intro.oncomplete(function() {
            localStorage.setItem('zombieTutorialSeen', 'true');
        });

        intro.onexit(function() {
            localStorage.setItem('zombieTutorialSeen', 'true');
        });

        intro.start();
    }

    // Open the tutorial again when HELP button is clicked
    window.addEventListener('load', function() {
        setTimeout(function() {
            const helpButton = document.querySelector('.btn-map.help');
            if (helpButton) {
                helpButton.addEventListener('click', function(e) {
                    // Offer option to see the tutorial again
                    const tutorialAgain = confirm('Would you like to see the tutorial again?');
                    if (tutorialAgain) {
                        e.stopPropagation();
                        e.preventDefault();
                        startTutorial();
                    }
                }, true);
            }
        }, 1000);
    });

    window.resetTutorial = function() {
        localStorage.removeItem('zombieTutorialSeen');
        location.reload();
    };
})();
