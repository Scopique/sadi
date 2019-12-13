var http = require('http');

http.createServer(function (req, res) {
  res.write("Server online!");
  res.end();
}).listen(8080);