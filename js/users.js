document.addEventListener('DOMContentLoaded', function() {
    const userTableBody = document.getElementById('userTableBody');

    // Fetch users from the server
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            // Populate the table with users
            populateTable(users);
        })
        .catch(error => console.error('Error fetching users:', error));

    // Function to populate the table with users
    function populateTable(users) {
        userTableBody.innerHTML = ''; // Clear existing rows

        users.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>
                    <label class="au-checkbox">
                        <input type="checkbox">
                        <span class="au-checkmark"></span>
                    </label>
                </td>
                <td>
                    <div class="table-data__info">
                        <h4>${user.fullname}</h4>
                        <span><a href="#">${user.email}</a></span>
                    </div>
                </td>
                <td><p>${user.user_id}</p></td>
                <td><p>${user.usertype}</p></td>
                <td class="text-center"><span class="more"><i class="zmdi zmdi-more"></i></span></td>
            `;

            userTableBody.appendChild(row);
        });

        // Initialize filtering
        filterUsers($('#userRoleFilter').val());

        // Handle change in user role filter
        $('#userRoleFilter').change(function() {
            var role = $(this).val();
            filterUsers(role);
        });

        // Function to filter users based on role
        function filterUsers(role) {
            $('#userTableBody tr').each(function() {
                var userRole = $(this).find('td:nth-child(4) p').text().trim().toLowerCase();

                if (role === 'all' || userRole === role.toLowerCase()) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
    }

    // Modal functionality
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
