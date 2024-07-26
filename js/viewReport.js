document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const reportID = urlParams.get('reportID');

    if (reportID) {
        fetch(`/reports/${reportID}`)
            .then(response => response.json())
            .then(report => {
                populateReportDetails(report);
            })
            .catch(error => console.error('Error fetching report details:', error));
    }
});

function populateReportDetails(report) {
    document.getElementById('reportLocation').value = report.reportLocation;
    document.getElementById('datetime-input').value = new Date(report.reportDateTime).toLocaleString();
    document.getElementById('reportingOfficer').value = report.reportingOfficer;

    if (report.reportDamages.fence.damaged) {
        document.getElementById('fenceCheck').checked = true;
        document.getElementById('fenceDamage').value = report.reportDamages.fence.value;
        document.getElementById('fenceDamage').style.display = 'block';
    }
    if (report.reportDamages.vehicle.damaged) {
        document.getElementById('vehicleCheck').checked = true;
        document.getElementById('vehicleDamage').value = report.reportDamages.vehicle.value;
        document.getElementById('vehicleDamage').style.display = 'block';
    }
    if (report.reportDamages.assets.damaged) {
        document.getElementById('assetsCheck').checked = true;
        document.getElementById('assetsDamage').value = report.reportDamages.assets.value;
        document.getElementById('assetsDamage').style.display = 'block';
    }
    if (report.reportDamages.paddock.damaged) {
        document.getElementById('paddockCheck').checked = true;
        document.getElementById('paddockDamage').value = report.reportDamages.paddock.value;
        document.getElementById('paddockDamage').style.display = 'block';
    }
    if (report.reportDamages.pipe.damaged) {
        document.getElementById('pipeCheck').checked = true;
        document.getElementById('pipeDamage').value = report.reportDamages.pipe.value;
        document.getElementById('pipeDamage').style.display = 'block';
    }
    if (report.reportDamages.casualties.damaged) {
        document.getElementById('casualtiesCheck').checked = true;
        document.getElementById('casualtiesDamage').value = report.reportDamages.casualties.value;
        document.getElementById('casualtiesDamage').style.display = 'block';
    }
    if (report.reportDamages.other.damaged) {
        document.getElementById('otherCheck').checked = true;
        document.getElementById('otherName').value = report.reportDamages.other.damagedName;
        document.getElementById('otherDamage').value = report.reportDamages.other.value;
        document.getElementById('otherName').style.display = 'block';
        document.getElementById('otherDamage').style.display = 'block';
    }

    document.getElementById('EF' + (report.reportEFDamage === 'damaged' ? 'Damaged' : 'Undamaged')).checked = true;
    document.getElementById('AI' + (report.reportCAMDamage === 'damaged' ? 'Damaged' : 'Undamaged')).checked = true;

    const fileList = document.getElementById('file-list');
    report.reportImages.forEach(image => {
        const li = document.createElement('li');
        li.textContent = image;
        fileList.appendChild(li);
    });
}
