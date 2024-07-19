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
            electricFences.forEach(fence => {
                addMarker({
                    id: fence.ef_id,
                    position: new google.maps.LatLng(fence.efLat, fence.efLong),
                    icon: electFenceIcon
                });
            });
        } catch (error) {
            console.error('Error initializing markers:', error);
        }
    }

    initializeMarkers();
}
