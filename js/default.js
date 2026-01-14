// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    WinJS.Application.onsettings = function (e) {
        if (app.pongGame && !app.pongGame.paused) { app.pongGame.pause(); }

        e.detail.applicationcommands = {
            "privacy": { title: "Privacy", href: "/html/privacy.html" } };
        WinJS.UI.SettingsFlyout.populateSettings(e);
    };


    //WinJS.Navigation.addEventListener('navigated', function (evt) {
    //    var url = evt.detail.location;
    //    var host = document.getElementById('contentHost');
    //    host.winControl && host.winControl.unload && host.winControl.unload();
    //    WinJS.Utilities.empty(host);
    //    evt.detail.setPromise(WinJS.UI.Pages.render(url, host, evt.detail.state).then(function () {
    //        WinJS.Application.sessionState.lasatUrl = url;
    //    }));
    //});

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var pongGame;
    var keys = new Array(255);
    var orientationSensor = Windows.Devices.Sensors.SimpleOrientationSensor.getDefault();

    app.keyDown = function (e) {
        var evt = (e) ? e : ((window.event) ? event : null);

        if (!evt) {
            return;
        }

        keys[evt.keyCode] = true;
    };

    app.keyUp = function (e) {
        var evt = (e) ? e : ((window.event) ? event : null);

        if (!evt) {
            return;
        }

        keys[evt.keyCode] = false;
    };

    app.isKeyPressed = function (keyCode) {
        if (keyCode < 0 || keyCode > 254) {
            return false;
        }

        return keys[keyCode];
    }

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                args.setPromise(function () {
                    app.pongGame = new PongGame(document.body);
                    app.addEventListener('resuming', app.onResuming, false);
                    app.addEventListener('suspending', app.onSuspending, false);
                }());
            }
            else {
                args.setPromise(function () {
                    if (!app.pongGame) {
                        app.pongGame = new PongGame(document.body, WinJS.Application.sessionState.gameState);
                    }
                }());

            }

            window.addEventListener('resize', app.onResize, false);

            app.pongGame.isKeyPressed = app.isKeyPressed;

            document.onkeydown = app.keyDown;
            document.onkeyup = app.keyUp;

            Windows.Graphics.Display.DisplayProperties.autoRotationPreferences =
                Windows.Graphics.Display.DisplayOrientations.landscape |
                Windows.Graphics.Display.DisplayOrientations.landscapeFlipped;

            args.setPromise(WinJS.UI.processAll());

            // set all pressed keys to false
            for (var i = 0; i < 255; i++) {
                keys[i] = false;
            }
        }
    };

    app.onResize = function (evt) {
        if (((Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.snapped) ||
            (Windows.UI.ViewManagement.ApplicationView.value ==
            Windows.UI.ViewManagement.ApplicationViewState.filled)) && app.pongGame) {
            app.pongGame.pause();
        }
    };

    app.orientationReadingChanged = function (evt) {
        if (evt.orientation % 2) {
            app.pongGame.rotatePortrait();
        }
        else {
            app.pongGame.rotateLandscape();
        }
    };
    
    app.onResuming = function (evt) {
        evt.setPromise(function () {
            if (app.pongGame) {
                app.pongGame.play();
            }
            else {
                app.pongGame = new PongGame(document.body, WinJS.Application.sessionState.gameState);
            }
        }());
    };

    app.onSuspending = function (evt) {
        evt.setPromise(function () {
            app.pongGame.pause();
            var gameState = app.pongGame.gameState;

            if (gameState) {
                gameState.ball.game = null;
                WinJS.Application.sessionState.gameState = gameState;
            }
        }());
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
        args.setPromise(function () {
            var gameState = app.pongGame.gameState;

            if (gameState) {
                gameState.ball.game = null;
                WinJS.Application.sessionState.gameState = gameState;
            }
        }());
    };

    app.start();
})();

