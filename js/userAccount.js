document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
      // Update the account section with user information
      document.getElementById('userName').textContent = user.fullname;
      document.getElementById('dropdownUserName').textContent = user.fullname;
      document.getElementById('dropdownUserEmail').textContent = user.email;
      // Optionally, update the avatar image based on user information
    } else {
      // Redirect to login page if no user information is found
      window.location.href = 'login.html';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html'; // Redirect to login page on logout
  });