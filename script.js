const verstappenNumber = 1; // Max Verstappen's driver number
const sessionKey = '7953'; // Use 'latest' for the most recent session

async function fetchAllData() {
    try {
        await Promise.all([
            fetchGap(),
            fetchPosition(),
            fetchLapTimes(),
            fetchTyres()
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
        const gap = latest.gap_to_leader === null ? 0 : latest.gap_to_leader;
        const interval = latest.interval === null ? 0 : latest.interval;

        document.getElementById('gapToLeader').textContent = gap.toFixed(1);
        document.getElementById('intervalToAhead').textContent = interval.toFixed(1);
    } else {
        document.getElementById('gapToLeader').textContent = 'N/A';
        document.getElementById('intervalToAhead').textContent = 'N/A';
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
    const resStints = await fetch(`https://api.openf1.org/v1/stints?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const stintData = await resStints.json();
    const resLaps = await fetch(`https://api.openf1.org/v1/laps?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
    const lapData = await resLaps.json();

    if (stintData.length > 0 && lapData.length > 0) {
        const latestStint = stintData[stintData.length - 1];
        const currentLap = lapData[lapData.length - 1].lap_number;

        document.getElementById('tyreCompound').textContent = latestStint.compound;

        const stintLaps = (currentLap - latestStint.lap_start + latestStint.tyre_age_at_start);
        document.getElementById('stintLength').textContent = stintLaps;
    } else {
        document.getElementById('tyreCompound').textContent = 'N/A';
        document.getElementById('stintLength').textContent = 'N/A';
    }
}

// Fetch data initially and then every 5 seconds
fetchAllData();
setInterval(fetchAllData, 5000);
