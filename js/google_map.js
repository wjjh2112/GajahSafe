function myMap() {
    var mapProp= {
      center:new google.maps.LatLng(2.118402479300392, 103.43801534342286),
      zoom:16,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);


    var camera = [
        { position: new google.maps.LatLng(2.1212085590058822, 103.44557050237783), icon: 'images/icon/cameraIcon.png' },
        { position: new google.maps.LatLng(2.121180585399694, 103.44580418134815), icon: 'images/icon/cameraIcon.png' },
        { position: new google.maps.LatLng(2.1204544474520066, 103.44706507033733), icon: 'images/icon/cameraIcon.png' },
        { position: new google.maps.LatLng(2.1202367449387163, 103.44766623064712), icon: 'images/icon/cameraIcon.png' },
        { position: new google.maps.LatLng(2.1199281033484, 103.44858727442451), icon: 'images/icon/cameraIcon.png' }
    ];

    var electFence = [
        { position: new google.maps.LatLng(2.1191519278955413, 103.42864313442423), icon: 'images/icon/electFenceIcon.png' },
        { position: new google.maps.LatLng(2.1190473932750957, 103.42916348300513), icon: 'images/icon/electFenceIcon.png' },
        { position: new google.maps.LatLng(2.118468432172555, 103.42984476413682), icon: 'images/icon/electFenceIcon.png' },
        { position: new google.maps.LatLng(2.1179913251753972, 103.42998423901416), icon: 'images/icon/electFenceIcon.png' },
        { position: new google.maps.LatLng(2.1179247539374906, 103.4293840199179), icon: 'images/icon/electFenceIcon.png' },
        { position: new google.maps.LatLng(2.1185528585589894, 103.4286538111709), icon: 'images/icon/electFenceIcon.png' }
    ];

    camera.forEach(function(markerProps) {
        var marker = new google.maps.Marker({
            position: markerProps.position,
            icon: markerProps.icon
        });
        marker.setMap(map);
    });

    electFence.forEach(function(markerProps) {
        var marker = new google.maps.Marker({
            position: markerProps.position,
            icon: markerProps.icon
        });
        marker.setMap(map);
    });
    
    var electFences = [
        { lat: 2.1191519278955413, lng: 103.42864313442423 },
        { lat: 2.1190473932750957, lng: 103.42916348300513 },
        { lat: 2.118468432172555, lng: 103.42984476413682 },
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