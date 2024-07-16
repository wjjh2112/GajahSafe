document.addEventListener('DOMContentLoaded', function() {
    // Fetch user data from server
    fetch('/user-info')
        .then(response => response.json())
        .then(userData => {
            if (userData) {
                document.getElementById('avatarImg').src = userData.avatar || 'images/icon/avatar-01.jpg';
                document.getElementById('userName').textContent = userData.name;

                // Update user information in the dropdown
                document.getElementById('dropdownAvatarImg').src = userData.avatar || 'images/icon/avatar-01.jpg';
                document.getElementById('dropdownUserName').textContent = userData.name;
                document.getElementById('dropdownUserEmail').textContent = userData.email;
            } else {
                window.location.href = 'login.html';
            }
        });
});