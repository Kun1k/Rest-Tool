// Eine Einführung zur leeren Vorlage finden Sie in der folgenden Dokumentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// So debuggen Sie Code beim Seitenladen in Ripple oder auf Android-Geräten/-Emulatoren: Starten Sie die App, legen Sie Haltepunkte fest, 
// und führen Sie dann "window.location.reload()" in der JavaScript-Konsole aus.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Verarbeiten der Cordova-Pause- und -Fortsetzenereignisse
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova wurde geladen. Führen Sie hier eine Initialisierung aus, die Cordova erfordert.

        var redErr = getCookie("redirectError");
        if (redErr != null) {
            $("#error").text(redErr);
            setCookie("redirectError", "");
        }

        checkSessions();

        $("a#submit").click(function () {
            //JSON TEST

           
            // load form data
            var server = $("input#server").val() || null;
            var user = $("input#user").val() || null;
            var pw = $("input#pw").val() || null;
            var game = $("select#game").val() || null;

            var submitFail = false;

            // Check server input
            if (server == null) {
                $("input#server").css("box-shadow", "0 0 10px #FF0000 inset").attr("placeholder", "Please fill in a server adress and port");
                submitFail = true;
            } else {
                $("input#server").css("box-shadow", "0 0 10px transparent inset").attr("placeholder", "IP or Domain:Port");
            }
            // Check user input
            if (user == null) {
                $("input#user").css("box-shadow", "0 0 10px #FF0000 inset").attr("placeholder", "Please fill in a user");
                submitFail = true;
            } else {
                $("input#user").css("box-shadow", "0 0 10px transparent inset").attr("placeholder", "Username [admin]");
            }
            // Check pw input
            if (pw == null) {
                $("input#pw").css("box-shadow", "0 0 10px #FF0000 inset").attr("placeholder", "Please fill in a password");
                submitFail = true;
            } else {
                $("input#pw").css("box-shadow", "0 0 10px transparent inset").attr("placeholder", "Password");
            }
            // Check choosen game
            if (game == null) {
                $("#game-button").css("box-shadow", "0 0 10px #FF0000 inset");
                submitFail = true;
            } else {
                $("#game-button").css("box-shadow", "0 0 10px transparent inset");
            }

            if (submitFail) {
                return;
            }

            // match connection function

            switch (game) {
                case "tshock":
                    connectTShock(server, user, pw);
                    break;

                default:
                    alert("Error: unknown game selected");
                    break;
            }

        });

    };

    function onPause() {
        // TODO: Diese Anwendung wurde ausgesetzt. Speichern Sie hier den Anwendungszustand.
    };

    function onResume() {
        // TODO: Diese Anwendung wurde erneut aktiviert. Stellen Sie hier den Anwendungszustand wieder her.
    };

    function connectTShock(server, user, pw) {

        // request token creation over proxy
        $.ajax({
            type: "GET",
            url: "http://" + server + "/token/create/" + user + "/" + pw,            
            dataType: "json",
            success: function (data) {
                // check REST response                  
                if (data.status == 200) {
                    var token = data.token;

                    window.localStorage.setItem("tshock-token", token);
                    window.localStorage.setItem("tshock-server", server);

                    window.location.href = "tshock.html";
                }
                else {
                    // failed at rest endpoint
                    $("#loggedin #content").html("<h2>Failed login!</h2>");
                }
            },

            error: function (jqxhr, textStatus, error) {
                // failed at address/proxy
                alert("failed: " + textStatus + " / " + error);
            }
        });
    }

    function checkSessions() {

        checkTShockSession();

    }

    function checkTShockSession() {

        var token = getCookie("tshock-token") || "";
        var server = getCookie("tshock-server") || "";

        if (token != "" && server != "") {
            $("#sessions").append("<a href='tshock.html' data-ajax='false' class='ui-link ui-btn ui-icon-arrow-r ui-btn-icon-right ui-shadow ui-corner-all'>TShock: " + server + "</a>")
        }
        else {
            $("#sessions").append("<p><b>No active sessions avalaible. To start a session, please login to your server.</b></p>");
        }

    }    
})();