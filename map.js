var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 36.1699, lng: -115.1398 },
        zoom: 8
    });
}