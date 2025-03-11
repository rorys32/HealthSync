// HealthSync Version 1.3.8 - UI Rendering with Quadrants and Safe Chart Cleanup
let charts = {};

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
    const vitalsEntries = document.getElementById('vitalsEntries').querySelector('ul');
    const intakeEntries = document.getElementById('intakeEntries').querySelector('ul');
    const activityEntries = document.getElementById('activityEntries').querySelector('ul');
    const moodSupplementsEntries = document.getElementById('moodSupplementsEntries').querySelector('ul');

    vitalsEntries.innerHTML = '';
    intakeEntries.innerHTML = '';
    activityEntries.innerHTML = '';
    moodSupplementsEntries.innerHTML = '';

    const waterEntry = document.createElement('li');
    waterEntry.textContent = `Water: ${userDailyData[today].water} oz / 64 oz`;
    intakeEntries.appendChild(waterEntry);

    userDailyData[today].log.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        if (entry.startsWith('Weight:') || entry.startsWith('Blood Pressure:')) {
            vitalsEntries.appendChild(li);
        } else if (entry.startsWith('Meal:')) {
            intakeEntries.appendChild(li);
        } else if (entry.startsWith('Steps:') || entry.startsWith('Exercise:')) {
            activityEntries.appendChild(li);
        } else if (entry.startsWith('Mood:') || entry.startsWith('Symptom:') || (!entry.startsWith('Water:') && !entry.startsWith('Meal:'))) {
            moodSupplementsEntries.appendChild(li);
        }
    });
}

function renderTrends() {
    const stepsCtx = document.getElementById('stepsChart').getContext('2d');
    const hourlyStepsCtx = document.getElementById('hourlyStepsChart').getContext('2d');
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    const bpCtx = document.getElementById('bloodPressureChart').getContext('2d');

    // Safely destroy charts if they exist
    if (charts.stepsChart && typeof charts.stepsChart.destroy === 'function') charts.stepsChart.destroy();
    if (charts.hourlyStepsChart && typeof charts.hourlyStepsChart.destroy === 'function') charts.hourlyStepsChart.destroy();
    if (charts.weightChart && typeof charts.weightChart.destroy === 'function') charts.weightChart.destroy();
    if (charts.bloodPressureChart && typeof charts.bloodPressureChart.destroy === 'function') charts.bloodPressureChart.destroy();

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

    charts.stepsChart = new Chart(stepsCtx, {
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
    charts.hourlyStepsChart = new Chart(hourlyStepsCtx, {
        type: 'bar',
        data: { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), datasets: [{ label: 'Hourly Steps', data: hourlySteps, backgroundColor: 'blue' }] },
        options: { scales: { y: { beginAtZero: true } } }
    });

    charts.weightChart = new Chart(weightCtx, {
        type: 'line',
        data: { labels: dates, datasets: [{ label: 'Weight', data: weightData, borderColor: 'green', fill: false }] },
        options: { scales: { y: { beginAtZero: false } } }
    });

    charts.bloodPressureChart = new Chart(bpCtx, {
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