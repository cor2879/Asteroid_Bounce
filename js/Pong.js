/*
 * Pong.js
 *
 * @author: David Cole
 * @date:   6/28/2009
 *
 * @description: Contains the JavaScript code necessary for creating and running
 *      an instance of DHTML Pong, a Pong clone written by me. To run, simply
 *      include the Pong.js script file in your HTML page and create an instance
 *      of the PongGame class.  You may optionally pass in a parent element that will
 *      contain the game, otherwise it will append itself to the page body. This
 *      application has been tested and works in both Microsoft Internet Explorer 8 and
 *      Mozilla Firefox 3.
 *       
 *      Dependencies:  ClientScript/Utilities.js, images/Ball.gif, images/leftPaddle.gif,
 *          images/rightPaddle.gif, images/MainBG.jpg
 *       
 *      Enjoy!
 */
 

var PongGame = function(parent, gameState) {
    this.paused = true;
    
    this.parent = ((parent) ? parent : document.body);
    
    if (gameState && gameState.ball) {
        gameState.ball.game = this;
    }

    this.initPage(gameState);

    return;
};

// Constants
PongGame.PADDLE_DOWN = 40;
PongGame.PADDLE_UP = 38;
PongGame.SPACEBAR = 32;

PongGame.DefaultMaxPaddleSpeed = window.innerHeight / 20;
PongGame.MaxAiSpeed = PongGame.DefaultMaxPaddleSpeed;
PongGame.PlayerSpeed = PongGame.DefaultMaxPaddleSpeed;
PongGame.BallStartSpeed = window.innerHeight / 50;
PongGame.ClickMargin = window.innerWidth / 10;
PongGame.GameLoopInterval = 50;

