window.socketAdmin = (function() {
    window.socket = io('https://server');
    var obj = {};
    obj.scripts = null;


    obj.createEvent = function(name, code){
      socket.emit('Manager::createEvent', {
        name: name,
        code: code
      })
      setTimeout(obj.list, 1000);
    }

    obj.deleteEvent = function(name){
      socket.emit('Manager::deleteEvent', {
        name: name
      });
      setTimeout(obj.list, 1000);
    }

    obj.getCode = function(name){
      socket.emit('Manager::codeEvent', {
        name: name
      });
    }

    obj.users = function(){
      socket.emit('Manager::users');
    }

    socket.on('Return::users', function(data){
      console.log(data);
      var users = document.querySelector('.users');
      users.innerHTML = '';
      data.forEach(function(e){
        if(e != 'undefined'){
          users.innerHTML += '<span class="username">' + e + '</span>';
        }
      });
    })

    socket.on('Return::codeEvent', function(data){
      console.log(data);
      editor.session.setValue(data.code);
      document.querySelector('.name').value = data.name;
    })

    obj.list = function(){
      socket.emit('Manager::listEvents');
    }

    obj.list();
    obj.users();

    socket.on('Return::listEvents', function(data){
      obj.scripts = data;
      var list = document.querySelector('.list');
      list.innerHTML = '';
      data.forEach(function(e){
        list.innerHTML += '<span class="event">' + e + '</span>' + '<button onclick="socketAdmin.deleteEvent(\'' + e.split('.js')[0] + '\')" class="btnDelete">X</button>';
      });
      var x = document.querySelectorAll('.event');
      for(var i=0;i<x.length;i++){
        x[i].addEventListener('click', function(){
          socketAdmin.getCode(this.innerHTML.split('.js')[0]);
        });
      }
    })

    return obj;
})()
