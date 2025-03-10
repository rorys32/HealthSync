// HealthSync Version 1.1.015 - Main Entry Point
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentDate').textContent = new Date(today).toLocaleDateString();
    document.getElementById('waterProgress').value = userDailyData[today].water;
    document.getElementById('stepProgress').value = userDailyData[today].steps;
    renderSupplements();
    renderLog();
    renderTrends();
});