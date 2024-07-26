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
            map: map,
            opacity: markerProps.status === 'Active' ? 0.95 : 0.7
        });

        google.maps.event.addListener(marker, 'click', function () {
            var contentString = 
                '<div class="row">' +
                    '<h4> ' + markerProps.id + '</h4>' +
                    '<h5> ' + markerProps.name + '</h5>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col">' + 
                        '<div class="au-card">' +
                            '<p>Location</p>' + 
                            '<h3 style="color: #fd5959;">' + markerProps.position.lat() + ', ' + markerProps.position.lng() + '</h3>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col">' + 
                        '<div class="au-card">' +
                            '<p>Status</p>' +
                            '<h3 style="color: #fd5959;">'+ markerProps.status + '</h3>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
        });

        google.maps.event.addListener(marker, 'mouseover', function () {
            var hoverLabel = new google.maps.InfoWindow({
                content: '<div class="hover-label">' + markerProps.id + '</div>',
                disableAutoPan: true
            });
            hoverLabel.open(map, marker);
            google.maps.event.addListener(marker, 'mouseout', function () {
                hoverLabel.close();
            });
        });
    }

    async function initializeMarkers() {
        try {
            const cameras = await fetchDeviceData('/cameras');
            cameras.forEach(camera => {
                addMarker({
                    id: camera.cam_id,
                    name: camera.camName,
                    position: new google.maps.LatLng(camera.camLat, camera.camLong),
                    icon: cameraIcon,
                    status: camera.camStat
                });
            });

            const electricFences = await fetchDeviceData('/electricFences');
            const fenceCoordinates = [];

            electricFences.forEach(fence => {
                addMarker({
                    id: fence.ef_id,
                    name: fence.efName,
                    position: new google.maps.LatLng(fence.efLat, fence.efLong),
                    icon: electFenceIcon,
                    status: fence.efStat
                });
                fenceCoordinates.push({ lat: fence.efLat, lng: fence.efLong });
            });

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
}