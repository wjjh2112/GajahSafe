document.addEventListener('DOMContentLoaded', function() {
    // Retrieve user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('userData'));

    if (userData) {
        // Extract the first name from the full name
        const firstName = userData.name.split(' ')[0]; // Splits the name at the first space and takes the first part

        // Update user information in the header
        document.getElementById('avatarImg').src = userData.avatar;
        document.getElementById('userName').textContent = firstName; // Display first name only

        // Update user information in the dropdown
        document.getElementById('dropdownAvatarImg').src = userData.avatar;
        document.getElementById('dropdownUserName').textContent = userData.name;
        document.getElementById('dropdownUserEmail').textContent = userData.email;

        // Control visibility based on user type
        if (userData.usertype === 'Viewer') {
            document.getElementById('sidebar-users-item').style.display = 'none';
            document.getElementById('sidebar-devices-item').style.display = 'none';
            document.getElementById('mobile-users-item').style.display = 'none';
            document.getElementById('mobile-devices-item').style.display = 'none';
        }
    } else {
        // Redirect to login page if user data is not found
        window.location.href = '/Login';
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior

            // Clear sessionStorage
            sessionStorage.removeItem('userData');

            // Redirect to login page
            window.location.href = '/Login';
        });
    }
});
