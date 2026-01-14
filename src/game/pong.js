/*
 * pong.js
 *
 * @author: David Cole
 * @date:   6/28/2009
 *
 * @description: Contains the JavaScript code necessary for creating and running
 *      an instance of DHTML Pong, a Pong clone written by me. To run, simply
 *      include the pong.js script file in your HTML page and create an instance
 *      of the pongGame class.  You may optionally pass in a parent element that will
 *      contain the game, otherwise it will append itself to the page body. This
 *      application has been tested and works in both Microsoft Internet Explorer 8 and
 *      Mozilla Firefox 3.
 *       
 *      Dependencies:  ClientScript/Utilities.js, images/Ball.gif, images/leftPaddle.gif,
 *          images/rightPaddle.gif, images/MainBG.jpg
 *       
 *      Enjoy!
 */
 
import Utilities from './Utilities';

var pongGame = function(parent, gameState) {
    this.paused = true;
    
    this.parent = ((parent) ? parent : document.body);
    
    if (gameState && gameState.ball) {
        gameState.ball.game = this;
    }

    this.initPage(gameState);

    return;
};

// Constants
pongGame.PADDLE_DOWN = 40;
pongGame.PADDLE_UP = 38;
pongGame.SPACEBAR = 32;
pongGame.ASPECT_RATIO = 16/9;
pongGame.MAX_BOARD_WIDTH = 1600;
pongGame.MIN_BOARD_WIDTH = 800;
pongGame.MAX_BALL_SPEED = 30;
pongGame.keys = {};

pongGame.DefaultMaxPaddleSpeed = window.innerHeight / 20;
pongGame.ClickMargin = window.innerWidth / 10;
pongGame.GameLoopInterval = 50;

window.addEventListener('keydown', (e) => {
    pongGame.keys[e.keyCode] = true;
});

window.addEventListener('keyup', (e) => {
    pongGame.keys[e.keyCode] = false;
});

