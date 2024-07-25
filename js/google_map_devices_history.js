async function fetchDeviceData(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
    }
    return response.json();
}

function myMapDevicesHistory() {
    var mapProp = {
        center: new google.maps.LatLng(2.118402479300392, 103.43801534342286),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    var map = new google.maps.Map(document.getElementById("googleMapHistory"), mapProp);

    var iconSize = new google.maps.Size(40, 40);

    var cameraIcon = {
        url: 'images/icon/cameraIcon.png',
        scaledSize: iconSize
    };

    var electFenceIconWhite = {
        url: 'images/icon/electFenceIcon.png',
        scaledSize: iconSize
    };

    var electFenceIconRed = {
        url: 'images/icon/electFenceIconRed.png',
        scaledSize: iconSize
    };

    var infoWindow = new google.maps.InfoWindow();
    var markers = {};

    function addMarker(markerProps) {
        var marker = new google.maps.Marker({
            position: markerProps.position,
            icon: {
                ...markerProps.icon,
                scaledSize: iconSize,
                opacity: markerProps.status === 'inactive' ? 0.5 : 1.0
            },
            map: map
        });

        google.maps.event.addListener(marker, 'click', function () {
            var contentString = '<div>' +
                '<p><strong>Name:</strong> ' + markerProps.name + '</p>' +
                '<p><strong>ID:</strong> ' + markerProps.id + '</p>' +
                '<p><strong>Location:</strong> (' + markerProps.position.lat() + ', ' + markerProps.position.lng() + ')</p>' +
                '<p><strong>Status:</strong> ' + markerProps.status + '</p>' +
                '</div>';

            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
        });

        google.maps.event.addListener(marker, 'mouseover', function () {
            var hoverWindow = new google.maps.InfoWindow({
                content: markerProps.id
            });
            hoverWindow.open(map, marker);
            marker.hoverWindow = hoverWindow;
        });

        google.maps.event.addListener(marker, 'mouseout', function () {
            if (marker.hoverWindow) {
                marker.hoverWindow.close();
            }
        });

        markers[markerProps.id] = marker;
    }

    async function initializeMarkers() {
        try {
            const cameras = await fetchDeviceData('/cameras');
            cameras.forEach(camera => {
                addMarker({
                    name: camera.cam_name,
                    id: camera.cam_id,
                    position: new google.maps.LatLng(camera.camLat, camera.camLong),
                    icon: cameraIcon,
                    status: camera.cam_status
                });
            });

            const electricFences = await fetchDeviceData('/electricFences');
            const fenceCoordinates = [];

            electricFences.forEach(fence => {
                addMarker({
                    name: fence.ef_name,
                    id: fence.ef_id,
                    position: new google.maps.LatLng(fence.efLat, fence.efLong),
                    icon: electFenceIconWhite,
                    status: fence.ef_status
                });
                fenceCoordinates.push({ lat: fence.efLat, lng: fence.efLong });
            });

            // Check the contents of fenceCoordinates
            console.log('Fence Coordinates:', fenceCoordinates);

            if (fenceCoordinates.length > 2) { // Polygon needs at least 3 points
                const electGeofence = new google.maps.Polygon({
                    paths: fenceCoordinates,
                    strokeColor: "#fd5959",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#fd5959",
                    fillOpacity: 0.3
                });
                electGeofence.setMap(map);
            } else {
                console.warn('Not enough coordinates to create a polygon.');
            }
        } catch (error) {
            console.error('Error initializing markers:', error);
        }
    }

    initializeMarkers();

    document.querySelectorAll('.view-link').forEach((link, index) => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            // Highlight the clicked row
            document.querySelectorAll('.table tbody tr').forEach(row => {
                row.classList.remove('highlighted-row');
            });
            link.closest('tr').classList.add('highlighted-row');

            // Change marker color
            Object.keys(markers).forEach(key => {
                markers[key].setIcon(electFenceIconWhite);
            });

            var deviceId = link.closest('tr').querySelector('td').textContent;
            var dateTime = link.closest('tr').querySelectorAll('td')[2].textContent;
            markers[deviceId].setIcon(electFenceIconRed);

            // Update the info window content for the active red icon
            google.maps.event.clearListeners(markers[deviceId], 'click');
            google.maps.event.addListener(markers[deviceId], 'click', function () {
                var contentString = '<div>' +
                    '<p><strong>ID:</strong> ' + deviceId + '</p>' +
                    '<p><strong>Latitude:</strong> ' + markers[deviceId].getPosition().lat() + '</p>' +
                    '<p><strong>Longitude:</strong> ' + markers[deviceId].getPosition().lng() + '</p>' +
                    '<p><strong>DateTime:</strong> ' + dateTime + '</p>' +
                    '</div>';
                infoWindow.setContent(contentString);
                infoWindow.open(map, markers[deviceId]);
            });
        });
    });
}

// Initialize the map
myMapDevicesHistory();
