var http = require('http');

var server = http.createServer(function(request, response) {
  if (request.url.indexOf('/bitrix/admin/1c_exchange.php') == -1){
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<h1>There is nothing here!</h1><p>go fuck yourself</p>");
    response.end();
  }else{
    var query = request.url.substr(request.url.indexOf('?')+1, request.url.length-request.url.indexOf('?')+1).split('&');
    var queryObj = {};
    for (var i=0;i<query.length;i++)
      queryObj[query[i].split("=")[0]] = query[i].split("=")[1];
    if (queryObj['type'] == 'catalog' && queryObj['mode'] == 'checkauth'){
      var buf = new Buffer(request.headers['authorization'].split(' ')[1], 'base64');
      if (buf.toString() == "admin:admin0"){
        response.writeHead(200, {"Content-Type": "text/html; charset=windows-1251"});
        var d = new Date();
        response.write('success\ntimestamp=' + d.getTime());
        response.end();
      }else{
        response.writeHead(502, {"Content-Type": "text/html; charset=windows-1251"});
        response.write('hui');
        response.end();
      }
    }
  }
});
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  //console.log("Chat server listening at", addr.address + ":" + addr.port);
});
