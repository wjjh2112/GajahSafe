async function fetchDeviceData(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
    }
    return response.json();
}

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

    async function initializeMarkers() {
        try {
            const cameras = await fetchDeviceData('/cameras');
            cameras.forEach(camera => {
                addMarker({
                    id: camera.cam_id,
                    position: new google.maps.LatLng(camera.camLat, camera.camLong),
                    icon: cameraIcon
                });
            });

            const electricFences = await fetchDeviceData('/electricFences');
            const fenceCoordinates = [];

            electricFences.forEach(fence => {
                addMarker({
                    id: fence.ef_id,
                    position: new google.maps.LatLng(fence.efLat, fence.efLong),
                    icon: electFenceIcon
                });
                fenceCoordinates.push({ lat: fence.efLat, lng: fence.efLong });
            });

            if (fenceCoordinates.length) {
                const electGeofence = new google.maps.Polygon({
                    paths: fenceCoordinates,
                    strokeColor: "#fd5959",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#fd5959",
                    fillOpacity: 0.3
                });
                electGeofence.setMap(map);
            }
        } catch (error) {
            console.error('Error initializing markers:', error);
        }
    }

    initializeMarkers();
}