pongGame.prototype = {

    getBall: function() {
        return this.ball;
    },

    initPage: function (gameState) {
        var game = this;

        if (!this.board) {
            this.board = pongGame.createGameBoard('/images/MainBG.jpg',
            function () { game.load(gameState); }, this);


            if (this.parent) {
                this.parent.appendChild(this.board);
            }
            else {
                document.body.appendChild(this.board);
            }

            window.document.addEventListener('keydown', this.onKeyPress, false);
            window.document.addEventListener(
                'mousedown',
                this.mousedown.bind(this),
                false);

            window.document.addEventListener(
                'mouseup',
                this.mouseup.bind(this),
                false);
        }

        pongGame.MaxAiSpeed = pongGame.DefaultMaxPaddleSpeed;
        pongGame.PlayerSpeed = pongGame.DefaultMaxPaddleSpeed;
        pongGame.BallStartSpeed = this.board.getDimensions().width / 250;
    },

    isKeyPressed: function (keyCode) {
        return !!pongGame.keys[keyCode];
    },

    load: function (gameState) {

        // Hide the title
        // Utilities.hideObject(this.board.Title);

        var boardXY = this.board.getXY();
        var boardDimensions = Utilities.getDimensions(this.board);

        // Set up left paddle
        if (!this.leftPaddle) {
            this.leftPaddle = pongGame.createPaddle('leftPaddle', '/images/LeftPaddle.gif', this);
            this.board.appendChild(this.leftPaddle);
        }

        var paddleXY = Utilities.calculateXYforChildCenterAlign(this.board, this.leftPaddle);
        var paddleMargin = boardDimensions.width / 100;

        this.leftPaddle.style.top = paddleXY.y + 'px';
        this.leftPaddle.style.left = paddleMargin + 'px';
        Utilities.showObject(this.leftPaddle);

        // Set up right paddle
        if (!this.rightPaddle) {
            this.rightPaddle = pongGame.createPaddle('rightPaddle', '/images/RightPaddle.gif', this);
            this.board.appendChild(this.rightPaddle);
        }

        this.rightPaddle.style.top = paddleXY.y + 'px';
        const boardWidth = boardDimensions.width;
        this.rightPaddle.style.left =
            (boardWidth - this.rightPaddle.offsetWidth - paddleMargin) + 'px';

        Utilities.showObject(this.rightPaddle);

        if (!this.ball) {
            this.ball = pongGame.createBall('/images/Ball.gif', this);
            Utilities.hideObject(this.ball);
            this.board.appendChild(this.ball);
        }

        // Set up ScoreBoards
        if (!this.player1ScoreBoard) {
            this.player1ScoreBoard = pongGame.createScoreBoard('player1Score', '#00FF00', this);
            this.board.appendChild(this.player1ScoreBoard);
        }
        
        this.player1ScoreBoard.setScore((gameState && gameState.player1Score) ? gameState.player1Score : 0);
        this.player1ScoreBoard.style.left = (boardDimensions.width * 0.1) + 'px';
        this.player1ScoreBoard.style.top = (boardDimensions.height * 0.05) + 'px';

        if (!this.player2ScoreBoard) {
            this.player2ScoreBoard = pongGame.createScoreBoard('player2Score', '#00FF00', this);
            this.board.appendChild(this.player2ScoreBoard);
        }

        this.player2ScoreBoard.setScore((gameState && gameState.player2Score) ? gameState.player2Score : 0);
        this.player2ScoreBoard.style.left = 
            (boardDimensions.width * 0.9 - this.player2ScoreBoard.offsetWidth) + 'px';
        this.player2ScoreBoard.style.top = (boardDimensions.height * 0.05) + 'px';

        if (!this.playerUpdate) {
            this.playerUpdate = pongGame.createUpdater('playerUpdate', '#00FF00', this);
            this.board.appendChild(this.playerUpdate);
            Utilities.hideObject(this.playerUpdate);
        }

        var playerUpdateXY = Utilities.calculateXYforChildCenterAlign(this.board, this.playerUpdate);

        this.playerUpdate.style.top = playerUpdateXY.y + 'px';
        this.playerUpdate.style.left = playerUpdateXY.x + 'px';

        pongGame.createPlayControl('playControl', this);

        this.soundEffects = pongGame.createSoundEffects();

        window.document.addEventListener('mousedown', this.mousedown, false);
        window.document.addEventListener('mouseup', this.mouseup, false);
        this.startGame(this.ball, gameState);
        Utilities.hideObject(this.board.Title);
    },

    onKeyPress: function(e) {
        var evt = (e) ? e : ((window.event) ? event : null);

        if (!evt) {
            return;
        }

        if (evt.keyCode == pongGame.SPACEBAR) {
            document.getElementById('pongGame').click();
        }
    },

    mousedown: function(e) {
        const evt = e || window.event;
        if (!evt) return;

        const game = this.game || this; // defensive for older bindings
        const board = game.board;
        if (!board) return;

        const boardRect = board.getBoundingClientRect();

        // Mouse position relative to board
        const localX = evt.clientX - boardRect.left;
        const localY = evt.clientY - boardRect.top;

        // Only left-side input controls Player 1
        if (localX < boardRect.width * 0.15) {
            const leftPaddle = document.getElementById('leftPaddle');
            if (!leftPaddle) return;

            const paddleRect = leftPaddle.getBoundingClientRect();
            const paddleCenter =
                (paddleRect.top + paddleRect.bottom) / 2 - boardRect.top;

            pongGame.IsUpPressed = localY < paddleCenter;
            pongGame.IsDownPressed = localY > paddleCenter;
        }
    },

    mouseup: function (e) {
        var evt = (e) ? e : ((window.event) ? event : null);

        if (!evt) {
            return;
        }

        pongGame.IsUpPressed = false;
        pongGame.IsDownPressed = false;
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
        const y = paddle.offsetTop;

        if (y > 0) {
            paddle.style.top = (y - speed) + 'px';
        }
    },

    movePaddleDown: function(paddle, speed) {
        const y = paddle.offsetTop;
        const paddleHeight = paddle.offsetHeight;
        const boardHeight = this.board.getDimensions().height;

        if (y + paddleHeight < boardHeight) {
            paddle.style.top = (y + speed) + 'px';
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

        if (game.isKeyPressed(pongGame.PADDLE_DOWN) || pongGame.IsDownPressed) {
            game.movePaddleDown(game.leftPaddle, pongGame.PlayerSpeed);
        }

        if (game.isKeyPressed(pongGame.PADDLE_UP) || pongGame.IsUpPressed) {
            game.movePaddleUp(game.leftPaddle, pongGame.PlayerSpeed);
        }

        game.moveBallY(ball, directionY, speedY);

        game.moveBallX(ball, directionX, speedX);

        var ballXY = ball.getXY();
        const ballLeft   = ball.offsetLeft;
        const ballTop    = ball.offsetTop;
        const ballBottom = ballTop + ball.offsetHeight;

        const paddleLeft   = game.leftPaddle.offsetLeft;
        const paddleTop    = game.leftPaddle.offsetTop;
        const paddleBottom = paddleTop + game.leftPaddle.offsetHeight;
        const paddleRight  = paddleLeft + game.leftPaddle.offsetWidth;

        // If the ball collides with the bottom border, change vertical direction
        const boardHeight = game.board.getDimensions().height;

        if (ballBottom >= boardHeight) {
            directionY = 1;
            speedX = Math.min(speedX + 1, pongGame.MAX_BALL_SPEED);
            speedY = Math.min(speedY + 1, pongGame.MAX_BALL_SPEED);
            game.soundEffects.mediumBang.play();
        }

        // If the ball collides with the top border, change vertical direction
        else if (ball.offsetTop <= 0) {
            directionY = -1;
            speedX = Math.min(speedX + 1, pongGame.MAX_BALL_SPEED);
            speedY = Math.min(speedY + 1, pongGame.MAX_BALL_SPEED);
            game.soundEffects.mediumBang.play();
        }

        // test for a collision with the left paddle
        if (ballLeft <= paddleRight && ballLeft >= paddleLeft) {
            if (ballBottom >= paddleTop && ballTop <= paddleBottom) {
                directionX = 1;
                speedX = Math.min(speedX + 1, pongGame.MAX_BALL_SPEED);
                speedY = Math.min(speedY + 1, pongGame.MAX_BALL_SPEED);
                game.soundEffects.largeBang.play();
            }
        }

        // otherwise test for a collision with the right paddle
        const ballRight = ball.offsetLeft + ball.offsetWidth;

        const rPaddleLeft   = game.rightPaddle.offsetLeft;
        const rPaddleTop    = game.rightPaddle.offsetTop;
        const rPaddleBottom = rPaddleTop + game.rightPaddle.offsetHeight;

        // Right paddle collision
        if (ballRight >= rPaddleLeft) {
            if (ballBottom >= rPaddleTop && ballTop <= rPaddleBottom) {
                directionX = -1;
                speedX = Math.min(speedX + 1, pongGame.MAX_BALL_SPEED);
                speedY = Math.min(speedY + 1, pongGame.MAX_BALL_SPEED);
                game.soundEffects.largeBang.play();
            }
        }

        // Track the ball with the Right Paddle
        game.movePaddleAI(ball, game.rightPaddle)

        if (ballXY.x <= 0) {

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
        else if (ballRight >= game.board.getDimensions().width) {

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

            setTimeout(function() { game.update(ball, directionX, directionY, speedX, speedY, game) }, pongGame.GameLoopInterval);
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
            this.soundEffects.blip.play();
            this.paused = false;
            this.playControl.playImg.style.display = 'none';
            this.playControl.pauseImg.style.display = 'block';
            this.update(this.gameState.ball, this.gameState.directionX, 
                this.gameState.directionY, this.gameState.speedX, 
                this.gameState.speedY, this);
    },

    startGame: function(ball, gameState) {
        this.paused = false;

        if (!ball) {
            ball = this.ball;
        }

        var ballXY = Utilities.calculateXYforChildCenterAlign(this.board, ball);

        ball.style.top = ballXY.y + 'px';
        ball.style.left = ballXY.x + 'px';

        Utilities.showObject(ball);
        const xDir = Math.random() < 0.5 ? -1 : 1;
        const yDir = Math.random() < 0.5 ? -1 : 1;

        this.update(ball, xDir, yDir, pongGame.BallStartSpeed, pongGame.BallStartSpeed);
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
        var speed = (magnitude > pongGame.MaxAiSpeed) ? pongGame.MaxAiSpeed : magnitude;
        
        if (direction && ball.directionX > 0) {
            this.movePaddle(paddle, direction, speed);
        }
        else {
            var boardMiddleDimensions = Utilities.calculateXYforChildCenterAlign(this.board, paddle);

            var direction = paddleXY.y - boardMiddleDimensions.y;
            var magnitude = Math.abs(direction);
            var speed = (magnitude > pongGame.MaxAiSpeed) ? pongGame.MaxAiSpeed : magnitude;

            if (direction) {
                this.movePaddle(paddle, direction, speed);
            }
        }
    },

    resume: function () {
        Utilities.hideObject(this.playerUpdate);
        Utilities.showObject(this.playControl);
        this.startGame(this.ball);

        return true;
    }
};

pongGame.createGameBoard = function(backgroundImg, onStartClick, game) {
    var board = document.createElement('div');

    board.id = 'pongGame';
    board.game = game;
    game.board = board;
    const parentWidth = game.parent.clientWidth;

    // Clamp width
    let width = Math.min(
        pongGame.MAX_BOARD_WIDTH,
        Math.max(pongGame.MIN_BOARD_WIDTH, parentWidth)
    );

    // Derive height from aspect ratio
    let height = Math.floor(width / pongGame.ASPECT_RATIO);

    board.style.width = width + 'px';
    board.style.height = height + 'px';

    if (backgroundImg) {
        board.style.backgroundImage = 'url(/images/MainBG.jpg)';
        board.style.backgroundSize = 'cover';
        board.style.backgroundPosition = 'center';
    }

    board.style.borderWidth = '0px';
    board.style.zIndex = '0';
    board.style.position = 'relative';
    board.style.display = 'block';
    board.style.left = '0';
    board.style.top = '0';
    board.style.padding = '0';
    board.style.boxSizing = 'border-box';

    board.Title = pongGame.createTitle('Asteroid Bounce!<br />Tap or click screen to begin', '#000000', '#00FF00', onStartClick, game);
    var coordinates = Utilities.calculateXYforChildCenterAlign(board, board.Title);

    board.Title.style.top = coordinates.y + 'px';
    board.Title.style.left = coordinates.x + 'px';
    board.appendChild(board.Title);
    Utilities.showObject(board.Title);

    board.getDimensions = function () {
        return Utilities.getDimensions(board);
    };

    board.getXY = function() {
        return {
            x: board.offsetLeft,
            y: board.offsetTop
        };
    };

    return board;
}

pongGame.createTitle = function(text, backColor, textColor, onStartClick, game) {
    var title = document.createElement('div');
    title.id = 'gameTitle';
    title.game = game;
    title.style.backgroundColor = backColor;

    var dimensions = Utilities.getDimensions(game.board);

    title.style.width = (dimensions.width / 5) + 'px';
    title.style.height = (dimensions.width / 12) + 'px';
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
            onStartClick(evt);
            game.board.onclick = null;
    };

    title.getXY = function() {
        return {
            x: title.offsetLeft,
            y: title.offsetTop
        };
    }

    return title;
}

pongGame.createPaddle = function(id, imageUrl, game) {
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
        return Utilities.getDimensions(paddle);
    };

    paddle.getXY = function() {
        return {
            x: paddle.offsetLeft,
            y: paddle.offsetTop
        };
    };

    paddle.getBottom = function() {
        return paddle.getXY().y + paddle.getDimensions().height;
    };

    paddle.getRight = function() {
        return paddle.getXY().x + paddle.getDimensions().width;
    }

    return paddle;
}

pongGame.createBall = function(imageUrl, game) {
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
        return Utilities.getDimensions(ball);
    };

    ball.getXY = function() {
        return {
            x: ball.offsetLeft,
            y: ball.offsetTop
        };
    };

    ball.getBottom = function() {
        return ball.getXY().y + ball.getDimensions().height;
    };

    ball.getRight = function() {
        return ball.getXY().x + ball.getDimensions().width;
    };

    return ball;
}

