//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/privacy-Flyout.html", {

        ready: function (element, options) {
            // Register the handlers for dismissal
            document.getElementById("privacyFlyout").addEventListener("keydown", handleAltLeft);
            document.getElementById("privacyFlyout").addEventListener("keypress", handleBackspace);
        },

        unload: function () {
            // Remove the handlers for dismissal
            document.getElementById("privacyFlyout").removeEventListener("keydown", handleAltLeft);
            document.getElementById("privacyFlyout").removeEventListener("keypress", handleBackspace);
        },
    });

    function handleAltLeft(evt) {
        // Handles Alt+Left in the control and dismisses it
        if (evt.altKey && evt.key === 'Left') {
            WinJS.UI.SettingsFlyout.show();
        }
    };

    function handleBackspace(evt) {
        // Handles the backspace key or alt left arrow in the control and dismisses it
        if (evt.key === 'Backspace') {
            WinJS.UI.SettingsFlyout.show();
        }
    };
})();
