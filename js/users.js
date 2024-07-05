document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('addUserModal');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeBtn = document.getElementById('closeAddUserModal');
    const generateLinkBtn = document.getElementById('generateLinkBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const generatedLinkArea = document.getElementById('generatedLinkArea');
    const generatedLink = document.getElementById('generatedLink');
    const expiryDaysInput = document.getElementById('expiryDays');
    const roleRadios = document.getElementsByName('role');

    // Show the modal
    addUserBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Disable scrolling
    });

    // Close the modal and reset form
    function closeModalAndReset() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
        // Reset form fields here
        expiryDaysInput.value = '';
        generatedLinkArea.style.display = 'none';
        generatedLink.value = '';
        // Uncheck radio buttons
        roleRadios.forEach(radio => {
            radio.checked = false;
        });
    }

    // Close the modal on close button click
    closeBtn.addEventListener('click', closeModalAndReset);

    // Close the modal if user clicks outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModalAndReset();
        }
    });

    // Generate link button click
    generateLinkBtn.addEventListener('click', function() {
        const expiryDays = expiryDaysInput.value;
        const selectedRole = document.querySelector('input[name="role"]:checked');

        if (!expiryDays || !selectedRole) {
            alert('Please fill in all fields.');
            return;
        }

        const role = selectedRole.value;
        const link = generateLink(expiryDays, role);
        generatedLink.value = link;
        generatedLinkArea.style.display = 'block';
    });

    // Copy link to clipboard
    copyLinkBtn.addEventListener('click', function() {
        generatedLink.select();
        document.execCommand('copy');
        alert('Link copied to clipboard.');
    });

    // Function to generate the link
    function generateLink(expiryDays, role) {
        // Replace with your actual link generation logic
        return `https://example.com/register?expiry=${expiryDays}&role=${role}`;
    }
});


$(document).ready(function() {
// Initial filtering based on selected role filter
filterUsers($('#userRoleFilter').val());

// Handle change in user role filter
$('#userRoleFilter').change(function() {
    var role = $(this).val();
    filterUsers(role);
});

// Function to filter users based on role
function filterUsers(role) {
    $('.table-data tbody tr').each(function() {
        var userRole = $(this).find('td:nth-child(4) p').text().trim().toLowerCase();
        
        if (role === 'all' || userRole === role.toLowerCase()) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}
});
