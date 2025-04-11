
const verstappenNumber = 1;
const sessionKey = '9159';

const useMockData = false;

if (useMockData) {
  const originalFetch = window.fetch;
  window.fetch = async (url, options) => {
    const base = url.split('?')[0];
    const cacheBust = `?t=${Date.now()}`;
    if (base.includes("intervals")) return originalFetch("mock-data/intervals.json" + cacheBust);
    if (base.includes("position")) return originalFetch("mock-data/position.json" + cacheBust);
    if (base.includes("laps")) return originalFetch("mock-data/laps.json" + cacheBust);
    if (base.includes("stints")) return originalFetch("mock-data/stints.json" + cacheBust);
    throw new Error("Unmocked fetch call attempted: " + url);
  };
}

function animateValue(id, newValue) {
  const el = document.getElementById(id);
  if (!el || el.innerText === newValue) return;

  // Wait briefly, then apply both value and animation together
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.innerText = newValue;
      el.classList.add("glow");
      setTimeout(() => el.classList.remove("glow"), 300);
    }, 50);
  });
}

function getISOTimeSecondsAgo(seconds) {
  const d = new Date(Date.now() - seconds * 1000);
  return d.toISOString();
}

async function fetchGap() {
  const since = getISOTimeSecondsAgo(10);
  const res = await fetch(`https://api.openf1.org/v1/intervals?driver_number=${verstappenNumber}&session_key=${sessionKey}&date>${since}`);
  const data = await res.json();
  if (data.length > 0) {
    const latest = data[data.length - 1];
    if (latest.gap_to_leader != null) animateValue('gapToLeader', latest.gap_to_leader.toFixed(1));
    if (latest.interval != null) animateValue('intervalToAhead', latest.interval.toFixed(1));
  }
}

async function fetchPosition() {
  const res = await fetch(`https://api.openf1.org/v1/position?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
  const data = await res.json();
  if (data.length > 0) {
    const latest = data[data.length - 1];
    if (latest.position != null) animateValue('currentPosition', latest.position.toString());
  }
}

function formatLapTime(seconds) {
  if (typeof seconds !== 'number') return null;
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

    const formatted = formatLapTime(latest.lap_duration);
    if (formatted) document.getElementById('lapTime').textContent = formatted;

    if (latest.lap_duration != null && previous.lap_duration != null) {
      const delta = latest.lap_duration - previous.lap_duration;
      const deltaFormatted = `${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(3)} s`;
      const el = document.getElementById('lapDelta');
      if (el.innerText !== deltaFormatted) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            el.innerText = deltaFormatted;
            el.classList.add("glow");
            setTimeout(() => el.classList.remove("glow"), 300);
          }, 50);
        });
        el.style.color = delta < 0 ? 'green' : (delta > 0 ? 'red' : 'white');
      }
    }
  }
}

async function fetchTyres() {
  const resStints = await fetch(`https://api.openf1.org/v1/stints?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
  const stintData = await resStints.json();
  const resLaps = await fetch(`https://api.openf1.org/v1/laps?driver_number=${verstappenNumber}&session_key=${sessionKey}`);
  const lapData = await resLaps.json();

  if (stintData.length > 0 && lapData.length > 0) {
    const latestStint = stintData[stintData.length - 1];
    const currentLap = lapData[lapData.length - 1].lap_number;

    if (latestStint.compound) animateValue('tyreCompound', latestStint.compound);

    const stintLaps = currentLap - latestStint.lap_start + latestStint.tyre_age_at_start;
    animateValue('stintLength', stintLaps.toString());
  }
}

fetchGap();
fetchPosition();
fetchLapTimes();
fetchTyres();

setInterval(fetchGap, 6000);
setInterval(fetchPosition, 6000);
setInterval(fetchLapTimes, 6000);
setInterval(fetchTyres, 6000);