document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('reportID');

    if (reportId) {
        fetch(`/reports/${reportId}`)
            .then(response => response.json())
            .then(report => {
                if (report) {
                    document.getElementById('report-title').innerText = `Report Details: ${report.reportID}`;
                    document.getElementById('reportLocation').value = report.reportLocation;

                    document.getElementById('fenceCheck').checked = report.fenceDamage !== undefined;
                    if (report.fenceDamage !== undefined) {
                        document.getElementById('fenceDamage').value = report.fenceDamage;
                        document.getElementById('fenceDamage').style.display = 'block';
                    }
                    
                    document.getElementById('vehicleCheck').checked = report.vehicleDamage !== undefined;
                    if (report.vehicleDamage !== undefined) {
                        document.getElementById('vehicleDamage').value = report.vehicleDamage;
                        document.getElementById('vehicleDamage').style.display = 'block';
                    }

                    document.getElementById('assetsCheck').checked = report.assetsDamage !== undefined;
                    if (report.assetsDamage !== undefined) {
                        document.getElementById('assetsDamage').value = report.assetsDamage;
                        document.getElementById('assetsDamage').style.display = 'block';
                    }

                    document.getElementById('paddockCheck').checked = report.paddockDamage !== undefined;
                    if (report.paddockDamage !== undefined) {
                        document.getElementById('paddockDamage').value = report.paddockDamage;
                        document.getElementById('paddockDamage').style.display = 'block';
                    }

                    document.getElementById('pipeCheck').checked = report.pipeDamage !== undefined;
                    if (report.pipeDamage !== undefined) {
                        document.getElementById('pipeDamage').value = report.pipeDamage;
                        document.getElementById('pipeDamage').style.display = 'block';
                    }

                    document.getElementById('casualtiesCheck').checked = report.casualtiesDamage !== undefined;
                    if (report.casualtiesDamage !== undefined) {
                        document.getElementById('casualtiesDamage').value = report.casualtiesDamage;
                        document.getElementById('casualtiesDamage').style.display = 'block';
                    }

                    document.getElementById('otherCheck').checked = report.otherDamage !== undefined;
                    if (report.otherDamage !== undefined) {
                        document.getElementById('otherName').value = report.otherName;
                        document.getElementById('otherName').style.display = 'block';
                        document.getElementById('otherDamage').value = report.otherDamage;
                        document.getElementById('otherDamage').style.display = 'block';
                    }

                    document.querySelector(`input[name="EFdamage"][value="${report.EFdamage}"]`).checked = true;
                    document.querySelector(`input[name="AIdamage"][value="${report.AIdamage}"]`).checked = true;

                    document.getElementById('datetime-input').value = new Date(report.datetime).toLocaleString();
                    
                    const fileList = document.getElementById('file-list');
                    if (report.images) {
                        report.images.forEach(image => {
                            const listItem = document.createElement('li');
                            listItem.innerHTML = `<a href="${image}" target="_blank">${image}</a>`;
                            fileList.appendChild(listItem);
                        });
                    }

                    document.getElementById('reportingOfficer').value = report.reportingOfficer;
                }
            })
            .catch(error => console.error('Error fetching report:', error));
    }
});
