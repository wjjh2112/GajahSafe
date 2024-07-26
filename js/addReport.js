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

    // Form submission
    const form = document.querySelector('form.form-horizontal');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);

        fetch('/submitReport', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Report submitted successfully!');
                window.location.href = '/Reports';
            } else {
                alert('Failed to submit report: ' + data.message);
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Failed to submit report.');
        });
    });
});
