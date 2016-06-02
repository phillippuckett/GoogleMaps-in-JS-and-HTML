$(document).ready(function () {



    // RETURNED FROM THE API //
    var marketId = [];
    var marketName = [];
    var allLatLon = [];
    var allMarkers = [];
    var infoWindow = [];

    var marketId = null;
    var pos;
    var userCords;
    var tempMarkerHolder = [];



    // GEOLOCATION //
    if (navigator.geolocation) {
        var error = function (err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        }

        var success = function (pos) {
            userCords = pos.coords;
            //return userCords;
        }

        // Get the user's current position
        navigator.geolocation.getCurrentPosition(success, error);
        //console.log(pos.latitude + " " + pos.longitude);
    } else {
        alert('Geolocation is not supported in your browser');
    };



    // MAP OPTIONS //
    var mapOptions = {
        zoom: 5,
        center: new google.maps.LatLng(37.09024, -100.712891),
        panControl: false,
        panControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_LEFT
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        scaleControl: false

    };



    // INFORMATION WINDOW//
    infowindow = new google.maps.InfoWindow({
        content: "holding..."
    });



    // MAP //
    map = new google.maps.Map(document.getElementById('canvas'), mapOptions);




    // ZIP //
    $('#chooseZip').submit(function () { // bind function to submit event of form

        var userZip = $("#textZip").val();
        //console.log("This-> " + userCords.latitude);

        var accessURL;
        if (userZip) {
            accessURL = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + userZip;
        } else {
            accessURL = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + userCords.latitude + "&lng=" + userCords.longitude;
        }



        // AJAX REQUEST //
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: accessURL,
            dataType: 'jsonp',
            success: function (data) {

                $.each(data.results, function (id, val) {
                    marketId.push(val.id);
                    marketName.push(val.marketname);
                });
                //console.log(marketId, marketName);

                var counter = 0;
                $.each(marketId, function (k, v) {
                    $.ajax({
                        type: "GET",
                        contentType: "application/json; charset=utf-8",
                        // submit a get request to the restful service mktDetail.
                        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + v,
                        dataType: 'jsonp',
                        success: function (data) {
                            for (var key in data) {
                                var results = data[key];
                                //console.log(results);

                                var googleLink = results['GoogleLink'];
                                var latLong = decodeURIComponent(googleLink.substring(googleLink.indexOf("=") + 1, googleLink.lastIndexOf("(")));
                                var split = latLong.split(',');
                                var latitude = parseFloat(split[0]);
                                var longitude = parseFloat(split[1]);

                                // SET MARKERS //
                                myLatlng = new google.maps.LatLng(latitude, longitude);

                                allMarkers = new google.maps.Marker({
                                    position: myLatlng,
                                    map: map,
                                    title: marketName[counter],
                                    html:
                                    '<div class="markerPop">' +
                                    '<h1>' + marketName[counter].substring(4) + '</h1>' + //substring removes distance from title
                                    '<h3>' + results['Address'] + '</h3>' +
                                    '<p>' + results['Products'].split(';') + '</p>' +
                                    '<p>' + results['Schedule'] + '</p>' +
                                    '</div>'
                                });

                                //put all lat long in array
                                allLatlng.push(myLatlng);

                                //Put the marketrs in an array
                                tempMarkerHolder.push(allMarkers);

                                counter++;
                                //console.log(counter);
                            };

                            google.maps.event.addListener(allMarkers, 'click', function () {
                                infowindow.setContent(this.html);
                                infowindow.open(map, this);
                            });


                            //console.log(allLatlng);
                            var bounds = new google.maps.LatLngBounds();
                            //  Go through each...
                            for (var i = 0, LtLgLen = allLatlng.length; i < LtLgLen; i++) {
                                bounds.extend(allLatlng[i]);
                            }
                            map.fitBounds(bounds);


                        }
                    });
                });
            }
        });
        return false;

    });

});