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

            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.target = '_blank'; // Opens in a new tab
            link.appendChild(img);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent link from opening
                fileArray.splice(index, 1);
                updateFileList();
            });

            li.appendChild(link);
            li.appendChild(removeButton);
            fileListUl.appendChild(li);
        });

        // Add Images button
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

// Form submission handling
document.getElementById('addReportForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let isValid = true;
    let errorMessage = "";

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            // Single related input
            const relatedInputId = checkbox.getAttribute('data-related-input');
            if (relatedInputId) {
                const relatedInput = document.getElementById(relatedInputId);
                if (!relatedInput.value) {
                    isValid = false;
                    errorMessage += `Please enter a value for ${relatedInputId}.\n`;
                    relatedInput.focus();
                }
            }

            // Multiple related inputs
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
                this.reset();
            } else {
                alert('Error submitting report: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting report: ' + error.message);
        });
    }
});
