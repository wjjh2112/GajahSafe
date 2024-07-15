document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
      document.getElementById('userName').innerText = user.fullname;
      document.getElementById('dropdownUserName').innerText = user.fullname;
      document.getElementById('dropdownUserEmail').innerText = user.email;
    } else {
      // Redirect to login page if no user is logged in
      window.location.href = 'login.html';
    }
  });