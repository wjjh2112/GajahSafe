document.addEventListener('DOMContentLoaded', async function() {
    // Fetch user information from the backend
    try {
      const response = await fetch('http://13.212.12.152:3000/users');
      const users = await response.json();

      // Assuming you want to display the first user in the list
      if (users.length > 0) {
        const user = users[0];
        document.getElementById('userName').textContent = user.fullname;
        document.getElementById('dropdownUserName').textContent = user.fullname;
        document.getElementById('dropdownUserEmail').textContent = user.email;
        // You can update additional UI elements as needed
      } else {
        document.getElementById('userName').textContent = 'No users found';
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('userName').textContent = 'Error loading user data';
    }
  });