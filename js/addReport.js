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
    var formattedDateTime = currentDateTime.toISOString().slice(0, 16); // Format the date and time for input[type="datetime-local"]

    dateTimeInput.value = formattedDateTime;
    dateTimeInput.readOnly = true; // Make the input read-only
});

// Upload Images File JS
const fileArray = [];

document.getElementById('file-upload').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const newFiles = Array.from(event.target.files);
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png'];

    const validFiles = newFiles.filter(file => {
        if (!validExtensions.includes(file.type)) {
            alert(`${file.name} is not a valid file type. Only JPEG, JPG, and PNG are allowed.`);
            return false;
        }
        return true;
    });

    fileArray.push(...validFiles);

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

            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = function() {
                URL.revokeObjectURL(this.src);
            };

            a.appendChild(img);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent the click from propagating to the anchor
                fileArray.splice(index, 1);
                updateFileList();
            });

            li.appendChild(a);
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

document.getElementById('addReportForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let isValid = true;
    let errorMessage = "";

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            // Handle single related input
            const relatedInputId = checkbox.getAttribute('data-related-input');
            if (relatedInputId) {
                const relatedInput = document.getElementById(relatedInputId);
                if (!relatedInput.value) {
                    isValid = false;
                    errorMessage += `Please enter a value for ${relatedInputId}.\n`;
                    relatedInput.focus();
                }
            }

            // Handle multiple related inputs
            const relatedInputs = checkbox.getAttribute('data-related-inputs');
            if (relatedInputs) {
                relatedInputs.split(',').forEach(inputId => {
                    const relatedInput = document.getElementById(inputId.trim());
                    if (!relatedInput.value) {
                        isValid = false;
                        errorMessage += `Please enter a value for ${inputId}.\n`;
                        relatedInput.focus();
                    }
                });
            }
        }
    });

    if (!isValid) {
        alert(errorMessage);
    } else {
        const formData = new FormData(this);

        fetch('/submit-report', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Report submitted successfully!');
                window.location.href = '/Reports';
            } else {
                alert('Error submitting report: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting report: ' + error.message);
        });
    }
});
