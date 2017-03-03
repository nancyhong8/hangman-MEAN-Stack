
var hangmanApp = angular.module('hangmanApp', ['ui.bootstrap']);


// DIRECTIVE
// makes the instructiosn box draggable with jQuery UI
hangmanApp.directive('draggables', function dragInstructions() {
        function linkFunc(scope, element, attributes) {
            element.draggable();
        }
        return {
            link: linkFunc
        }
    }
)



// CONTROLLER
hangmanApp.controller('hangmanController', function hangmanController($scope, $modal, $http) {

    var newUsername;
    $scope.newUsername = newUsername;
    var oldUsername;
    $scope.oldUsername = oldUsername;
    $scope.startGame = startGame;
    var word;
    $scope.instructionVisible = true;

    var alphabet = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ]
    $scope.alphabet = alphabet;


    /**
     * renders game by setting all the game variables taken from server
     * @param game
     */
    function renderGame(game) {
        word = game.word
        $scope.loses = game.loses;
        $scope.wins = game.wins;
        $scope.wrongGuesses = game.wrongLetters.length;
        $scope.wrongLetter = game.wrongLetters.toString();
        if(game.wrongLetters.length > 0 && game.wrongLetters.length < 11) {
            drawArray[game.wrongLetters.length]();
        }
        spaceRender(game.spaces);
    }


    /**
     * starts the game by sending the username
     * to the database, depending whether its new or old
     * and gets sent back either a username error
     * or either a retrieved game or new game
     */
    function startGame() {
        // If its a new username
        if ($scope.newUsername != null) {
            $http({
                method: 'GET',
                url: '/api/new/' + $scope.newUsername
            }).then(function(game) {
                // if the username is already taken
                if (game.data == "usernameTaken") {
                    $scope.usernameTaken = true;
                    $scope.usernameTakenMSG = "This username is taken";
                } else {
                    // if username was created successfully,
                    // pass the game to render
                    $scope.instructionVisible = false;
                    renderGame(game.data);
                }

            }),function(error) {
                alert(error);
            }
        }
        // if username exists
        if ($scope.oldUsername != null) {
            console.log("reached oldusername");
            $http({
                method: 'GET',
                url: '/api/old/' + $scope.oldUsername
            }).then(function(game) {
                // if username cant be found
                if (game.data == "noUsername") {
                    $scope.usernameTaken = true;
                    $scope.usernameTakenMSG = "This username does not exist";
                } else {
                    // if username was found, send retrieved game to render
                    $scope.instructionVisible = false;
                    renderGame(game.data);
                }

            }),function(error) {
                alert(error);
            }
        }
    }


    /**
     * Handling the clicked letter
     * sends letter to the server to handle
     * then receives back a new game state to render
     * @param index of the alphabet clicked
     * @param event
     */
    $scope.letterClicked = function (index, event) {
        $scope.alreadyGuessed = false;
        $scope.letterClickedIndex = index;

        var letter = alphabet[index];
        $http({
            method: 'GET',
            url: '/api/letterClicked/' + letter
        }).then(function(game) {
            // If the database sends back that
            // the letter has already been clicked,
            // render the error msg in the html
            if(game.data == "alreadyGuessed") {
                $scope.alreadyGuessed = true;
                $scope.letterAlreadyGuessed = "This letter has already been guessed";
                return;
            }
            renderGame(game.data);
            // check if game is won
            if(!game.data.spaces.includes("_")) {
                openWon();
            }
            // check if game is lost
            if(!game.data.word.includes(letter)) {
                if (game.data.wrongLetters.length == 10) {
                    openLost();
                }

            }
        }),function(error) {
            alert(error);
        }

    }

    // Starts a new game
    $scope.playAnother = function() {
        $scope.oldUsername = oldUsername;
        startGame();
        // $modal.close($scope.modalInstance);
        $scope.modalInstance.close();
        // $modalInstance.dismiss('cancel');
        // modalInstance = $modal.close({
        //     templateUrl: "templates/loser.html"
        // });
        // $scope.instructionVisible = false;
        // location.reload();

        // $('modalInstance').modal('hide');

    }

    // When the game is lose or won,
    // using $modal, open a html modal template
    function openLost() {
        $scope.modalInstance = {
            templateUrl: "templates/loser.html",
            controller: "hangmanController"
        };
        $modal.open($scope.modalInstance);
    }
    function openWon() {
        $scope.modalInstance = {
            templateUrl: "templates/winner.html",
            controller: "hangmanController"
        }
        $modal.open($scope.modalInstance);
    }


    /**
     * Section below handles the drawing of hangman
     * some of the drawing code was taken from
     * https://codepen.io/cathydutton/pen/ldazc
     */


    /**
     * the drawing template
     * @param $pathFromx start x
     * @param $pathFromy start y
     * @param $pathTox finish x
     * @param $pathToy finish y
     */
    draw = function($pathFromx, $pathFromy, $pathTox, $pathToy) {
        myStickman = document.getElementById("myCanvas");
        context = myStickman.getContext('2d');
        context.moveTo($pathFromx, $pathFromy);
        context.lineTo($pathTox, $pathToy);
        context.stroke();
    }

    head = function(){
        console.log("reached head");
        myStickman = document.getElementById("myCanvas");
        context = myStickman.getContext('2d');
        context.beginPath();
        context.arc(60, 25, 10, 0, Math.PI*2, true);
        context.stroke();
    }
    frame0 = function() {
        draw (20, 0, 150, 0);
    }

    frame1 = function() {
        draw (0, 150, 150, 150);
    };

    frame2 = function() {
        draw (10, 0, 10, 600);
    };

    frame3 = function() {
        draw (0, 5, 70, 5);
    };

    frame4 = function() {
        draw (60, 5, 60, 15);
    };

    torso = function() {
        draw (60, 36, 60, 70);
    };

    rightArm = function() {
        draw (60, 46, 100, 50);
    };

    leftArm = function() {
        draw (60, 46, 20, 50);
    };

    rightLeg = function() {
        draw (60, 70, 100, 100);
    };
    leftLeg = function() {
        draw (60, 70, 20, 100);
    };

    // Array gets evoked in the renderGame method to draw the above components
    drawArray = [frame0, frame1, frame2, frame3, frame4, head, torso, leftArm, rightArm, leftLeg, rightLeg];
})


