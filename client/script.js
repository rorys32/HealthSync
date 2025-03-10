// HealthSync Version 1.2.2 - Main Script
async function initializeUI() {
    console.log('Initializing UI...');
    await login(); // Wait for data to be fetched
    console.log('UI initialized, rendering with userDailyData:', JSON.stringify(userDailyData, null, 2));
    document.getElementById('currentDate').textContent = new Date(today).toLocaleDateString();
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