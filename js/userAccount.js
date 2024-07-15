window.onload = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
      document.getElementById('userName').textContent = user.fullname;
      document.getElementById('dropdownUserName').textContent = user.fullname;
      document.getElementById('dropdownUserEmail').textContent = user.email;
    } else {
      window.location.href = 'login.html'; // Redirect to login if no user data
    }
  };
  