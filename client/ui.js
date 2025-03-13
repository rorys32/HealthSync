// ui.js

// Fetch data from the server with JWT authentication
function fetchData() {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
      console.error('No token found. Please log in.');
      // TODO: Redirect to login page once implemented, e.g., window.location.href = '/login.html';
      return;
    }
  
    fetch('/api/data', {
      headers: {
        'Authorization': `Bearer ${token}` // Send the token in the Authorization header
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then(data => renderUI(data)) // Render the UI with the fetched data
      .catch(error => console.error('Error fetching data:', error));
  }
  
  // Render the UI based on the fetched data
  function renderUI(data) {
    const quadrants = document.getElementById('quadrants');
    if (!data || !data.userDailyDataKeys.length) {
      console.log('No data available');
      quadrants.innerHTML = '<p>No data available</p>';
      return;
    }
    // Example rendering logic (customize as needed)
    quadrants.innerHTML = ''; // Clear existing content
    data.userDailyDataKeys.forEach(key => {
      const dayData = data.userDailyData[key];
      const quadrant = document.createElement('div');
      quadrant.innerHTML = `<h3>${key}</h3><p>Weight: ${dayData.weight || 'N/A'}</p>`;
      quadrants.appendChild(quadrant);
    });
  }
  
  // Call fetchData when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    fetchData();
  });