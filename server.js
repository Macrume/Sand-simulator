const http = require('http');
const fs = require('fs');
const path = require('path');

// Sprawdzanie, czy podano odpowiednią liczbę argumentów
if (process.argv.length !== 4) {
  console.log('Użycie: node serveHtml.js <ścieżka do index.html> <port>');
  process.exit(1);
}

// Przechwytywanie ścieżki do pliku i portu z argumentów
const filePath = path.resolve(process.argv[2]);
const port = parseInt(process.argv[3], 10);

// Tworzenie serwera
const server = http.createServer((req, res) => {
  // Odczytanie pliku index.html
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Błąd serwera: Nie można odczytać pliku index.html');
      return;
    }
    // Wysyłanie danych
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Serwer został uruchomiony na porcie ${port}.`);
});
