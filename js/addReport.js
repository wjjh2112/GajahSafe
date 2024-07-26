document.addEventListener("DOMContentLoaded", function() {
    // Damage Checkbox JS
    var checkboxes = document.querySelectorAll('.form-check-input');
  
    checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        var parent = this.closest('.checkbox');
        var inputs = parent.querySelectorAll('.damage-input');
  
        if (this.checked) {
          inputs.forEach(function(input) {
            input.style.display = 'inline-block';
          });
        } else {
          inputs.forEach(function(input) {
            input.style.display = 'none';
          });
        }
      });
    });
  
    // Date & Time JS
    var dateTimeInput = document.getElementById('datetime-input');
    var currentDateTime = new Date();
    var formattedDateTime = currentDateTime.toLocaleString(); // Formats the date and time according to the user's locale
  
    dateTimeInput.value = formattedDateTime;
  
    // Upload Images File JS
    const fileArray = [];
  
    document.getElementById('file-upload').addEventListener('change', handleFileSelect);
  
    function handleFileSelect(event) {
      const newFiles = Array.from(event.target.files);
      fileArray.push(...newFiles);
  
      updateFileList();
    }
  
    function updateFileList() {
      const fileListUl = document.getElementById('file-list');
      fileListUl.innerHTML = '';
  
      if (fileArray.length === 0) {
        const placeholderLi = document.createElement('li');
        placeholderLi.id = 'placeholder-li';
        const placeholderLabel = document.createElement('label');
        placeholderLabel.setAttribute('for', 'file-upload');
        placeholderLabel.className = 'add-images-placeholder';
        placeholderLabel.innerHTML = '<span>Click to add images</span>';
        placeholderLi.appendChild(placeholderLabel);
        fileListUl.appendChild(placeholderLi);
      } else {
        fileArray.forEach((file, index) => {
          const li = document.createElement('li');
  
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          img.onload = function() {
            URL.revokeObjectURL(this.src);
          };
  
          const removeButton = document.createElement('button');
          removeButton.textContent = 'X';
          removeButton.addEventListener('click', function() {
            fileArray.splice(index, 1);
            updateFileList();
          });
  
          li.appendChild(img);
          li.appendChild(removeButton);
          fileListUl.appendChild(li);
        });
  
        // Append the Add Images button at the end
        const addButtonLi = document.createElement('li');
        addButtonLi.id = 'add-button-li';
        const addButton = document.createElement('label');
        addButton.setAttribute('for', 'file-upload');
        addButton.className = 'add-images-label';
        addButton.innerHTML = '<span>+</span> Add';
        addButtonLi.appendChild(addButton);
        fileListUl.appendChild(addButtonLi);
      }
  
      updateFileInput();
    }
  
    function updateFileInput() {
      const dt = new DataTransfer();
      fileArray.forEach(file => dt.items.add(file));
      document.getElementById('file-upload').files = dt.files;
    }
  
    // Handle form submission
    document.getElementById('addReportForm').addEventListener('submit', function(event) {
      event.preventDefault();
  
      const formData = new FormData();
      formData.append('reportLocation', document.getElementById('location').value);
      formData.append('reportingOfficer', document.getElementById('reportingOfficer').value);
      formData.append('reportDateTime', document.getElementById('datetime-input').value);
  
      // Append damages
      const damages = {
        fence: {
          damaged: document.getElementById('fenceCheck').checked,
          value: document.getElementById('fenceDamage').value || 0
        },
        vehicle: {
          damaged: document.getElementById('vehicleCheck').checked,
          value: document.getElementById('vehicleDamage').value || 0
        },
        assets: {
          damaged: document.getElementById('assetsCheck').checked,
          value: document.getElementById('assetsDamage').value || 0
        },
        paddock: {
          damaged: document.getElementById('paddockCheck').checked,
          value: document.getElementById('paddockDamage').value || 0
        },
        pipe: {
          damaged: document.getElementById('pipeCheck').checked,
          value: document.getElementById('pipeDamage').value || 0
        },
        casualties: {
          damaged: document.getElementById('casualtiesCheck').checked,
          value: document.getElementById('casualtiesDamage').value || 0
        },
        other: {
          damaged: document.getElementById('otherCheck').checked,
          damagedName: document.getElementById('otherName').value || "",
          value: document.getElementById('otherDamage').value || 0
        }
      };
  
      formData.append('reportDamages', JSON.stringify(damages));
      formData.append('reportEFDamage', document.querySelector('input[name="EFdamage"]:checked').value);
      formData.append('reportCAMDamage', document.querySelector('input[name="AIdamage"]:checked').value);
  
      // Append images
      fileArray.forEach(file => formData.append('reportImages', file));
  
      fetch('/addReport', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        // Handle success, e.g., show a success message or redirect
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle error, e.g., show an error message
      });
    });
  });
  