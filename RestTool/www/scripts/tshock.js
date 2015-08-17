var tableJson = [];
var token = null;
var server = null;
var color = null;
var panel = '<div data-role="panel" data-theme="a" id="sidebar" data-position="left" data-display="overlay">' +
            '<a href="#usermanagement" id="usermanagementLink" class="ui-btn ui-corner-all">User management</a>' +
            '<a href="#pageTime" id="pageTimeLink" class="ui-btn ui-corner-all">Time Settings</a>' +
            '<a href="#pageItems" id="pageItemsLink" class="ui-btn ui-corner-all">Items</a>' +
            '<a href="#" class="ui-btn ui-corner-all">Player</a>' +
            '<a href="#pageConsole" class="ui-btn ui-corner-all">Raw Console</a>' +
            '<a href="index.html" id="logout" data-ajax="false" class="ui-btn ui-corner-all">Logout</a>' +
            '</div>';


//Create new object.
UtilDom = new Object();
//Logging purposes
UtilDom.TAG = "UtilDom.JS: ";
//Cached references
UtilDom.CACHED_REFERENCES = new Object()

/**
 * get returns the requested dom element or the one in cache if already known.
 * @param jqueryId the jqueryId
 */
UtilDom.get = function (jqueryId) {
    var cachedElement = UtilDom.CACHED_REFERENCES[jqueryId];
    if (cachedElement) {
        return cachedElement;
    } else
        UtilDom.CACHED_REFERENCES[jqueryId] = $(jqueryId);
    return UtilDom.CACHED_REFERENCES[jqueryId];
}



$(document).one('pagebeforecreate', function () {
    $.mobile.pageContainer.prepend(panel);
    $("#sidebar").panel().enhanceWithin();
});

$(document).on("swipeleft swiperight", ".ui-page", function (e) {
    if ($.mobile.activePage.jqmData("panel") !== "open") {
        if (e.type === "swipeleft") {
            $("#sidebar").panel("close");
        } else if (e.type === "swiperight") {
            $("#sidebar").panel("open");
        }
    }
});