PongGame.prototype = {

    getBall: function() {
        return 
    },

    initPage: function (gameState) {
        var game = this;

        if (!this.board) {
            this.board = PongGame.createGameBoard('images/MainBG.jpg',
            function () { game.load(gameState); }, this);


            if (this.parent) {
                this.parent.appendChild(this.board);
            }
            else {
                document.body.appendChild(this.board);
            }

            window.document.addEventListener('keydown', this.onKeyPress, false);
        }
    },

    load: function (gameState) {

        // Hide the title
        Utilities.hideObject(this.board.Title);

        var boardXY = this.board.getXY();
        var boardDimensions = Utilities.getDimensions(this.board);

        // Set up left paddle
        if (!this.leftPaddle) {
            this.leftPaddle = PongGame.createPaddle('leftPaddle', 'images/leftPaddle.gif', this);
            this.board.appendChild(this.leftPaddle);
        }

        var paddleXY = Utilities.calculateXYforChildCenterAlign(this.board, this.leftPaddle);
        var paddleMargin = boardDimensions.width / 100;

        this.leftPaddle.style.top = paddleXY.y + 'px';
        this.leftPaddle.style.left = (boardXY.x + paddleMargin) + 'px';
        Utilities.showObject(this.leftPaddle);

        // Set up right paddle
        if (!this.rightPaddle) {
            this.rightPaddle = PongGame.createPaddle('rightPaddle', 'images/rightPaddle.gif', this);
            this.board.appendChild(this.rightPaddle);
        }

        this.rightPaddle.style.top = paddleXY.y + 'px';
        this.rightPaddle.style.left = (this.board.getRight() - this.rightPaddle.offsetWidth - paddleMargin) + 'px';

        Utilities.showObject(this.rightPaddle);

        if (!this.ball) {
            this.ball = PongGame.createBall('images/Ball.gif', this);
            Utilities.hideObject(this.ball);
            this.board.appendChild(this.ball);
        }

        // Set up ScoreBoards
        if (!this.player1ScoreBoard) {
            this.player1ScoreBoard = PongGame.createScoreBoard('player1Score', '#00FF00', this);
            this.board.appendChild(this.player1ScoreBoard);
        }
        
        this.player1ScoreBoard.setScore((gameState && gameState.player1Score) ? gameState.player1Score : 0);
        this.player1ScoreBoard.style.top = boardXY.y + 'px';
        this.player1ScoreBoard.style.left = (boardXY.x + (window.innerWidth / 10)) + 'px';
        Utilities.showObject(this.player1ScoreBoard);

        if (!this.player2ScoreBoard) {
            this.player2ScoreBoard = PongGame.createScoreBoard('player2Score', '#00FF00', this);
            this.board.appendChild(this.player2ScoreBoard);
        }

        this.player2ScoreBoard.setScore((gameState && gameState.player2Score) ? gameState.player2Score : 0);
        this.player2ScoreBoard.style.top = boardXY.y + 'px';
        this.player2ScoreBoard.style.left = (this.board.getRight() - ((window.innerHeight / 10) + (window.innerWidth / 10))) + 'px';
        Utilities.showObject(this.player2ScoreBoard);

        if (!this.playerUpdate) {
            this.playerUpdate = PongGame.createUpdater('playerUpdate', '#00FF00', this);
            this.board.appendChild(this.playerUpdate);
            Utilities.hideObject(this.playerUpdate);
        }

        var playerUpdateXY = Utilities.calculateXYforChildCenterAlign(this.board, this.playerUpdate);

        this.playerUpdate.style.top = playerUpdateXY.y + 'px';
        this.playerUpdate.style.left = playerUpdateXY.x + 'px';

        PongGame.createPlayControl('playControl', this);

        this.soundEffects = PongGame.createSoundEffects();

        window.document.addEventListener('mousedown', this.mousedown, false);
        window.document.addEventListener('mouseup', this.mouseup, false);
        this.startGame(this.ball, gameState);
    },

    onKeyPress: function(e) {
        var evt = (e) ? e : ((window.event) ? event : null);

        if (!evt) {
            return;
        }

        if (evt.keyCode == PongGame.SPACEBAR) {
            document.getElementById('pongGame').click();
        }
    },

    mousedown: function(e) {
        var evt = (e) ? e : ((window.event) ? event : null);

        if (!evt) {
            return;
        }

        if (evt.clientX < PongGame.ClickMargin) {
            var leftPaddle = document.getElementById('leftPaddle');

            leftPaddleXY = Utilities.getXY(leftPaddle);
            leftPaddleDimensions = Utilities.getDimensions(leftPaddle);
            var leftPaddleMiddle = leftPaddleXY.y + (leftPaddleDimensions.height / 2);

            // If the touch/click event is up/left of the left paddle, move up, if it was dow.n/right of the left paddle, move down
            PongGame.IsUpPressed = evt.clientY < leftPaddleMiddle;
            PongGame.IsDownPressed = evt.clientY > leftPaddleMiddle;
        }
    },

    mouseup: function (e) {
        var evt = (e) ? e : ((window.event) ? event : null);

        if (!evt) {
            return;
        }

        PongGame.IsUpPressed = false;
        PongGame.IsDownPressed = false;
    },

    // moves the Left Paddle up or down, within the bounds of the game board
    movePaddle: function(paddle, direction, speed) {

        if (direction >= 1) // Up
        {
            this.movePaddleUp(paddle, speed);
        }

        if (direction <= 0) // Down
        {
            this.movePaddleDown(paddle, speed);
        }
    },

    movePaddleUp: function(paddle, speed) {
        var boardXY = this.board.getXY();
        var paddleXY = paddle.getXY();

        if (paddleXY.y > boardXY.y) {
            paddle.style.top = (paddleXY.y - speed) + 'px';
        }
    },

    movePaddleDown: function(paddle, speed) {
        var paddleXY = paddle.getXY();

        if (paddle.getBottom() < this.board.getBottom()) {
            paddle.style.top = (paddleXY.y + speed) + 'px';
        }
    },

    // This is the primary game loop function.  Contains a recursive loop
    // that runs until the Ball passes beyond the bounds of either the
    // player 1 side or player 2 side, at which time one of the players scores.
    update: function(ball, directionX, directionY, speedX, speedY, game) {

        if (!game) {
            game = this;
        }

        if (game.paused) {
            return;
        }

        ball.directionX = directionX;
        ball.directionY = directionY;

        if (game.isKeyPressed(PongGame.PADDLE_DOWN) || PongGame.IsDownPressed) {
            game.movePaddleDown(game.leftPaddle, PongGame.PlayerSpeed);
        }

        if (game.isKeyPressed(PongGame.PADDLE_UP) || PongGame.IsUpPressed) {
            game.movePaddleUp(game.leftPaddle, PongGame.PlayerSpeed);
        }

        game.moveBallY(ball, directionY, speedY);

        game.moveBallX(ball, directionX, speedX);

        var ballBottom = ball.getBottom();
        var ballXY = ball.getXY();
        var ballRight = ball.getRight();
        var leftPaddleXY = game.leftPaddle.getXY();
        var rightPaddleXY = game.rightPaddle.getXY();
        var boardXY = game.board.getXY();
        var boardBottom = game.board.getBottom();
        var boardRight = game.board.getRight();

        // If the ball collides with the bottom border, change vertical direction
        if (ballBottom >= boardBottom) {
            directionY = 1;
            speedY++;
            speedX++;
            game.soundEffects.mediumBang.play();
        }

        // If the ball collides with the top border, change vertical direction
        else if (ballXY.y <= boardXY.y) {
            directionY = -1;
            speedY++;
            speedX++;
            game.soundEffects.mediumBang.play();
        }

        // test for a collision with the left paddle
        if ((ballXY.x <= leftPaddle.getRight()) && (ballXY.x >= boardXY.x)) {
            if ((ballBottom >= leftPaddleXY.y) && (ballXY.y <= leftPaddle.getBottom())) {
                directionX = 1;
                speedX++;
                speedY++;
                game.soundEffects.largeBang.play();

                // increase horizontal speed if a paddle hits the ball on its corner
                //if (ballBottom <= (leftPaddleXY.y / 20) || (ballXY.y >= (leftPaddle.getBottom() / 20))) {
                //    speedX++;
                //}
            }
        }

        // otherwise test for a collision with the right paddle
        if ((ballRight >= rightPaddleXY.x) && (ballRight <= boardRight)) {
            if ((ballBottom >= rightPaddleXY.y) && (ballXY.y <= rightPaddle.getBottom())) {
                directionX = -1;
                speedX++;
                speedY++;

                game.soundEffects.largeBang.play();

                // increase horizontal speed if a paddle hits the ball on its corner
                //if (ballBottom <= (rightPaddleXY.y / 20) || (ballXY.y >= (rightPaddle.getBottom() / 20))) {
                //    speedX++;
                //}
            }
        }

        // Track the ball with the Right Paddle
        game.movePaddleAI(ball, game.rightPaddle)

        if (ballXY.x <= boardXY.x) {

            game.player2ScoreBoard.incrementScore();
            var updateText;

            if (game.player2ScoreBoard.getScore() == 10) {
                updateText = 'You dropped too many asteroids on the Earth.<br/>You lose.<br />Tap or click screen to start a new game.';
                game.soundEffects.gameOver.play();
                game.board.onclick = function (evt) {
                    game.player1ScoreBoard.setScore(0);
                    game.player2ScoreBoard.setScore(0);
                    if (game.resume()) {
                        game.board.onclick = null;
                    }
                };
            }
            else {
                updateText = "Player 2 Scored!<br />Tap or click screen to continue.";
                game.soundEffects.lose.play();
                game.board.onclick = function (evt) {
                    if (game.resume()) {
                        game.board.onclick = null;
                    }
                };
            }

            game.playerUpdate.setText(updateText);
            Utilities.showObject(game.playerUpdate);

            game.paused = true;
            Utilities.hideObject(game.playControl);
        }
        else if (ballRight >= boardRight) {

            game.player1ScoreBoard.incrementScore();
            var updateText;

            if (game.player1ScoreBoard.getScore() == 10) {
                updateText = 'Congratulations!  Your wingman is much worse at saving the Earth than you are!';
                game.soundEffects.victory.play();
                game.board.onclick = function (evt) {
                    game.player1ScoreBoard.setScore(0);
                    game.player2ScoreBoard.setScore(0);
                    if (game.resume()) {
                        game.board.onclick = null;
                    }
                };
            }
            else {
                updateText = "Player 1 Scored!<br />Tap or click screen to continue.";
                game.soundEffects.score.play();
                game.board.onclick = function (evt) {
                    if (game.resume()) {
                        game.board.onclick = null;
                    }
                };
            }

            game.playerUpdate.setText(updateText);
            Utilities.showObject(game.playerUpdate);

            game.paused = true;
            Utilities.hideObject(game.playControl);
        }
        // Use the setTimeout function to keep the game loop active.
        // if ((ballXY.x > boardXY.x) && (ballRight < boardRight))
        else {
            game.gameState = { 
                ball: ball, 
                directionX: directionX, 
                directionY: directionY, 
                speedX: speedX, 
                speedY: speedY,
                player1Score: game.player1ScoreBoard.getScore(),
                player2Score: game.player2ScoreBoard.getScore()
            };

            setTimeout(function() { game.update(ball, directionX, directionY, speedX, speedY, game) }, PongGame.GameLoopInterval);
        }
    },

    // Responsible for moving the ball vertically
    moveBallY: function(ball, direction, speed) {

        var ballXY = ball.getXY();

        if (direction >= 1) // Up
        {
            ball.style.top = (ballXY.y - speed) + 'px';
        }

        if (direction <= 0) // Down
        {
            ball.style.top = (ballXY.y + speed) + 'px';
        }
    },

    // Responsible for moving the ball horizontally
    moveBallX: function(ball, direction, speed) {

        var ballXY = ball.getXY();

        if (direction >= 1) // Right
        {
            ball.style.left = (ballXY.x + speed) + 'px';
        }

        if (direction <= 0) // Left
        {
            ball.style.left = (ballXY.x - speed) + 'px';
        }
    },

    pause: function () {
        this.soundEffects.blip.play();
        this.paused = true;
        this.playControl.playImg.style.display = 'block';
        this.playControl.pauseImg.style.display = 'none';
    },

    play: function () {
        if (!((Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.snapped) ||
            (Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.filled))) {
            this.soundEffects.blip.play();
            this.paused = false;
            this.playControl.playImg.style.display = 'none';
            this.playControl.pauseImg.style.display = 'block';
            this.update(this.gameState.ball, this.gameState.directionX, this.gameState.directionY, this.gameState.speedX, this.gameState.speedY, this);
        }
    },

    startGame: function(ball, gameState) {
        this.paused = false;

        if (!ball) {
            ball = this.ball;
        }

        var boardXY = this.board.getXY();
        var boardBottom = this.board.getBottom();
        var boardRight = this.board.getRight();

        var ballXY = Utilities.calculateXYforChildCenterAlign(this.board, ball);

        ball.style.top = ballXY.y + 'px';
        ball.style.left = ballXY.x + 'px';

        Utilities.showObject(ball);
        var xDir = Math.floor(Math.random() * 2);
        var yDir = Math.floor(Math.random() * 2);

        this.update(ball, yDir, xDir, PongGame.BallStartSpeed, PongGame.BallStartSpeed);
    },

    getScores: function() {
        var scores = new Object();
        scores.player1 = this.player1ScoreBoard.getScore();
        scores.player2 = this.player2ScoreBoard.getScore();

        return scores;
    },

    getBoardXY: function() {
        return this.board.getXY();
    },

    movePaddleAI: function(ball, paddle) {
        var ballXY = ball.getXY();
        var ballBottom = ball.getBottom();
        var ballCenter = ((ballBottom - ballXY.y) >> 1) + ballXY.y;
        var paddleXY = paddle.getXY();
        var paddleBottom = paddle.getBottom();
        var paddleCenter = ((paddleBottom - paddleXY.y) >> 1) + paddleXY.y;

        var direction = paddleCenter - ballCenter;
        var magnitude = Math.abs(direction);
        var speed = (magnitude > PongGame.MaxAiSpeed) ? PongGame.MaxAiSpeed : magnitude;
        
        if (direction && ball.directionX > 0) {
            this.movePaddle(paddle, direction, speed);
        }
        else {
            var boardMiddleDimensions = Utilities.calculateXYforChildCenterAlign(this.board, paddle);

            var direction = paddleXY.y - boardMiddleDimensions.y;
            var magnitude = Math.abs(direction);
            var speed = (magnitude > PongGame.MaxAiSpeed) ? PongGame.MaxAiSpeed : magnitude;

            if (direction) {
                this.movePaddle(paddle, direction, speed);
            }
        }
    },

    resume: function () {
        if ((Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.snapped) ||
            (Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.filled)) {
            return false;
        }

        Utilities.hideObject(this.playerUpdate);
        Utilities.showObject(this.playControl);
        this.startGame(this.ball);

        return true;
    }
};

