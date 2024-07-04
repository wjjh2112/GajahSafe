function myMapAlert() {
    var mapProp = {
        center: new google.maps.LatLng(2.118402479300392, 103.43801534342286),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    var map = new google.maps.Map(document.getElementById("googleMapAlert"), mapProp);

    var iconSize = new google.maps.Size(40, 40);

    var electShutdownIcon = {
        url: 'images/icon/electShutdownIcon.png',
        scaledSize: iconSize
    };

    var electFencePushedPulledIcon = {
        url: 'images/icon/electFencePushedPulledIcon.png',
        scaledSize: iconSize
    };

    // Coordinates for each device ID
    var deviceCoordinates = {
        'Electric Fence 1': { lat: 2.1191519278955413, lng: 103.42864313442423 },
        'Electric Fence 2': { lat: 2.1190473932750957, lng: 103.44766623064712 },
        'Electric Fence 3': { lat: 2.118468432172555, lng: 103.44858727442451 },
        'Electric Fence 4': { lat: 2.1179913251753972, lng: 103.42998423901416 },
        'Electric Fence 5': { lat: 2.1179247539374906, lng: 103.4293840199179 },
        'Electric Fence 6': { lat: 2.1185528585589894, lng: 103.4286538111709 },
        // Add more device IDs and coordinates as needed
    };

    // Parse the table data
    var tableRows = document.querySelectorAll('.table-earning tbody tr');
    var alertsData = [];

    tableRows.forEach(function(row) {
        var cells = row.querySelectorAll('td');
        var alertData = {
            deviceId: cells[0].textContent.trim(),
            shutdown: cells[1].textContent.trim(),
            pushedPulled: cells[2].textContent.trim(),
            datetime: cells[3].textContent.trim()
        };
        alertsData.push(alertData);
    });

    // Filter alerts within the last 24 hours
    var now = moment();
    var last24HoursAlerts = alertsData.filter(function(alert) {
        var alertDatetime = moment(alert.datetime, 'DD/MM/YYYY, HH:mm:ss');
        return now.diff(alertDatetime, 'hours') <= 24;
    });

    // Group alerts by device ID
    var groupedAlerts = last24HoursAlerts.reduce(function(result, alert) {
        result[alert.deviceId] = result[alert.deviceId] || [];
        result[alert.deviceId].push(alert);
        return result;
    }, {});

    // Create an info window instance
    var infoWindow = new google.maps.InfoWindow();

    // Place markers on the map for each device with alerts in the last 24 hours
    Object.keys(groupedAlerts).forEach(function(deviceId) {
        var position = deviceCoordinates[deviceId];
        var alerts = groupedAlerts[deviceId];

        var markerIcon = alerts.some(function(alert) {
            return alert.shutdown === 'Yes';
        }) ? electShutdownIcon : electFencePushedPulledIcon;

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.lat, position.lng),
            icon: markerIcon,
            map: map
        });

        // Info window content for the device
        var infoWindowContent = `
            <div class="info-window-content">
                <p><strong>Device ID: ${deviceId}</strong></p>
                <p><strong>${position.lat}, ${position.lng}</strong></p>
                <p><strong>Alert(s):</strong></p>

                ${alerts.map(function(alert) {
                    var alertType = (alert.shutdown === 'Yes' && alert.pushedPulled === 'Yes') ? 'Electricity Shutdown & Pushed / Pulled' :
                                    (alert.shutdown === 'Yes') ? 'Electricity Shutdown' :
                                    'Pushed / Pulled';
                    return `<div class="alert-item"><strong>${alertType}</strong>${alert.datetime}</div>`;
                }).join('')}
            </div>
        `;

        // Event listener for mouseover to open info window
        marker.addListener('mouseover', function() {
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, marker);
        });

        // Event listener for mouseout to close info window
        marker.addListener('mouseout', function() {
            infoWindow.close();
        });

        // Event listener for click to open info window
        marker.addListener('click', function() {
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, marker);
        });
    });
}

// Initialize the map
window.onload = myMapAlert;