$(document).ready(function () {
    token = window.localStorage.getItem("tshock-token");
    server = window.localStorage.getItem("tshock-server");

    if (token != null && server != null) {

        validateToken().done(function (data) {
            if (data.status == 200) {
                reloadStartpage();
            } else {
                forceRedirect("index.html", "Token not valid anymore");
            }
        }).error(function (xhr, txt, err) {
            alert("Error at validation connection");
        });

    } else {
        forceRedirect("index.html", "No valid TShock-cookies");
    }


    $('#picker').colpick({
        layout: 'rgbhex',
        submit: 0,
        colorScheme: 'dark',
        onChange: function (hsb, hex, rgb, el, bySetColor) {
            $(el).css('border-color', '#' + hex);
            // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
            if (!bySetColor) {
                $(el).val("R:" + rgb.r + " G:" + rgb.g + " B:" + rgb.b)
                color = rgb.r + "," + rgb.g + "," + rgb.b;
            };
        }
    }).keyup(function () {
        $(this).colpickSetColor(this.value);
    }); 

    $('a#btnAddUser').click(function () {
        debugger;
        proxyJSONRequest("http://" + server + "/v2/users/create?user=" + $('#user').val() + "&password=" + $('#pw').val() + "&token=" + token).done(function (data) {
            if (data.status == "400") {
                alert(data.error);
            }
            else {
                alert(data.response);
                parent.history.back();
            }
        }).error(function () {
            //not ok
        });

    });
    $('a#btnDelUser').click(function () {
        proxyJSONRequest("http://" + server + "/v2/users/destroy?user=" + $('#inpDelUser').val() + "&token=" + token).done(function (data) {
            if (data.status == "400") {
                alert(data.error);
            }
            else {
                alert(data.response);
                parent.history.back();
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#btnUpdUser').click(function () {
        proxyJSONRequest("http://" + server + "/v2/users/update?user=" + $('#userold').val() + "&password=" + $('#pwnew').val() + "&token=" + token).done(function (data) {
            if (data.status == "400") {
                alert(data.error);
            }
            else {
                alert(data.response);
                parent.history.back();
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#btnAddGroup').click(function () {
        proxyJSONRequest("http://" + server + "/v2/groups/create?group=" + $('#groupname').val() + "&chatcolor=" + color + "&token=" + token).done(function (data) {
            if (data.status == "400") {
                alert(data.error);
            }
            else {
                alert(data.response);
                parent.history.back();
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#btnDelGroup').click(function () {
        proxyJSONRequest("http://" + server + "/v2/groups/destroy?group=" + $('#groupname').val() + "&token=" + token).done(function (data) {
            if (data.status == "400") {
                alert(data.error);
            }
            else {
                alert(data.response);
                parent.history.back();
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#pageItemsLink').click(function () {
        var deferreds = [];
        tableJson = [];
        pageCount = 1;        
        $("#form-filter-items").hide();
        $('#loader').show();

        for (i = 1; i <= pageCount; i++) {
            deferreds.push(
                $.getJSON("https://terraria.gamepedia.com/api.php?action=parse&page=Item%20IDs%20Part" + i + "&format=json", function (data) {
                    var tableText = $(data.parse.text["*"])[2].outerHTML;
                    var tableHTML = $(tableText)[0];
                    tableJson = $.merge(tableJson, tblToJson(tableHTML));
                })
            );
        }

        $.when.apply($, deferreds).then(function () {
            $("#form-filter-items").show();
            $('#loader').hide();
        });



    });

    $("#itemList").on("filterablebeforefilter", function (e, data) {        
        var value = $(data.input).val().toLowerCase();

        $("#itemList").empty();

        if (value && value.length > 2) {
            var listViewItems = "";

            var returnedData = $.grep(tableJson, function (element, index) {
                var itemName = $.trim($(element.object)[0].innerText);

                return element.object.toLowerCase().indexOf(value) >= 0;
            });

            $.each(returnedData, function (i, item) {
                var imageLink = $(returnedData[i].object).find('img')[0].src;
                var itemName = $.trim($(returnedData[i].object)[0].innerText);
                var itemId = returnedData[i].itemid;

                listViewItems += "<li title=\"" + itemId + "\"><a href=\"#pageGiveItem\" data-transition=\"slide\"> <img class=\"item-icon\" src=\"" + imageLink + "\" width=\"32\" height=\"32\"> <h2>" + itemName + "</h2><p>Item ID: " + itemId + "</p></a> </li>\n";
            });
        }
        $("#itemList").append(listViewItems);
        $("#itemList").listview("refresh");
    });

    
    $('#itemList').on('click', 'li', function (e) {
        var itemId = e.currentTarget.title;
        localStorage.setItem("itemId", itemId);
        
    });

    $("#giveItem").on("submit", function () {
        var itemId = localStorage.getItem("itemId");
        var itemCount = $("#giveItem-count").val();
        var playerName = $("#giveItem-player").val();
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/give " + itemId + " " + playerName + " " + itemCount).done(function (data) {
            if (data.status == "200") {
                alert("Item was given!");
                location.href("#pageItems");
            }  
        }).error(function (data) {
            alert(data.error);
        });
    });

    //Time settings
    $('a#settime-dawn').click(function () {        
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/time 04:30").done(function (data) {
            if (data.status == "200") {
                alert("Time is set to 04:30.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#settime-noon').click(function () {
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/time 12:00").done(function (data) {
            if (data.status == "200") {
                alert("Time is set to 12:00.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#settime-dusk').click(function () {
        debugger;
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/time 18:30").done(function (data) {
            if (data.status == "200") {
                alert("Time is set to 18:30.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#settime-midnight').click(function () {
        debugger;
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/time 00:00").done(function (data) {
            if (data.status == "200") {
                alert("Time is set to 00:00.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });

    //Invasions
    $('a#setevent-blood').click(function () {
        debugger;
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/bloodmoon").done(function (data) {
            if (data.status == "200") {
                alert("Blood moon started.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#setevent-eclipse').click(function () {
        debugger;
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/eclipse").done(function (data) {
            if (data.status == "200") {
                alert("Eclipse started.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#setevent-pumpkin').click(function () {
        debugger;
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/pumpkinmoon").done(function (data) {
            if (data.status == "200") {
                alert("Pumkin moon started.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#setevent-frost').click(function () {
        debugger;
        proxyJSONRequest("http://" + server + "/v2/server/rawcmd?token=" + token + "&cmd=/frostmoon").done(function (data) {
            if (data.status == "200") {
                alert("Frost moon started.");
            }
            else {
                alert(data.error);
            }
        }).error(function () {
            //not ok
        });
    });
    $('a#logout').click(function () {
        deleteCookie("tshock-server");
        deleteCookie("tshock-token");
    });

    function deleteCookie(name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    function validateToken() {

        if (server != null) {
            return proxyJSONRequest("http://" + server + "/tokentest?token=" + token);
        }
        // no valid server cookie
        forceRedirect("index.html", "No valid TShock-Server-cookie");
    }

    function getServerStatus() {

        if (server != null) {
            return proxyJSONRequest("http://" + server + "/v2/server/status?players=true&rules=true");
        }
        // no valid server cookie
        forceRedirect("index.html", "No valid TShock-Server-cookie");
    };

    function reloadStartpage() {
        //$.mobile.loading("show", { theme: "a" });
        getServerStatus().done(function (data) {            
            $("#infobox").append("<div class=\"status-header\">Version: " + data.serverversion + "</div>")
            .append("<div class=\"status-item\">Uptime: " + data.uptime + "</div>")
            .append("<div class=\"status-item\">Port: " + data.port + "</div>")
            .append("<div class=\"status-item\">Playercount: " + data.playercount + "</div>")
            .append("<div class=\"status-item\">Maxplayers: " + data.maxplayers + "</div>")
            .append("<div class=\"status-item\">Worldname: " + data.world + "</div>")
            .fadeIn(700);

            if (data.serverpassword) {
                $(".status-header").append("<span class='ui-icon-lock ui-btn-icon-left' style='position:relative;'></span>");
            }

            $.mobile.loading("hide");

        }).error(function (xhr, txt, err) {
            alert("Error at server connection");
        });
    }

    function tblToJson(table) {
        var data = [];

        // first row needs to be headers
        var headers = [];
        for (var i = 0; i < table.rows[0].cells.length; i++) {
            headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
        }

        headers[1] = "itemid";

        // go through cells
        for (var i = 1; i < table.rows.length; i++) {

            var tableRow = table.rows[i];
            var rowData = {};

            for (var j = 0; j < tableRow.cells.length; j++) {

                rowData[headers[j]] = tableRow.cells[j].innerHTML.trim();

            }

            data.push(rowData);
        }

        return data;
    }
});