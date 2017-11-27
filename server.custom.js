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
    if (i != "host" && i != "x-forwarded-proto" && i != "x-forwarded-port" && i != "x-region" && i != "x-forwarded-for" && i != "connection")
      headers[i] = request.headers[i];
  }
  
  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log('req body', body);
    // at this point, `body` has the entire request body stored in it as a string
  });
  
  //var httpRequest = function (params, postData) {
  //  return new Promise(function(resolve, reject) {
  //    var req = http.request(params, function(res) {
  //      console.log('my statusCode=' + res.statusCode);
  //      console.log('res=' + res);
  //      // reject on bad status
  //      if (res.statusCode < 200 || res.statusCode >= 300) {
  //        return reject(new Error('statusCode=' + res.statusCode));
  //      }
  //    });
  //    // IMPORTANT
  //    req.end();
  //  });
  //}
  //
  //
  //var params = {
  //  host: 'php-bitrix-unix-voron.c9users.io',
  //  //port: 4000,
  //  method: request.method,
  //  headers: request.headers
  //};
  // this is a get, so there's no post data
  
  //httpRequest(params).then(function(body) {
  //  console.log('then: ',body);
  //});
  
  
  
  var newRequest = http.request({
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
  
  console.log('1');
  
  //response.writeHead(200, {"Content-Type": "text/html"});
  //var d = new Date();
  //response.write("success\nPHPSESSID\n238a0ab1b66143826e13e5072ea6c1bc\nsessid=16f6f901e780ab7c526aed8b452e42b6\ntimestamp=" + d.getTime());
  //response.end();
});
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  //console.log("Chat server listening at", addr.address + ":" + addr.port);
});
