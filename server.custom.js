//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var https = require('https');
var Promise = require("promise");


var server = http.createServer(function(request, response) {
  //console.log(request);
  console.log('url', request.url);
  console.log('method', request.method);
  var headers = {};
  for(var i in request.headers){
    console.log(i + ': ' + request.headers[i]);
    // i think this is the list of all default headers the don't need to be maanged and may render the request inval
    if (i != "host" && i != "x-forwarded-proto" && i != "x-forwarded-port" && i != "x-region" && i != "x-forwarded-for" && i != "connection")
      headers[i] = request.headers[i];
  }
  
  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    // write request body into console
    console.log('req body', body);
  });
  
  
  var newRequest = http.request({
    // server to connect to
    hostname: "php-bitrix-unix-voron.c9users.io",
    path: request.url,
    method: request.method,
    headers: headers
    }, function(newResponse) {

      console.log(newResponse.headers["content-type"]);
      response.writeHead(newResponse.statusCode, newResponse.headers["content-type"]);
      newResponse.on('data', function (chunk) {
        
        response.write(chunk);
        response.end();
        console.log('BODY: ' + chunk);
      });
      console.log("Server responded with status code", newResponse.statusCode);
      console.log("Server responded with headers: ", newResponse.headers);
      
    });
  newRequest.end();
  
});
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  //console.log("Chat server listening at", addr.address + ":" + addr.port);
});
