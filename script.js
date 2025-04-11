const verstappenNumber = 1; // Max Verstappen's driver number
const sessionKey = '9159'; // Use 'latest' for the most recent session

let lastUpdated = null;

// Monkey patch for testing ---------------------------------
const useMockData = true;

if (useMockData) {
  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    console.log("🔁 Intercepted fetch:", url);

    const base = url.split('?')[0]; // Strip query for consistent match
    const cacheBust = `?t=${Date.now()}`;

    if (base.includes("intervals")) return originalFetch("mock-data/intervals.json" + cacheBust);
    if (base.includes("position")) return originalFetch("mock-data/position.json" + cacheBust);
    if (base.includes("laps")) return originalFetch("mock-data/laps.json" + cacheBust);
    if (base.includes("stints")) return originalFetch("mock-data/stints.json" + cacheBust);

    return originalFetch(url, options);
  };
}
// -----------------------------------------------------------

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
function formatLapTime(seconds) {
  if (typeof seconds !== 'number') return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${secs}`;
}

async function fetchLapTimes() {
  const res = await fetch(`https://api.openf1.org/v1/laps?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
  const data = await res.json();

  const len = data.length;
  if (len >= 2) {
    const latest = data[len - 1];
    const previous = data[len - 2];

    const latestLapTime = latest.lap_duration;
    const previousLapTime = previous.lap_duration;

    document.getElementById('lapTime').textContent = formatLapTime(latestLapTime);

    if (latestLapTime != null && previousLapTime != null) {
      const delta = latestLapTime - previousLapTime;
      const deltaFormatted = `${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(3)} s`;

      const deltaElement = document.getElementById('lapDelta');
      deltaElement.textContent = deltaFormatted;
      deltaElement.style.color = delta < 0 ? 'green' : (delta > 0 ? 'red' : 'white');
    } else {
      document.getElementById('lapDelta').textContent = 'N/A';
    }

  } else {
    document.getElementById('lapTime').textContent = 'N/A';
    document.getElementById('lapDelta').textContent = 'N/A';
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

// ✅ Initial fetch once
fetchGap();
fetchPosition();
fetchLapTimes();
fetchTyres();
lastUpdated = new Date();

// ✅ Individual polling intervals
setInterval(fetchGap, 6000);  
setInterval(fetchPosition, 6000);
setInterval(fetchLapTimes, 6000);
setInterval(fetchTyres, 6000);
