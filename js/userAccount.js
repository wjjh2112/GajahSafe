
  async function fetchUsers() {
    try {
      const response = await fetch('http://13.212.12.152:3000/users');
      const users = await response.json();
      if (users.length > 0) {
        // Assuming you want to display the first user for demo purposes
        const user = users[0];
        document.getElementById('userName').textContent = user.fullname;
        document.getElementById('dropdownUserName').textContent = user.fullname;
        document.getElementById('dropdownUserEmail').textContent = user.email;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  // Call fetchUsers when the page loads
  window.onload = fetchUsers;