PongGame.createGameBoard = function(backgroundImg, onStartClick, game) {
    var board = document.createElement('div');

    board.id = 'pongGame';
    board.game = game;
    game.board = board;
    board.style.width = window.outerWidth + 'px';
    board.style.height = window.outerHeight + 'px';

    if (backgroundImg) {
        board.style.backgroundImage = 'url(images/MainBG.jpg)';
        board.style.backgroundSize = '100%';
    }

    board.style.borderWidth = '0px';
    board.style.zIndex = '0';
    board.style.position = 'absolute';
    board.style.top = '0px';
    board.style.left = '0px';

    // PongGame.createAdsWindow(game);

    board.Title = PongGame.createTitle('Asteroid Bounce!<br />Tap or click screen to begin', '#000000', '#00FF00', onStartClick, game);
    var coordinates = Utilities.calculateXYforChildCenterAlign(board, board.Title);

    board.Title.style.top = coordinates.y + 'px';
    board.Title.style.left = coordinates.x + 'px';
    board.appendChild(board.Title);
    Utilities.showObject(board.Title);

    board.getDimensions = function () {
        if (!board.dimensions) {
            board.dimensions = Utilities.getDimensions(board);
        }

        return board.dimensions;
    };

    board.getXY = function() {
        return Utilities.getXY(board);
    };

    board.getBottom = function () {
        board.getDimensions();
        return board.getXY().y + board.dimensions.height;
    };

    board.getRight = function () {
        board.getDimensions();
        return board.getXY().x + board.dimensions.width;
    };

    return board;
}

