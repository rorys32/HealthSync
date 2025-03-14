// HealthSync Version 1.3.003 - Main Script
async function initializeUI() {
    console.log('Initializing UI...');
    await login(); // Wait for data to be fetched
    console.log('UI initialized, rendering with userDailyData:', JSON.stringify(userDailyData, null, 2));
    
    // Set current date dynamically in MM/DD/YYYY format
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    document.getElementById('currentDate').textContent = formattedDate; // e.g., "03/14/2025"
    
    // Render UI elements with fetched data
    document.getElementById('waterProgress').value = userDailyData[today].water;
    document.getElementById('stepProgress').value = userDailyData[today].steps;
    renderSupplements();
    renderLog();
    renderTrends();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded, starting initialization...');
    initializeUI();
});