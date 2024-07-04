function myMapDevicesIndex() {
    var mapProp = {
        center: new google.maps.LatLng(2.118402479300392, 103.43801534342286),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    var map = new google.maps.Map(document.getElementById("googleMapIndex"), mapProp);

    var iconSize = new google.maps.Size(40, 40);

    var cameraIcon = {
        url: 'images/icon/cameraIcon.png',
        scaledSize: iconSize
    };

    var electFenceIcon = {
        url: 'images/icon/electFenceIcon.png',
        scaledSize: iconSize
    };

    var camera = [
        { id: 'Camera 1', position: new google.maps.LatLng(2.1212085590058822, 103.44557050237783), icon: cameraIcon },
        { id: 'Camera 2', position: new google.maps.LatLng(2.121180585399694, 103.44580418134815), icon: cameraIcon },
        { id: 'Camera 3', position: new google.maps.LatLng(2.1204544474520066, 103.44706507033733), icon: cameraIcon },
        { id: 'Camera 4', position: new google.maps.LatLng(2.1202367449387163, 103.44766623064712), icon: cameraIcon },
        { id: 'Camera 5', position: new google.maps.LatLng(2.1199281033484, 103.44858727442451), icon: cameraIcon }
    ];

    var electFence = [
        { id: 'Electric Fence 1', position: new google.maps.LatLng(2.1191519278955413, 103.42864313442423), icon: electFenceIcon },
        { id: 'Electric Fence 2', position: new google.maps.LatLng(2.1190473932750957, 103.42916348300513), icon: electFenceIcon },
        { id: 'Electric Fence 3', position: new google.maps.LatLng(2.118468432172555, 103.42984476413682), icon: electFenceIcon },
        { id: 'Electric Fence 4', position: new google.maps.LatLng(2.1179913251753972, 103.42998423901416), icon: electFenceIcon },
        { id: 'Electric Fence 5', position: new google.maps.LatLng(2.1179247539374906, 103.4293840199179), icon: electFenceIcon },
        { id: 'Electric Fence 6', position: new google.maps.LatLng(2.1185528585589894, 103.4286538111709), icon: electFenceIcon }
    ];

    var infoWindow = new google.maps.InfoWindow();

    function addMarker(markerProps) {
        var marker = new google.maps.Marker({
            position: markerProps.position,
            icon: markerProps.icon,
            map: map
        });

        google.maps.event.addListener(marker, 'click', function () {
            var contentString = '<div>' +
                '<p><strong>ID:</strong> ' + markerProps.id + '</p>' +
                '<p><strong>Latitude:</strong> ' + markerProps.position.lat() + '</p>' +
                '<p><strong>Longitude:</strong> ' + markerProps.position.lng() + '</p>' +
                '</div>';

            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
        });
    }

    camera.forEach(addMarker);
    electFence.forEach(addMarker);

    var electFences = [
        { lat: 2.1191519278955413, lng: 103.42864313442423 },
        { lat: 2.1190473932750957, lng: 103.42916348300513 },
        { lat: 2.118468432172555, lng: 103.42984476413682 },
        { lat: 2.1179913251753972, lng: 103.42998423901416 },
        { lat: 2.1179247539374906, lng: 103.4293840199179 },
        { lat: 2.1185528585589894, lng: 103.4286538111709 }
    ];

    var electGeofence = new google.maps.Polygon({
        paths: electFences,
        strokeColor: "#fd5959",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#fd5959",
        fillOpacity: 0.3
    });

    electGeofence.setMap(map);
}