pongGame.createScoreBoard = function(id, textColor, game) {
    var scoreBoard = document.createElement('div');
    scoreBoard.id = id;
    scoreBoard.style.position = 'absolute';
    scoreBoard.style.backgroundColor = 'transparent';

    var dimensions = game.board.getDimensions();

    scoreBoard.style.fontSize = (dimensions.height / 10) + 'px';
    scoreBoard.style.color = textColor;
    scoreBoard.style.fontFamily = 'Courier New';
    scoreBoard.style.fontWeight = 'bold';
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

pongGame.createUpdater = function(id, textColor, game) {
    var updater = document.createElement('div');
    updater.id = id;
    updater.style.color = textColor;
    updater.style.textAlign = 'center';
    updater.style.verticalAlign = 'center';
    updater.style.backgroundColor = '#000000';
    updater.style.position = 'absolute';

    var dimensions = game.board.getDimensions();
    updater.style.height = (dimensions.width / 8) + 'px';
    updater.style.width = (dimensions.width / 5) + 'px';

    updater.style.fontSize = (dimensions.height / 30) + 'px';
    updater.style.fontFamily = 'Courier New';
    updater.style.fontWeight = 'bold';
    updater.style.zIndex = 10;
    updater.game = game;

    updater.getText = function() { return updater.innerHTML; };
    updater.setText = function(value) { updater.innerHTML = value; };

    return updater;
}

pongGame.createPlayControl = function (id, game) {
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
        return Utilities.getDimensions(playControl);
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

    var pauseImg = Utilities.createImage('/images/RetroPause.png', id + '_pause');
    pauseImg.style.width = '100%';
    pauseImg.style.height = '100%';
    pauseImg.style.display = 'block';
    playControl.appendChild(pauseImg);
    playControl.pauseImg = pauseImg;

    var playImg = Utilities.createImage('/images/RetroPlay.png', id + '_play');
    playImg.style.width = '100%';
    playImg.style.height = '100%';
    playImg.style.display = 'none';
    playControl.appendChild(playImg);
    playControl.playImg = playImg;
    
    playControl.style.zIndex = 10;

    game.board.appendChild(playControl);
}

pongGame.createSoundEffects = function () {
    var soundEffects = new Object();

    soundEffects.largeBang = document.createElement('audio');
    soundEffects.largeBang.src = '/soundeffects/BANGLRG.WAV';

    soundEffects.mediumBang = document.createElement('audio');
    soundEffects.mediumBang.src = '/soundeffects/BANGMED.WAV';

    soundEffects.lose = document.createElement('audio');
    soundEffects.lose.src = '/soundeffects/Lose.wav';

    soundEffects.blip = document.createElement('audio');
    soundEffects.blip.src = '/soundeffects/BLIP.WAV';

    soundEffects.score = document.createElement('audio');
    soundEffects.score.src = '/soundeffects/008166431-retro-sfx-22.wav';

    soundEffects.gameOver = document.createElement('audio');
    soundEffects.gameOver.src = '/soundeffects/022802605-8bit-retro-game-over.wav';

    soundEffects.victory = document.createElement('audio');
    soundEffects.victory.src = '/soundeffects/022802601-8bit-retro-victory-melody.wav';
    
    return soundEffects;
}

export default pongGame;