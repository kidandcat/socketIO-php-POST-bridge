var io = require('socket.io')(9090);
var fs = require('fs');
var LineByLineReader = require('line-by-line');
var http = require('http');


var CLIENT = '/var/www/socket.js';
var SCRIPTS = '/var/www/scripts/';
var USER = [];

io.on('connect', function(socket) {
    socket.on('Manager::createEvent', function(data) {
        console.log('Manager::createEvent');
        writeScript(data.name, data.code);
    });
    socket.on('Manager::deleteEvent', function(data) {
        console.log('Manager::deleteEvent');
        deleteScript(data.name);
    });
    socket.on('Manager::listEvents', function(data) {
        console.log('Manager::listEvents');
        list(socket);
    });

    socket.on('Manager::codeEvent', function(data){
      console.log('Manager::codeEvent');
      code(data.name, socket);
    })

    socket.on('Manager::users', function(data){
      console.log('Manager::users');
      users(socket);
    })

    socket.on('login', function(data){
      console.log('client logged: ' + data.user);
      socket.username = data.user;
      USER[data.user] = socket;
      users(socket.broadcast);
    })

    socket.on('event:generic', function(data) {
        console.log(data);
        if (data.broadcast) {
            socket.broadcast.emit('event:generic', data);
        } else if (data.username) {
            USER[data.username].emit('event:generic', data);
        }
    });
    socket.on('disconnect', function(){
      try{
        USER[socket.username] = null;
        delete USER[socket.username];
        console.log('User ' + socket.username + ' disconnected.');
        users(socket.broadcast);
      }catch(e){
        console.log('No user found on disconnect.');
      }
    });
});

setTimeout(function(){
  io.sockets.emit('event:relog');
}, 3000);


function writeScript(name, code) {
    fs.writeFile(SCRIPTS + name + '.js', code);
}

function deleteScript(name, code) {
    fs.unlink(SCRIPTS + name + '.js');
}

function code(name, socket) {
  fs.readFile(SCRIPTS + name + '.js', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  socket.emit('Return::codeEvent', { name: name, code: data });
  });
}

function list(socket){
  fs.readdir(SCRIPTS, function(err, filenames) {
    socket.emit('Return::listEvents', filenames);
  });
}

function users(socket){
  var users = [];
  setTimeout(function(){
    for (var key in USER) {
        if (key === 'length' || !USER.hasOwnProperty(key)) continue;
        users.push(key);
    }
    socket.emit('Return::users', users);
  }, 3000)
}

var example = {
    "username": "username or",
    "broadcast": "true",
    "data": {
        "eventName": "name of your event",
        "custom-data": "whatever"
    },
    "Your_data_will_be_accesible_in": "window.socketData[eventName]"
}

var server = http.createServer(function(req, res) {
    console.log('----------------   New Req   ---------------------');
    if (req.method == 'POST') {
        console.log("POST");
        var body = '';
        req.on('data', function(data) {
            body += data;
        });
        req.on('end', function() {
            console.log('body: ', body);
            try {
                var data = JSON.parse(body);
                if (data.data.eventName && (data.username || data.broadcast)) {
                    if (data.broadcast) {
                        io.sockets.emit('event:generic', data.data);
                        res.end(JSON.stringify({
                            msg: 'Event sent to all users'
                        }));
                    } else if (USER[data.username]) {
                        USER[data.username].emit('event:generic', data.data);
                        res.end(JSON.stringify({
                            msg: 'Event sent to ' + data.username
                        }));
                    } else {
                        res.end(JSON.stringify({
                            msg: 'User not online'
                        }));
                    }
                } else {
                  if(!data.data.eventName){
                    res.end(JSON.stringify({
                        error: 'Error missing eventName: ',
                        example: example
                    }));
                  }else if(!(data.username || data.broadcast)){
                    res.end(JSON.stringify({
                        error: 'Error missing Username or Broadcast: ',
                        example: example
                    }));
                  }

                }
            } catch (e) {
                res.end(JSON.stringify({
                    error: 'Error parsing data: ',
                    data: body
                }));
            }
        });
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
    }
});

var port = 8000;
var host = '0.0.0.0';
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);



