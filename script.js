// Ersetzen Sie die URL durch Ihren tatsächlichen API-Endpunkt
//const apiUrl = 'https://api.openf1.org/v1/car_data?driver_number=55&session_key=9159&date>'; //TEST
const apiUrl = 'https://api.openf1.org/v1/car_data?driver_number=1&session_key=latest&date>'; //LIVE

//Ersetzen Sie die URL durch Ihren tatsächlichen API-Endpunkt
//const apiUrlInterval = 'https://api.openf1.org/v1/intervals?session_key=9165&driver_number=1&date>'; //TEST
const apiUrlInterval = 'https://api.openf1.org/v1/intervals?session_key=latest&driver_number=1&date>'; //LIVE

//Ersetzen Sie die URL durch Ihren tatsächlichen API-Endpunkt
const apiUrlLapDuration = 'https://api.openf1.org/v1/laps?session_key=latest&driver_number=1&date_start>'; //LIVE

//Ersätzen Sie die URL durch Ihren tatsächlichen API-Endpunkt
//let lastQueryTime = new Date('2023-09-16T13:03:04.650000+00:00'); // Startzeitpunkt TEST
let lastQueryTime = new Date(); // Setzt lastQueryTime auf die aktuelle Zeit LIVE

function fetchData() {
    // Formatieren Sie das Datum in ISO 8601 Format und fügen Sie es zur URL hinzu
    const url = `${apiUrl}${lastQueryTime.toISOString()}Z`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Keine Daten für diesen Zeitstempel gefunden');
            }
            return response.json();
        })
        .then(data => {
            const speed = data[0].speed;
            // Überprüfen Sie, ob die Geschwindigkeit nicht null oder undefiniert ist, bevor Sie die Anzeige aktualisieren
            if (speed != null) {
                console.log(`Speed: ${speed} km/h`);
                updateSpeed(speed);
            }
            // Aktualisieren Sie lastQueryTime mit dem neuesten Datum aus den Daten
            lastQueryTime = new Date(data[data.length - 1].date);
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}

function fetchInterval() {
    // Formatieren Sie das Datum in ISO 8601 Format und fügen Sie es zur URL hinzu
    //const url = `${apiUrlInterval}${lastQueryTime.toISOString()}Z`;
    //const url = 'https://api.openf1.org/v1/intervals?session_key=9165&driver_number=1&date=2023-09-17T13:31:02.395000+00:00';//test
    const url = `${apiUrlInterval}${lastQueryTime.toISOString()}Z`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Keine Daten für diesen Zeitstempel gefunden');
            }
            return response.json();
        })
        .then(data => {
            const interval = data[0].interval;
            // Überprüfen Sie, ob die Geschwindigkeit nicht null oder undefiniert ist, bevor Sie die Anzeige aktualisieren
            if (interval != null) {
                console.log(`Interval: ${interval} km/h`);
                updateInterval(interval);
            }
            // Aktualisieren Sie lastQueryTime mit dem neuesten Datum aus den Daten
            lastQueryTime = new Date(data[0].date);
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}

function fetchLap() {
    // Formatieren Sie das Datum in ISO 8601 Format und fügen Sie es zur URL hinzu
    //const url = 'https://api.openf1.org/v1/laps?session_key=9161&driver_number=1&date_start=2023-09-16T13:03:04.650000+00:00'; //test
    const url = `${apiUrlLapDuration}${lastQueryTime.toISOString()}Z`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Keine Daten für diesen Zeitstempel gefunden');
            }
            return response.json();
        })
        .then(data => {
            const lap = data[0].lap_duration;
            // Überprüfen Sie, ob die Geschwindigkeit nicht null oder undefiniert ist, bevor Sie die Anzeige aktualisieren
            if (lap != null) {
                console.log(`Lap: ${lap} min`);
                updateLap(lap);
            }
            // Aktualisieren Sie lastQueryTime mit dem neuesten Datum aus den Daten
            lastQueryTime = new Date(data[0].date_start);
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}