PongGame.createTitle = function(text, backColor, textColor, onStartClick, game) {
    var title = document.createElement('div');
    title.id = 'gameTitle';
    title.game = game;
    title.style.backgroundColor = backColor;

    var dimensions = Utilities.getDimensions(game.board);

    title.style.width = (dimensions.width / 5) + 'px';
    title.style.height = (dimensions.width / 10) + 'px';
    title.style.opacity = '50';
    title.style.position = 'absolute';
    title.style.textAlign = 'center';
    title.style.fontSize = (dimensions.height / 30) + 'px';
    title.style.fontFamily = 'Courier New';
    title.style.zIndex = 5;
    title.style.color = textColor;

    var innerText = document.createElement('div');
    innerText.innerHTML = text;
    title.appendChild(innerText);

    game.board.onclick = function (evt) {
        if (!((Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.snapped) ||
            (Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.filled))) {
            onStartClick(evt);
            game.board.onclick = null;
        }
    };

    title.getXY = function() {
        return Utilities.getXY(title);
    }

    return title;
}

PongGame.createPaddle = function(id, imageUrl, game) {
    var paddle = document.createElement('div');
    paddle.id = id;
    paddle.style.position = 'absolute';
    paddle.style.zIndex = 5;
    paddle.style.backgroundColor = 'transparent';

    var boardDimensions = game.board.getDimensions();

    paddle.style.width = (boardDimensions.width / 25) + 'px';
    paddle.style.height = (boardDimensions.height / 8) + 'px';
    paddle.game = game;

    var img = Utilities.createImage(imageUrl, id);
    img.style.width = '100%';
    img.style.height = '100%';
    paddle.appendChild(img);

    paddle.getDimensions = function () {
        if (!paddle.dimensions) {
            paddle.dimensions = Utilities.getDimensions(paddle);
        }

        return paddle.dimensions;
    };

    paddle.getXY = function() {
        return Utilities.getXY(paddle);
    };

    paddle.getBottom = function() {
        return paddle.getXY().y + paddle.getDimensions().height;
    };

    paddle.getRight = function() {
        return paddle.getXY().x + paddle.getDimensions().width;
    }

    return paddle;
}

