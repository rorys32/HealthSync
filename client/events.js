// HealthSync Version 1.3.4 - Event Listeners with Time-of-Day Logging
document.addEventListener('DOMContentLoaded', async () => {
    console.log('events.js loaded, starting login...');
    await login();

    const addSupplementBtn = document.getElementById('addSupplement');
    const logAllSupplementsBtn = document.getElementById('logAllSupplements');
    const waterBtns = document.querySelectorAll('.waterBtn');
    const logWeightBtn = document.getElementById('logWeight');
    const logStepsBtn = document.getElementById('logSteps');
    const logBloodPressureBtn = document.getElementById('logBloodPressure');
    const logFoodBtn = document.getElementById('logFood');
    const logExerciseBtn = document.getElementById('logExercise');
    const logMoodBtn = document.getElementById('logMood');
    const logSymptomBtn = document.getElementById('logSymptom');
    const loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const saveDataBtn = document.getElementById('saveDataBtn');
    const loadDataBtn = document.getElementById('loadDataBtn');

    $("#newSupplementInput").autocomplete({
        source: () => supplements,
        minLength: 1
    });

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        if (hour < 20) return 'Evening';
        return 'Night';
    };

    addSupplementBtn.addEventListener('click', async () => {
        const newSup = document.getElementById('newSupplementInput').value.trim();
        if (newSup && !supplements.includes(newSup)) {
            supplements.push(newSup);
            await saveData();
            renderSupplements();
            document.getElementById('newSupplementInput').value = '';
        }
    });

    logAllSupplementsBtn.addEventListener('click', async () => {
        const checked = document.querySelectorAll('#supplementList input:checked');
        if (checked.length > 0) {
            const timeOfDay = getTimeOfDay();
            checked.forEach(input => {
                const supName = input.nextElementSibling.textContent;
                userDailyData[today].log.push(`${supName}, ${timeOfDay}`);
            });
            await saveData();
            renderLog();
        }
    });

    waterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const oz = parseInt(btn.dataset.oz);
            userDailyData[today].water += oz;
            document.getElementById('waterProgress').value = userDailyData[today].water;
            await saveData();
            renderLog();
        });
    });

    logWeightBtn.addEventListener('click', async () => {
        const weight = document.getElementById('weightInput').value;
        if (weight) {
            userDailyData[today].weight = weight;
            userDailyData[today].log.push(`Weight: ${weight} lbs, ${getTimeOfDay()}`);
            await saveData();
            renderLog();
            renderTrends();
            document.getElementById('weightInput').value = '';
        }
    });

    logStepsBtn.addEventListener('click', async () => {
        const steps = parseInt(document.getElementById('stepInput').value);
        if (steps && steps > 0) {
            userDailyData[today].steps += steps;
            userDailyData[today].stepsLog.push({ steps, time: new Date().toISOString() });
            userDailyData[today].log = userDailyData[today].log.filter(e => !e.startsWith('Steps:'));
            userDailyData[today].log.push(`Steps: ${userDailyData[today].steps} / 10000, ${getTimeOfDay()}`);
            document.getElementById('stepProgress').value = userDailyData[today].steps;
            await saveData();
            renderLog();
            renderTrends();
            document.getElementById('stepInput').value = '';
        }
    });

    logBloodPressureBtn.addEventListener('click', async () => {
        const systolic = document.getElementById('systolicInput').value;
        const diastolic = document.getElementById('diastolicInput').value;
        if (systolic && diastolic) {
            userDailyData[today].bloodPressure = { systolic, diastolic };
            userDailyData[today].log.push(`Blood Pressure: ${systolic}/${diastolic} mmHg, ${getTimeOfDay()}`);
            await saveData();
            renderLog();
            renderTrends();
            document.getElementById('systolicInput').value = '';
            document.getElementById('diastolicInput').value = '';
        }
    });

    logFoodBtn.addEventListener('click', async () => {
        const food = document.getElementById('foodInput').value;
        if (food) {
            if (!foods.includes(food)) foods.push(food);
            userDailyData[today].log.push(`Meal: ${food}, ~${estimateCalories(food)} kcal, ${getTimeOfDay()}`);
            await saveData();
            renderLog();
            document.getElementById('foodInput').value = '';
        }
    });

    logExerciseBtn.addEventListener('click', async () => {
        const exercise = document.getElementById('exerciseInput').value;
        if (exercise) {
            userDailyData[today].log.push(`Exercise: ${exercise}, ${getTimeOfDay()}`);
            userDailyData[today].exercises.push(exercise);
            await saveData();
            renderLog();
            renderTrends();
            document.getElementById('exerciseInput').value = '';
        }
    });

    document.getElementById('moodSelect').addEventListener('change', () => {
        document.getElementById('customMoodInput').style.display = 
            document.getElementById('moodSelect').value === 'Custom' ? 'inline-block' : 'none';
    });

    logMoodBtn.addEventListener('click', async () => {
        let mood = document.getElementById('moodSelect').value;
        if (mood === 'Custom') {
            mood = document.getElementById('customMoodInput').value.trim();
            if (!mood) return;
        }
        userDailyData[today].moods.push({ mood, time: new Date().toISOString() });
        userDailyData[today].log.push(`Mood: ${mood}, ${getTimeOfDay()}`);
        await saveData();
        renderLog();
        document.getElementById('customMoodInput').value = '';
        document.getElementById('customMoodInput').style.display = 'none';
        document.getElementById('moodSelect').value = 'Happy';
    });

    logSymptomBtn.addEventListener('click', async () => {
        const symptom = document.getElementById('symptomInput').value.trim();
        if (symptom) {
            userDailyData[today].symptoms.push({ symptom, time: new Date().toISOString() });
            userDailyData[today].log.push(`Symptom: ${symptom}, ${getTimeOfDay()}`);
            await saveData();
            renderLog();
            document.getElementById('symptomInput').value = '';
        }
    });

    loadSampleDataBtn.addEventListener('click', async () => {
        console.log('Button clicked! Loading sample data...');
        if (!token) {
            console.log('No token, logging in...');
            await login();
        }
        const sampleData = {
            "2025-03-05": {
                steps: 7000,
                water: 40,
                weight: "153",
                bloodPressure: { systolic: "116", diastolic: "76" },
                log: [`Vitamin D, 2000 IU, Morning`, `Water: 40 oz / 64 oz`, `Weight: 153 lbs, Morning`, `Steps: 7000 / 10000, Afternoon`, `Blood Pressure: 116/76 mmHg, Afternoon`, `Meal: Coffee, ~5 kcal, Morning`, `Exercise: Swimming, Afternoon`, `Mood: Energetic, Morning`, `Symptom: Headache, Evening`],
                exercises: ["Swimming"],
                stepsLog: [{ steps: 3000, time: "2025-03-05T08:00:00" }, { steps: 4000, time: "2025-03-05T14:00:00" }],
                moods: [{ mood: "Energetic", time: "2025-03-05T08:00:00" }],
                symptoms: [{ symptom: "Headache", time: "2025-03-05T10:00:00" }]
            },
            "2025-03-06": {
                steps: 8500,
                water: 56,
                weight: "152",
                bloodPressure: { systolic: "119", diastolic: "79" },
                log: [`Losartan, 50 mg, Morning`, `Water: 56 oz / 64 oz`, `Weight: 152 lbs, Morning`, `Steps: 8500 / 10000, Afternoon`, `Blood Pressure: 119/79 mmHg, Afternoon`, `Meal: Oatmeal, ~150 kcal, Morning`, `Exercise: Jiu Jitsu, Evening`, `Mood: Happy, Afternoon`],
                exercises: ["Jiu Jitsu"],
                stepsLog: [{ steps: 4500, time: "2025-03-06T09:00:00" }, { steps: 4000, time: "2025-03-06T15:00:00" }],
                moods: [{ mood: "Happy", time: "2025-03-06T09:00:00" }],
                symptoms: []
            },
            "2025-03-07": {
                steps: 8000,
                water: 48,
                weight: "152",
                bloodPressure: { systolic: "118", diastolic: "78" },
                log: [`Vitamin D, 2000 IU, Morning`, `Water: 48 oz / 64 oz`, `Weight: 152 lbs, Morning`, `Steps: 8000 / 10000, Afternoon`, `Blood Pressure: 118/78 mmHg, Afternoon`, `Meal: Oatmeal, ~150 kcal, Morning`, `Exercise: Jiu Jitsu, Evening`, `Mood: Happy, Morning`, `Mood: Tired, Evening`],
                exercises: ["Jiu Jitsu"],
                stepsLog: [{ steps: 5000, time: "2025-03-07T10:00:00" }, { steps: 3000, time: "2025-03-07T16:00:00" }],
                moods: [{ mood: "Happy", time: "2025-03-07T10:00:00" }, { mood: "Tired", time: "2025-03-07T16:00:00" }],
                symptoms: []
            },
            "2025-03-08": {
                steps: 6000,
                water: 32,
                weight: "151",
                bloodPressure: { systolic: "120", diastolic: "80" },
                log: [`Losartan, 50 mg, Morning`, `Water: 32 oz / 64 oz`, `Weight: 151 lbs, Morning`, `Steps: 6000 / 10000, Afternoon`, `Blood Pressure: 120/80 mmHg, Afternoon`, `Meal: Mixed Fruit, ~180 kcal, Morning`, `Exercise: Mountain Biking, Afternoon`, `Mood: Calm, Afternoon`, `Symptom: Back Pain, Evening`],
                exercises: ["Mountain Biking"],
                stepsLog: [{ steps: 2000, time: "2025-03-08T11:00:00" }, { steps: 4000, time: "2025-03-08T17:00:00" }],
                moods: [{ mood: "Calm", time: "2025-03-08T11:00:00" }],
                symptoms: [{ symptom: "Back Pain", time: "2025-03-08T17:00:00" }]
            },
            "2025-03-09": {
                steps: 5000,
                water: 16,
                weight: "150",
                bloodPressure: { systolic: "122", diastolic: "82" },
                log: [`Water: 16 oz / 64 oz`, `Weight: 150 lbs, Morning`, `Steps: 5000 / 10000, Afternoon`, `Blood Pressure: 122/82 mmHg, Afternoon`, `Meal: Coffee, ~5 kcal, Morning`, `Exercise: Jiu Jitsu, Evening`, `Mood: Anxious, Afternoon`],
                exercises: ["Jiu Jitsu"],
                stepsLog: [{ steps: 2000, time: "2025-03-09T08:00:00" }, { steps: 3000, time: "2025-03-09T14:00:00" }],
                moods: [{ mood: "Anxious", time: "2025-03-09T14:00:00" }],
                symptoms: []
            },
            [today]: { 
                steps: 0, 
                water: 0, 
                weight: null, 
                bloodPressure: null, 
                log: [], 
                exercises: [], 
                stepsLog: [], 
                moods: [], 
                symptoms: [] 
            }
        };
        Object.assign(userDailyData, sampleData);
        console.log('Sample data loaded:', JSON.stringify(userDailyData, null, 2));
        supplements = ["Vitamin D, 2000 IU", "Losartan, 50 mg"];
        foods = ["Oatmeal", "Mixed Fruit", "Coffee"];
        await saveData();
        console.log('Reloading page...');
        location.reload();
    });

    resetDataBtn.addEventListener('click', async () => {
        console.log('Resetting data...');
        userDailyData = { [today]: { 
            steps: 0, 
            water: 0, 
            weight: null, 
            bloodPressure: null, 
            log: [], 
            exercises: [], 
            stepsLog: [], 
            moods: [], 
            symptoms: [] 
        }};
        supplements = [];
        foods = [];
        await saveData();
        console.log('Data reset and saved, reloading page...');
        location.reload();
    });

    saveDataBtn.addEventListener('click', () => {
        console.log('Saving data to file...');
        const dataStr = JSON.stringify(userDailyData);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthsync_data_${today}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    loadDataBtn.addEventListener('click', () => {
        console.log('Triggering file load...');
        document.getElementById('loadDataInput').click();
    });

    document.getElementById('loadDataInput').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Loading data from file:', file.name);
            const reader = new FileReader();
            reader.onload = async (e) => {
                userDailyData = JSON.parse(e.target.result);
                await saveData();
                location.reload();
            };
            reader.readAsText(file);
        }
    });
});