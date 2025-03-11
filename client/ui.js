// HealthSync Version 1.3.6 - UI Rendering with Safe Chart Cleanup
function estimateCalories(food) {
    const calorieMap = { "Oatmeal": 150, "Mixed Fruit": 180, "Coffee": 5 };
    return calorieMap[food] || 100;
}

function renderSupplements() {
    const supplementList = document.getElementById('supplementList');
    supplementList.innerHTML = '';
    supplements.forEach(sup => {
        const div = document.createElement('div');
        div.innerHTML = `<input type="checkbox" id="${sup}"><label for="${sup}">${sup}</label>`;
        supplementList.appendChild(div);
    });
}

function renderLog() {
    const logDiv = document.getElementById('log');
    logDiv.innerHTML = '<h2>Daily Log</h2>';
    const ul = document.createElement('ul');
    userDailyData[today].log.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        ul.appendChild(li);
    });
    logDiv.appendChild(ul);
}

function renderTrends() {
    const stepsCtx = document.getElementById('stepsChart').getContext('2d');
    const hourlyStepsCtx = document.getElementById('hourlyStepsChart').getContext('2d');
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    const bpCtx = document.getElementById('bloodPressureChart').getContext('2d');

    // Safely destroy charts if they exist
    if (window.stepsChart && typeof window.stepsChart.destroy === 'function') window.stepsChart.destroy();
    if (window.hourlyStepsChart && typeof window.hourlyStepsChart.destroy === 'function') window.hourlyStepsChart.destroy();
    if (window.weightChart && typeof window.weightChart.destroy === 'function') window.weightChart.destroy();
    if (window.bloodPressureChart && typeof window.bloodPressureChart.destroy === 'function') window.bloodPressureChart.destroy();

    const vitalsEntries = Object.entries(userDailyData || {});
    if (!vitalsEntries.length) {
        console.log('No vital entries to render');
        return;
    }

    const dates = vitalsEntries.map(([date]) => date);
    const stepsData = vitalsEntries.map(([, data]) => data.steps || 0);
    const weightData = vitalsEntries.map(([, data]) => data.weight || null);
    const systolicData = vitalsEntries.map(([, data]) => data.bloodPressure?.systolic || null);
    const diastolicData = vitalsEntries.map(([, data]) => data.bloodPressure?.diastolic || null);

    window.stepsChart = new Chart(stepsCtx, {
        type: 'line',
        data: { labels: dates, datasets: [{ label: 'Steps', data: stepsData, borderColor: 'blue', fill: false }] },
        options: { scales: { y: { beginAtZero: true } } }
    });

    const hourlySteps = Array(24).fill(0);
    vitalsEntries.forEach(([, data]) => {
        if (data.stepsLog) {
            data.stepsLog.forEach(({ steps, time }) => {
                const hour = new Date(time).getHours();
                hourlySteps[hour] += steps;
            });
        }
    });
    window.hourlyStepsChart = new Chart(hourlyStepsCtx, {
        type: 'bar',
        data: { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), datasets: [{ label: 'Hourly Steps', data: hourlySteps, backgroundColor: 'blue' }] },
        options: { scales: { y: { beginAtZero: true } } }
    });

    window.weightChart = new Chart(weightCtx, {
        type: 'line',
        data: { labels: dates, datasets: [{ label: 'Weight', data: weightData, borderColor: 'green', fill: false }] },
        options: { scales: { y: { beginAtZero: false } } }
    });

    window.bloodPressureChart = new Chart(bpCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                { label: 'Systolic BP', data: systolicData, borderColor: 'red', fill: false },
                { label: 'Diastolic BP', data: diastolicData, borderColor: 'orange', fill: false }
            ]
        },
        options: { scales: { y: { beginAtZero: false } } }
    });
}