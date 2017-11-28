var http = require('http');
var fs = require("fs");
var utf8 = require('utf8');
var parseString = require('xml2js').parseString;
var builder = require('xmlbuilder');
var iconv = require("iconv");
var MyBuffer = require('buffer').Buffer;


var server = http.createServer(function(request, response) {
  var startDate = new Date();
  // append info to the log file when request started
  fs.appendFileSync(
    'log/' + startDate.getDate() + '.' + (startDate.getMonth()+1) + '.txt',
    '\n=================================================================================\n'+
    'Request'+
    '\nTime: ' + startDate.getHours() + '.' +  startDate.getMinutes() + '.' + startDate.getSeconds() + '\n'+
    '=================================================================================\n'+
    'URL: ' + request.url + '\nMethod: ' + request.method + '\nHeaders: {\n'
  );
  // get request's headers
  var headers = {};
  for(var i in request.headers){
    fs.appendFileSync(
      'log/' + startDate.getDate() + '.' + (startDate.getMonth()+1) + '.txt',
      "  " + i + ": " + request.headers[i] + '\n'
    );
    // exclude default headers the requires no managing
    if (i != "host" && i != "x-forwarded-proto" && i != "x-forwarded-port" && i != "x-region" && i != "x-forwarded-for" && i != "connection")
      headers[i] = request.headers[i];
    // write decoded login and password into the console
    if (i == 'authorization'){
      var tmp = request.headers[i].split(' ');
      var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
      var plain_auth = buf.toString();        // read it back out as a string
      console.log("Decoded Authorization: ", plain_auth);
    }
  }
  // close hearder's block after all headeres were logged
  fs.appendFileSync('log/' + startDate.getDate() + '.' + (startDate.getMonth()+1) + '.txt', '}\n');
  // create request on a custom server
  var newRequest = http.request(
    // request object
    {
      hostname: "php-bitrix-unix-voron.c9users.io",
      path: request.url,
      method: request.method,
      headers: headers
    },
    // manage responed from a custom server
    function(newResponse) {
      var endDate = new Date();
      // start logging response from the custom server
      fs.appendFileSync(
        'log/' + endDate.getDate() + '.' + (endDate.getMonth()+1) + '.txt',
        '\n=================================================================================\n'+
        'Response'+
        '\nTime: ' + endDate.getHours() + '.' +  endDate.getMinutes() + '.' + endDate.getSeconds() + '\n'+
        '=================================================================================\n'
      );
      // logging response's headers
      for (var header in newResponse.headers){
        fs.appendFileSync(
          'log/' + startDate.getDate() + '.' + (startDate.getMonth()+1) + '.txt',
          "  " + header + ": " + newResponse.headers[header] + '\n'
        );
      }
      // close block with headers
      fs.appendFileSync('log/' + startDate.getDate() + '.' + (startDate.getMonth()+1) + '.txt', '}\n');

      // create a custom header
      response.writeHead(newResponse.statusCode, newResponse.headers["content-type"]);

      // manage data from custom server
      newResponse.on('data', function (chunk) {
        var d = new Date();
        // create a xml file for incoming response
        if (newResponse.headers["content-type"] == "application/xml; charset=windows-1251"){
          var body = new Buffer(chunk, 'binary');
          var conv = new iconv.Iconv('windows-1251', 'utf8');
          fs.appendFileSync('log/' + d.getDate() + '.' + (d.getMonth()+1) + '.res.xml', conv.convert(body).toString());
        }else{
          // for none xml data check the data type if it is a string it will be written into xml file. for other types it is just logged into console
          typeof chunk == 'string' ? fs.appendFileSync('log/' + d.getDate() + '.' + (d.getMonth()+1) + '.res.xml', chunk) : console.log('BODY: ' + chunk, 'BODY type: ' + typeof chunk);
        }
        // send response from the custom server as response to the initial request
        response.write(chunk);
      }).on('end', function(){
        // close response block
        fs.appendFileSync(
          'log/' + endDate.getDate() + '.' + (endDate.getMonth()+1) + '.txt',
          '\n=================================================================================\n'+
          'Response End'+
          '\nTime: ' + endDate.getHours() + '.' +  endDate.getMinutes() + '.' + endDate.getSeconds() + '\n'+
          '=================================================================================\n'
        );
        // manage response
        response.end();
      });
    });
  
  // manage request data
  request.on('data', (chunk) => {
    // transforme incoming request data into binary state 
    var body = new Buffer(chunk, 'binary');
    // if it isn't a file (most likily if it is a file the filetype is archive)
    if (request.headers['content-type'] != "application/octet-stream"){
      // change data codding from windows-1251 to utf8
      var conv = new iconv.Iconv('windows-1251', 'utf8');
      var d = new Date();
      // write data into a file
      fs.appendFileSync('log/' + d.getDate() + '.' + (d.getMonth()+1) + '.req.xml', conv.convert(body).toString());
      // also log data into console
      console.log('request data: ', chunk, 'data type: ', typeof chunk);
    // in case the incomign data is a file
    }else{
      // find out file name from request url
      var name = request.url.substr(request.url.indexOf('filename=') + 9, request.url.length - (request.url.indexOf('filename=') + 9));
      // save data into a file with an appropriate name
      fs.appendFileSync('log/' + name, body, 'binary');
    }
    // send data into custom server
    newRequest.write(chunk);
  }).on('end', () => {
    // close request block
    fs.appendFileSync(
      'log/' + startDate.getDate() + '.' + (startDate.getMonth()+1) + '.txt',
      '\n=================================================================================\n'+
      'Request End'+
      '\nTime: ' + startDate.getHours() + '.' +  startDate.getMinutes() + '.' + startDate.getSeconds() + '\n'+
      '=================================================================================\n'
    );
    // manage request to a custom server
    newRequest.end();
  });
  
  
});
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  //console.log("Chat server listening at", addr.address + ":" + addr.port);
});
