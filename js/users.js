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
                        <i class="zmdi zmdi-edit editUserBtn" data-id="${user.user_id}"></i>
                    </span>
                    <span class="more">
                        <i class="zmdi zmdi-delete deleteUserBtn" data-id="${user.user_id}"></i>
                    </span>
                </td>
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
                var userRole = $(this).find('td:nth-child(3) p').text().trim().toLowerCase(); // Adjusted to match the correct column

                if (role === 'all' || userRole === role.toLowerCase()) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
    }

    // Add User Modal and Form
    const addUserModal = document.getElementById('addUserModal');
    const closeAddUserModalBtn = document.getElementById('closeAddUserModal');
    const addUserForm = document.getElementById('addUserForm');
    
    // Show add user modal
    document.getElementById('showAddUserModalBtn').addEventListener('click', function() {
        addUserModal.style.display = 'block';
    });

    // Submit add user form
    addUserForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const fullname = document.getElementById('newUserFullname').value;
        const email = document.getElementById('newUserEmail').value;
        const role = document.querySelector('input[name="newUserRole"]:checked').value;

        fetch('/addUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User added successfully.');
                location.reload(); // Refresh the page to update the table
            } else {
                alert('Failed to add user.');
            }
        });
        addUserModal.style.display = 'none';
    });

    // Close add user modal
    closeAddUserModalBtn.addEventListener('click', function() {
        addUserModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == addUserModal) {
            addUserModal.style.display = 'none';
        }
    }

    // Modal functionality for delete and edit user
    const deleteUserModal = document.getElementById('deleteUserConfirmationModal');
    const editUserModal = document.getElementById('editUserModal');
    const closeDeleteModalBtn = document.getElementById('closeDeleteUserConfirmationModal');
    const closeEditModalBtn = document.getElementById('closeEditUserModal');
    const confirmDeleteUserBtn = document.getElementById('confirmDeleteUserBtn');
    const cancelDeleteUserBtn = document.getElementById('cancelDeleteUserBtn');

    let currentUserIdToDelete = null;
    let currentUserIdToEdit = null;

    // Show delete confirmation modal
    userTableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('deleteUserBtn')) {
            currentUserIdToDelete = event.target.getAttribute('data-id');
            fetch(`/users/${currentUserIdToDelete}`)
                .then(response => response.json())
                .then(user => {
                    document.getElementById('confirmUserFullname').textContent = user.fullname;
                    document.getElementById('confirmUserEmail').textContent = user.email;
                    deleteUserModal.style.display = 'block';
                });
        }
    });

    // Show edit user modal
    userTableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('editUserBtn')) {
            currentUserIdToEdit = event.target.getAttribute('data-id');
            fetch(`/users/${currentUserIdToEdit}`)
                .then(response => response.json())
                .then(user => {
                    document.getElementById('userID').textContent = `User ID: ${user.user_id}`;
                    document.getElementById('user-fullname').value = user.fullname;
                    document.querySelector(`input[name="role"][value="${user.usertype}"]`).checked = true;
                    editUserModal.style.display = 'block';
                });
        }
    });

    // Confirm delete user
    confirmDeleteUserBtn.addEventListener('click', function() {
        fetch('/deleteUser', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentUserIdToDelete })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User deleted successfully.');
                location.reload(); // Refresh the page to update the table
            } else {
                alert('Failed to delete user.');
            }
        });
        deleteUserModal.style.display = 'none';
    });

    // Cancel delete user
    cancelDeleteUserBtn.addEventListener('click', function() {
        deleteUserModal.style.display = 'none';
    });

    // Submit edit user form
    editUserForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const fullname = document.getElementById('user-fullname').value;
        const role = document.querySelector('input[name="role"]:checked').value;

        fetch('/updateUser', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentUserIdToEdit, fullname, role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User updated successfully.');
                location.reload(); // Refresh the page to update the table
            } else {
                alert('Failed to update user.');
            }
        });
        editUserModal.style.display = 'none';
    });

    // Close modals
    closeDeleteModalBtn.addEventListener('click', function() {
        deleteUserModal.style.display = 'none';
    });

    closeEditModalBtn.addEventListener('click', function() {
        editUserModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == deleteUserModal) {
            deleteUserModal.style.display = 'none';
        }
        if (event.target == editUserModal) {
            editUserModal.style.display = 'none';
        }
        if (event.target == addUserModal) {
            addUserModal.style.display = 'none';
        }
    }
});
