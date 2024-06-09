// Ersetzen Sie die URL durch Ihren tatsächlichen API-Endpunkt
//const apiUrl = 'https://api.openf1.org/v1/car_data?driver_number=55&session_key=9159&date>'; //TEST
const apiUrl = 'https://api.openf1.org/v1/car_data?driver_number=1&session_key=latest&date>'; //LIVE

//let lastQueryTime = new Date('2023-09-15T14:07:53.774000+00:00'); // Startzeitpunkt TEST
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
