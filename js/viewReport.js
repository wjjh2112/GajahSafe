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
    const undamagedRadio = document.getElementById(`${prefix}Undamaged`);
    const damagedRadio = document.getElementById(`${prefix}Damaged`);
    
    if (value === 'undamaged') {
        undamagedRadio.checked = true;
    } else {
        damagedRadio.checked = true;
    }
}

function displayImages(images) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    images.forEach(image => {
        const li = document.createElement('li');
        li.textContent = image;
        fileList.appendChild(li);
    });
}


//     const fileList = document.getElementById('file-list');
//     report.reportImages.forEach(image => {
//         const li = document.createElement('li');
//         li.textContent = image;
//         fileList.appendChild(li);
//     });
// }
