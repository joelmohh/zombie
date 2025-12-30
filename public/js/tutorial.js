(function() {
    const tutorialSeen = localStorage.getItem('zombieTutorialSeen');
    
    window.addEventListener('load', function() {
        if (!tutorialSeen) {
                startTutorial();
        }
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
            steps: [
                {
                    title: '<img src="https://raw.githubusercontent.com/joelmohh/zombie/878e42ca64b721bcff0aa3286c41857606e0a652/public/assets/resources/logo.svg" alt="Project Logo" width="200"/>',
                    intro: 'Let\'s learn how to play this zombie survival game! Click "Next" to continue.'
                },
                {
                    element: document.querySelector('#game'),
                    title: 'Game Field',
                    intro: 'This is the game field where you control your character. Use the <strong>W, A, S, D</strong> keys to move.'
                },
                {
                    title: 'How to Attack',
                    intro: 'Use your <strong>mouse</strong> to aim and <strong>left-click</strong> to attack zombies!<br><br> Tip: Your character always faces the direction of your mouse cursor.'
                },
                {
                    element: document.querySelector('.stats-bar'),
                    title: 'Health Bar',
                    intro: 'This is your health bar. If it reaches zero, it\'s game over so stay alert and use health potions when needed.'
                },
                {
                    element: document.querySelector('.resources'),
                    title: 'Resources',
                    intro: 'Here are your resources:<br><br>GOLD - For buying upgrades<br>WOOD - For building structures<br>STONE - For building structures<br><br>Tip: Collect resources with your axe (and the attack button) in the trees and the stones!'
                },
                {
                    element: document.querySelector('.construction-bar'),
                    title: 'Construction Bar',
                    intro: 'Here are the structures you can build:<br><br><strong>Wall</strong> - Protects your base<br><strong>Gold Mine</strong> - Generates gold automatically (build first!)<br><strong>Gold Miner</strong> - Collects gold from mine<br><strong>Towers</strong> - Attack zombies automatically<br><strong>Door</strong> - You can pass through, zombies can\'t<br><br>Tip: Click on a structure, then click on the map to build!'
                },
                {
                    element: document.querySelector('.inventory'),
                    title: 'Weapon Inventory',
                    intro: 'Your weapon inventory:<br><br> <strong>Sword</strong> - Melee attack<br><strong>Axe</strong> - Stronger than sword<br><strong>Bow</strong> - Ranged attack<br><strong>Health Potion</strong> - Restores health<br> <strong>Shield Potion</strong> - Adds shield<br><br>Tip: Use keys <strong>1, 2, 3, 4, 5</strong> to quickly switch!'
                },
                {
                    element: document.querySelector('.btn-map.shop'),
                    title: 'Shop',
                    intro: 'In the shop you can:<br><br><strong>Upgrade your weapons</strong> using gold<br> <strong>Buy potions</strong> for health and shield<br><br>Tip: Upgrade your weapons to deal more damage to zombies!'
                },
                {
                    title: 'Game Strategy',
                    intro: '<strong>Recommended steps:</strong><br><br>1. Collect resources on the map (gold, wood, stone)<br>2. Build a <strong>Gold Mine</strong> as soon as possible<br>3. Build a <strong>Gold Miner</strong> next to the mine<br>4. Build <strong>walls</strong> around your base<br>5. Add <strong>towers</strong> for defense<br>6. Upgrade your <strong>weapons</strong> in the shop<br>7. Survive as long as you can!'
                },
                {
                    title: 'Useful Shortcuts',
                    intro: '<strong>Important keys:</strong><br><br> <strong>W, A, S, D</strong> - Movement<br> <strong>Mouse</strong> - Aim and attack<br> <strong>1-5</strong> - Switch weapons/potions<br> <strong>6-0</strong> - Select structures<br> <strong>ESC</strong> - Cancel construction/weapon<br> <strong>Right-click</strong> on structures - Upgrade/delete menu'
                },
                {
                    title: 'Ready to Play!',
                    intro: 'Now you know the basics! Good luck surviving the zombies!<br><br>Tip: Press <strong>F1</strong> or click the <strong>HELP</strong> button if you need help again.<br><strong>Have fun!</strong>'
                }
            ]
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