PongGame.createBall = function(imageUrl, game) {
    var ball = document.createElement('div');
    ball.id = 'ball';
    ball.style.position = 'absolute';

    var boardDimensions = game.board.getDimensions();

    ball.style.height = (boardDimensions.height / 20) + 'px';
    ball.style.width = ball.style.height;
    ball.style.zIndex = 5;
    ball.style.backgroundColor = 'transparent';
    ball.game = game;

    var img = Utilities.createImage(imageUrl, 'ball');
    img.style.width = '100%';
    img.style.height = '100%';

    ball.appendChild(img);

    ball.getDimensions = function () {
        if (!ball.dimensions) {
            ball.dimensions = Utilities.getDimensions(ball);
        }

        return ball.dimensions;
    };

    ball.getXY = function() {
        return Utilities.getXY(ball);
    };

    ball.getBottom = function() {
        return ball.getXY().y + ball.getDimensions().height;
    };

    ball.getRight = function() {
        return ball.getXY().x + ball.getDimensions().width;
    };

    return ball;
}

PongGame.createScoreBoard = function(id, textColor, game) {
    var scoreBoard = document.createElement('div');
    scoreBoard.id = id;
    scoreBoard.style.position = 'absolute';
    scoreBoard.style.backgroundColor = 'transparent';

    var dimensions = game.board.getDimensions();

    scoreBoard.style.fontSize = (dimensions.height / 10) + 'px';
    scoreBoard.style.color = textColor;
    scoreBoard.style.fontFamily = 'Courier New';
    scoreBoard.style.font.weight = 'bold';
    scoreBoard.style.zIndex = 10;
    scoreBoard.game = game;

    scoreBoard.setScore = function (score) {
        scoreBoard.score = score;
        scoreBoard.innerHTML = score;
    };

    scoreBoard.getScore = function() {
        return scoreBoard.score;
    };

    scoreBoard.incrementScore = function() {
        scoreBoard.score++;
        scoreBoard.innerHTML = scoreBoard.score;
    }

    return scoreBoard;
}

