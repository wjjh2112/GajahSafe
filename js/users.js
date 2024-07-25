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
            row.setAttribute('data-id', user.user_id);

            row.innerHTML = `
                <td><p>${user.user_id}</p></td>
                <td>
                    <div class="table-data__info">
                        <h4>${user.fullname}</h4>
                        <span><a href="#">${user.email}</a></span>
                    </div>
                </td>
                <td><p>${user.usertype}</p></td>
                <td class="text-center">
                    <span class="more">
                        <i class="zmdi zmdi-edit editUserBtn"></i>
                    </span>
                    <span class="more">
                        <i class="zmdi zmdi-delete deleteUserBtn"></i>
                    </span>
                </td>
            `;

            userTableBody.appendChild(row);
        });

        // Initialize filtering
        filterUsers($('#userRoleFilter').val());

        // Attach event listeners for edit and delete buttons
        attachEventListeners();
    }

    // Handle change in user role filter
    $('#userRoleFilter').change(function() {
        var role = $(this).val();
        filterUsers(role);
    });

    // Function to filter users based on role
    function filterUsers(role) {
        $('#userTableBody tr').each(function() {
            var userRole = $(this).find('td:nth-child(3) p').text().trim().toLowerCase();

            if (role === 'all' || userRole === role.toLowerCase()) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Function to attach event listeners for edit and delete buttons
    function attachEventListeners() {
        // Edit user button click event
        document.querySelectorAll('.editUserBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = btn.closest('tr');
                const userId = row.getAttribute('data-id');
                const userFullname = row.querySelector('td:nth-child(2) h4').textContent;
                const userEmail = row.querySelector('td:nth-child(2) span a').textContent;
                const userType = row.querySelector('td:nth-child(3) p').textContent;

                // Populate edit modal
                document.getElementById('userID').textContent = userId;
                document.getElementById('user-fullname').value = userFullname;
                document.getElementById(userType.toLowerCase() + 'Role').checked = true;

                // Show edit modal
                document.getElementById('editUserModal').style.display = 'block';
            });
        });

        // Delete user button click event
        document.querySelectorAll('.deleteUserBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = btn.closest('tr');
                const userId = row.getAttribute('data-id');
                const userFullname = row.querySelector('td:nth-child(2) h4').textContent;
                const userEmail = row.querySelector('td:nth-child(2) span a').textContent;

                // Populate delete confirmation modal
                document.getElementById('confirmUserFullname').textContent = userFullname;
                document.getElementById('confirmUserEmail').textContent = userEmail;

                // Show delete confirmation modal
                document.getElementById('deleteUserConfirmationModal').style.display = 'block';

                // Set up confirm delete button
                document.getElementById('confirmDeleteUserBtn').onclick = function() {
                    deleteUser(userId);
                };
            });
        });
    }

    // Function to delete user
    function deleteUser(userId) {
        fetch('/deleteUser', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: userId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector(`tr[data-id="${userId}"]`).remove();
                document.getElementById('deleteUserConfirmationModal').style.display = 'none';
            } else {
                alert('Failed to delete user');
            }
        })
        .catch(error => console.error('Error deleting user:', error));
    }

    // Edit user form submission
    document.getElementById('editUserForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const userId = document.getElementById('userID').textContent;
        const fullname = document.getElementById('user-fullname').value;
        const role = document.querySelector('input[name="role"]:checked').value;

        fetch('/updateUser', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: userId,
                fullname: fullname,
                usertype: role
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('editUserModal').style.display = 'none';
                // Refresh the user list
                fetch('/users')
                    .then(response => response.json())
                    .then(users => populateTable(users))
                    .catch(error => console.error('Error fetching updated users:', error));
            } else {
                alert('Failed to update user');
            }
        })
        .catch(error => console.error('Error updating user:', error));
    });

    // Close modals when clicking outside or on close button
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });

    // Existing code for add user modal and link generation
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
        
        // Use async/await to handle the promise
        (async function() {
            try {
                const link = await generateLink(expiryDays, role); // Await the promise
                generatedLink.value = link;
                generatedLinkArea.style.display = 'block';
            } catch (error) {
                alert('Failed to generate link.');
            }
        })();
    });

    // Copy link to clipboard
    copyLinkBtn.addEventListener('click', function() {
        generatedLink.select();
        document.execCommand('copy');
        alert('Link copied to clipboard.');
    });

    // Function to generate the link
    async function generateLink(expiryDays, role) {
        const token = generateToken();
        
        try {
            const response = await fetch('/generateLink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, expiryDays, role })
            });
            const data = await response.json();
            if (data.success) {
                const baseUrl = window.location.origin;
                return `${baseUrl}/Register?token=${token}`;
            } else {
                throw new Error('Failed to generate link.');
            }
        } catch (error) {
            console.error('Error generating link:', error);
            throw error;
        }
    }

    // Function to generate a unique token
    function generateToken() {
        return Math.random().toString(36).substr(2, 9); // Simple token generation (you may want to use a more secure method)
    }
});