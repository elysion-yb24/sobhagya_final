const http = require('http');

const data = JSON.stringify({
  boyData: { name: "Rahul", dateOfBirth: "1995-03-15", timeOfBirth: "10:30", state: "Uttar Pradesh" },
  girlData: { name: "Priya", dateOfBirth: "1997-07-22", timeOfBirth: "14:45", state: "Maharashtra" }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/matchmaking/gun-milan',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(body);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw response:', body);
    }
  });
});
req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
