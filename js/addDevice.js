document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addDeviceForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const deviceType = document.getElementById('device-type').value;
        const deviceId = document.getElementById('device-id').value;
        const deviceName = document.getElementById('device-name').value;
        const deviceLocation = document.getElementById('device-location').value;
        const deviceLatitude = document.getElementById('device-latitude').value;
        const deviceLongitude = document.getElementById('device-longitude').value;
        const installationDate = document.getElementById('installation-date').value;
        const status = document.querySelector('input[name="status"]:checked').value;

        // Format the date as dd/mm/yyyy
        const formattedDate = formatDate(new Date(installationDate));

        const deviceData = {
            'device-type': deviceType,
            'device-id': deviceId,
            'device-name': deviceName,
            'device-location': deviceLocation,
            'device-latitude': deviceLatitude,
            'device-longitude': deviceLongitude,
            'installation-date': formattedDate,
            status: status
        };

        fetch('/addDevice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deviceData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Device added successfully.');
                location.reload(); // Reload the page to show the updated table
            } else {
                alert('Error adding device: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding device. Check console for details.');
        });
    });

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
});
