// Damage Checkbox JS 
document.addEventListener("DOMContentLoaded", function() {
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
});


// Date & Time JS
document.addEventListener("DOMContentLoaded", function() {
    var dateTimeInput = document.getElementById('datetime-input');
    var currentDateTime = new Date();
    var formattedDateTime = currentDateTime.toLocaleString(); // Formats the date and time according to the user's locale

    dateTimeInput.value = formattedDateTime;
});


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

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reportForm');
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const reportData = {};
      
      for (let [key, value] of formData.entries()) {
        if (key.endsWith('Check')) {
          // For checkboxes, we send whether they're checked or not
          reportData[key] = form.elements[key].checked.toString();
        } else {
          reportData[key] = value;
        }
      }
      
      // Handle file uploads
      const fileInput = document.getElementById('file-upload');
      reportData.images = Array.from(fileInput.files).map(file => file.name);
      
      fetch('/addReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Report added successfully. Report ID: ' + data.reportID);
          form.reset();
        } else {
          alert('Error adding report: ' + data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while submitting the report.');
      });
    });
  });