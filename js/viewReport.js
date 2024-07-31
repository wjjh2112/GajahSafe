document.addEventListener('DOMContentLoaded', function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const reportId = urlParams.get('reportID');

    if (reportId) {
        fetch(`/reports/${reportId}`)
            .then(response => response.json())
            .then(report => {
                displayReportDetails(report);
            })
            .catch(error => console.error('Error:', error));
    }
});

function displayReportDetails(report) {
    document.getElementById('reportLocation').value = report.reportLocation;
    document.getElementById('datetime-input').value = new Date(report.reportDateTime).toLocaleString();
    document.getElementById('reportingOfficer').value = report.reportingOfficer;

    displayDamages(report.reportDamages);
    displayRadioButtons('EF', report.reportEFDamage);
    displayRadioButtons('AI', report.reportCAMDamage);
    displayImages(report.reportImages);
}

function displayDamages(damages) {
    for (const damageType in damages) {
        const damage = damages[damageType];
        const damageCheckbox = document.getElementById(`${damageType}Check`);
        const damageInput = document.getElementById(`${damageType}Damage`);
        const otherNameInput = document.getElementById('otherName');
        
        if (damage.damaged) {
            damageCheckbox.checked = true;
            damageInput.style.display = 'block';
            damageInput.value = damage.value;
            if (damageType === 'other') {
                otherNameInput.style.display = 'block';
                otherNameInput.value = damage.damagedName;
            }
        } else {
            damageCheckbox.closest('.checkbox').style.display = 'none';
        }
    }
}

function displayRadioButtons(prefix, value) {
    const radioButtons = document.querySelectorAll(`input[name="${prefix}damage"]`);
    radioButtons.forEach(radio => {
        const label = radio.closest('label');
        if (radio.value === value) {
            radio.checked = true;
            label.style.display = 'block';
        } else {
            label.style.display = 'none';
        }
    });
}

function displayImages(images) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Clear any existing content

    images.forEach(image => {
        const li = document.createElement('li');
        const img = document.createElement('img');

        img.src = image;
        img.alt = 'Report Image';
        img.style.maxWidth = '100%'; // Adjust as needed
        img.style.height = 'auto'; // Maintain aspect ratio
        img.style.cursor = 'pointer'; // Change cursor to pointer for better UX

        // Add click event listener to open image in a new tab
        img.addEventListener('click', function() {
            const newWindow = window.open();
            newWindow.document.write('<img src="' + this.src + '" style="width:100%;height:auto;"/>');
        });

        li.appendChild(img);
        fileList.appendChild(li);
    });
}