PongGame.createUpdater = function(id, textColor, game) {
    var updater = document.createElement('div');
    updater.id = id;
    updater.style.color = textColor;
    updater.style.textAlign = 'center';
    updater.style.verticalAlign = 'center';
    updater.style.backgroundColor = '#000000';
    updater.style.position = 'absolute';

    var dimensions = game.board.getDimensions();
    updater.style.height = (dimensions.width / 5) + 'px';
    updater.style.width = (dimensions.width / 5) + 'px';

    updater.style.fontSize = (dimensions.height / 30) + 'px';
    updater.style.fontFamily = 'Courier New';
    updater.style.font.weight = 'bold';
    updater.style.zIndex = 10;
    updater.game = game;

    updater.getText = function() { return updater.innerHTML; };
    updater.setText = function(value) { updater.innerHTML = value; };

    return updater;
}

PongGame.createPlayControl = function (id, game) {
    var playControl = document.createElement('div');

    playControl.onclick = function (e) {
        if (game.paused) {
            game.play();
        }
        else {
            game.pause();
        };
    }

    playControl.getDimensions = function () {
        if (!playControl.dimensions) {
            playControl.dimensions = Utilities.getDimensions(playControl);
        }

        return playControl.dimensions;
    }

    playControl.id = id;

    playControl.game = game;
    game.playControl = playControl;
    playControl.backgroundColor = 'transparent';
    
    var dimensions = game.board.getDimensions();
    playControl.style.height = (dimensions.width / 20) + 'px';
    playControl.style.width = (dimensions.width / 20) + 'px';

    playControl.style.position = 'absolute';
    var playControlXY = Utilities.calculateXYforChildCenterAlign(game.board, playControl);
    var playControlDimensions = playControl.getDimensions();
    playControl.style.top = (dimensions.height - playControlDimensions.height) + 'px';
    playControl.style.left = playControlXY.x + 'px';

    var pauseImg = Utilities.createImage('images/RetroPause.png', id + '_pause');
    pauseImg.style.width = '100%';
    pauseImg.style.height = '100%';
    pauseImg.style.display = 'block';
    playControl.appendChild(pauseImg);
    playControl.pauseImg = pauseImg;

    var playImg = Utilities.createImage('images/RetroPlay.png', id + '_play');
    playImg.style.width = '100%';
    playImg.style.height = '100%';
    playImg.style.display = 'none';
    playControl.appendChild(playImg);
    playControl.playImg = playImg;
    
    playControl.style.zIndex = 10;

    game.board.appendChild(playControl);
}

