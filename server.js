//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var fs = require("fs");
var utf8 = require('utf8');
var parseString = require('xml2js').parseString;
var builder = require('xmlbuilder');
var iconv = require("iconv");
var MyBuffer = require('buffer').Buffer;


var server = http.createServer(function(request, response) {
  //console.log(request);
  console.log('url', request.url);
  console.log('method', request.method);
  var headers = {};
  for(var i in request.headers){
    console.log(i + ': ' + request.headers[i]);
    if (i != "host" && i != "x-forwarded-proto" && i != "x-forwarded-port" && i != "x-region" && i != "x-forwarded-for" && i != "connection")
      headers[i] = request.headers[i];
    if (i == 'authorization'){
      var tmp = request.headers[i].split(' ');
      var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
      var plain_auth = buf.toString();        // read it back out as a string
      console.log("Decoded Authorization ", plain_auth);
    }
  }
  
  let body = [];
  request.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log('req body', body);
    // at this point, `body` has the entire request body stored in it as a string
  });
  

  
  var newRequest = http.request({
    hostname: "php-bitrix-unix-voron.c9users.io",
    path: request.url,
    method: request.method,
    headers: headers
    }, function(newResponse) {
      //var iconv = new Iconv('windows-1251', 'utf-8');
      //body = new Buffer(body, 'binary');
      //  conv = new iconv.Iconv('windows-1251', 'utf8');
      //  body = conv.convert(body).toString();
      console.log('content type', typeof newResponse.headers["content-type"]);
      response.writeHead(newResponse.statusCode, newResponse.headers["content-type"]);
      newResponse.on('data', function (chunk) {
        if (newResponse.headers["content-type"] == "application/xml; charset=windows-1251"){
          var body = new Buffer(chunk, 'binary');
          var conv = new iconv.Iconv('windows-1251', 'utf8');
          var back = new iconv.Iconv('utf8', 'windows-1251');
          var d = new Date();
          fs.appendFileSync('log/' + d.getDate() + '.' + (d.getMonth()+1) + '.xml', conv.convert(body).toString());
          
          var backBody = new Buffer(conv.convert(body), 'binary');
          //response.write(back.convert(conv.convert(body)));
          console.log(back.convert(conv.convert(body)));
          console.log(builder.create(back.convert(conv.convert(body))));
          //console.log(back.convert(conv.convert(body)).toString());
          //
          //
          
          
        }else{
          console.log('BODY: ' + chunk);
        }
        response.write(chunk);
        response.end();
        //console.log('xml parser: ')
        //parseString(chunk, function (err, result) {
        //  if (typeof JSON.stringify(result) == 'string'){
        //    //var iconv = new Iconv('windows-1251', 'UTF-8');
        //    //var buffer = iconv.convert('Hello, world!');
        //    //var buffer2 = iconv.convert(new Buffer('Hello, world!'));
        //    var body = new Buffer(chunk, 'binary');
        //    var conv = new iconv.Iconv('windows-1251', 'utf8');
        //    console.log(typeof conv.convert(body));
        //    console.log(conv.convert(body).toString());
        //    console.log(utf8.encode(JSON.stringify(result)));
        //  }
        //});
        
        //console.log('utf8: ', utf8.decode(chunk));
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
