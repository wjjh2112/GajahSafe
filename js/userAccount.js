document.addEventListener('DOMContentLoaded', function() {
    // Retrieve user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('userData'));
  
    if (userData) {
      // Update user information in the header
      document.getElementById('avatarImg').src = userData.avatar;
      document.getElementById('userName').textContent = userData.name;
  
      // Update user information in the dropdown
      document.getElementById('dropdownAvatarImg').src = userData.avatar;
      document.getElementById('dropdownUserName').textContent = userData.name;
      document.getElementById('dropdownUserEmail').textContent = userData.email;
    } else {
      // Redirect to login page if user data is not found
      window.location.href = 'login.html';
    }
  
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
  
        // Clear sessionStorage
        sessionStorage.removeItem('userData');
  
        // Redirect to login page
        window.location.href = 'login.html';
      });
    }
  });