PongGame.createSoundEffects = function () {
    var soundEffects = new Object();

    soundEffects.largeBang = document.createElement('audio');
    soundEffects.largeBang.src = 'soundeffects/banglrg.wav';

    soundEffects.mediumBang = document.createElement('audio');
    soundEffects.mediumBang.src = 'soundeffects/bangmed.wav';

    soundEffects.lose = document.createElement('audio');
    soundEffects.lose.src = 'soundeffects/lose.wav';

    soundEffects.blip = document.createElement('audio');
    soundEffects.blip.src = 'soundEffects/blip.wav';

    soundEffects.score = document.createElement('audio');
    soundEffects.score.src = 'soundeffects/008166431-retro-sfx-22.wav';

    soundEffects.gameOver = document.createElement('audio');
    soundEffects.gameOver.src = 'soundeffects/022802605-8bit-retro-game-over.wav';

    soundEffects.victory = document.createElement('audio');
    soundEffects.victory.src = 'soundeffects/022802601-8bit-retro-victory-melody.wav';
    
    return soundEffects;
}

PongGame.createAdsWindow = function (game) {
    var adNode = document.createElement('div');

    adNode.id = 'adNode';
    adNode.position = 'absolute';
    adNode.style.width = '292px';
    adNode.style.height = '60px';
    adNode.style.zIndex = 10;
    adNode.style.borderColor = 'blue';
    adNode.style.borderWidth = '3px';
  
    var adNodeXY = Utilities.calculateXYforChildCenterAlign(game.board, adNode);
    adNode.style.top = game.board.style.top;
    adNode.style.left = adNodeXY.x + 'px';

    adNode.attributes['data-win-control'] = 'MicrosoftNSJS.Advertising.AdControl';
    adNode.attributes['data-win-options'] = "{applicationId: 'e9f3be2d-41ae-4fb5-9bae-8af11fe83696', adUnitId: '130291'}";

    game.board.appendChild(adNode);
}