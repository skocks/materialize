const http = require('http');
const express = require('express');

const app = express();
const server = http.Server(app);

app.use(express.static('./coverage'));

server.listen(8181, function () {
  console.log('Coverage served on port 8181.');
});
