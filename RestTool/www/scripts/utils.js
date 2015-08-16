/*
 * Utils.js
 *
 * provides helper functions
 *
 *
*/

function setCookie(name, value) {

    document.cookie = name + "=" + value + "; path=/";

}
// credits to quirksmode.org
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function forceRedirect(URL, errorMsg) {
    if (errorMsg != null) {
        setCookie("redirectError", errorMsg);
    }
    window.location.href = URL;
}

function proxyJSONRequest(URL) {

    return $.ajax({
        type: "GET",
        url: URL,
        dataType: "json",
    });

}