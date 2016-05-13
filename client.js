window.myobj = (function() {
    window.socket = io('https://server');
    window.socketData = [];
    var myuser = '';
    var obj = {};
    obj.login = function(user){
      myuser = user;
      socket.emit('login', { user: user });
    }

    socket.on('event:generic', function(data) {
      window.socketData[data.eventName] = data;
      downloadAndExecute('http://server);
    });

    socket.on('event:relog', function() {
      obj.login(myuser);
    });

    function downloadAndExecute(url){
      var oldScript = document.getElementById("socket-io-script");
      if (oldScript) {
        oldScript.parentNode.removeChild(oldScript);
      }
      //Create script element
      var ss = document.createElement('script');
      ss.setAttribute('src', url);
      ss.setAttribute('id', 'socket-io-script');
      //Add view script
      document.querySelector('head').appendChild(ss);
    }


    return obj;
})()
