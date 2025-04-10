const verstappenNumber = 1; // Max Verstappen's driver number
const sessionKey = '7953'; // Use 'latest' for the most recent session

async function fetchAllData() {
    try {
        await Promise.all([
            fetchGap(),
            fetchPosition(),
            fetchLapTimes(),
            fetchTyres(),
            fetchPitStop(),
            fetchRadio()
        ]);
    } catch (err) {
        console.error('Error fetching F1 data:', err);
    }
}

// 1. Gap to leader & interval
async function fetchGap() {
    const res = await fetch(`https://api.openf1.org/v1/intervals?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const data = await res.json();
    if (data.length > 0) {
        const latest = data[data.length - 1];
        document.getElementById('gapToLeader').textContent = latest.gap_to_leader?.toFixed(1) ?? 'N/A';
        document.getElementById('intervalToAhead').textContent = latest.interval_to_car_ahead?.toFixed(1) ?? 'N/A';
    }
}

// 2. Position
async function fetchPosition() {
    const res = await fetch(`https://api.openf1.org/v1/position?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const data = await res.json();
    if (data.length > 0) {
        const latest = data[data.length - 1];
        document.getElementById('currentPosition').textContent = latest.position || 'N/A';
    }
}

// 3. Lap times
async function fetchLapTimes() {
    const res = await fetch(`https://api.openf1.org/v1/laps?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const data = await res.json();
    const len = data.length;

    if (len >= 2) {
        const latest = data[len - 1];
        const previous = data[len - 2];
        
        document.getElementById('lapTime').textContent = latest.lap_duration?.toFixed(3) ?? 'N/A';
        document.getElementById('prevLapTime').textContent = previous.lap_duration?.toFixed(3) ?? 'N/A';
        
        document.getElementById('sector1').textContent = latest.duration_sector_1?.toFixed(3) ?? 'N/A';
        document.getElementById('sector2').textContent = latest.duration_sector_2?.toFixed(3) ?? 'N/A';
        document.getElementById('sector3').textContent = latest.duration_sector_3?.toFixed(3) ?? 'N/A';
        
    } else {
        document.getElementById('lapTime').textContent = 'Not yet';
        document.getElementById('prevLapTime').textContent = 'Not yet';
    }
}


// 4. Tyres / stints
async function fetchTyres() {
    const res = await fetch(`https://api.openf1.org/v1/stints?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const data = await res.json();
    if (data.length > 0) {
        const latest = data[data.length - 1];
        document.getElementById('tyreCompound').textContent = latest.compound || 'N/A';
        document.getElementById('stintLength').textContent = latest.laps_completed || 'N/A';
    }
}

// 5. Pit stops
async function fetchPitStop() {
    const res = await fetch(`https://api.openf1.org/v1/pit?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const data = await res.json();
    if (data.length > 0) {
        const latest = data[data.length - 1];
        document.getElementById('pitDuration').textContent = latest.pit_duration ? latest.pit_duration.toFixed(2) : 'N/A';
    }
}

// 6. Radio
async function fetchRadio() {
    const res = await fetch(`https://api.openf1.org/v1/team_radio?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const data = await res.json();
    if (data.length > 0) {
        const latest = data[data.length - 1];
        const audio = latest.audio || 'No recent radio';
        document.getElementById('radioMessage').textContent = audio;
    }
}

// Fetch data initially and then every 5 seconds
fetchAllData();
setInterval(fetchAllData, 5000);
