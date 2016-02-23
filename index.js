var expect = require('chai').expect;

var SocketTester = function(io, socketUrl, socketOptions){
  this.io = io;
  this.socketUrl = socketUrl;
  this.socketOptions = socketOptions;
  this.connections = [];
  this.testConditions = [];
};

SocketTester.prototype.run = function(clients, done){

  var self = this;

  var sub = function(clients, idx){

    var client = clients[idx++];
    var conn = self.io.connect(self.socketUrl, self.socketOptions);

    self.connections.push({connection: conn, emit: client.emit});

    if(client.on){
      for(var event in client.on){
        conn.on(event, client.on[event]);
      }
    }

    conn.on('connect', function(){
      if(idx === clients.length){

        self.connections.forEach(function(conn){
          for(var event in conn.emit){
            conn.connection.emit(event, conn.emit[event]);
          }
        });

      } else {
        sub(clients, idx);
      }
    });
  };
  sub(clients, 0);

  if(done){
    setTimeout(function(){
      self.testConditions.forEach(function(test){
        test();
      });
      done();
    }, 50);
  }
};

SocketTester.prototype.shouldBeCalledNTimes = function(n){
  var count = 0;

  this.testConditions.push(function(){
    expect(count).to.equal(n);
  });

  return function(){
    count++;
  }
};

SocketTester.prototype.shouldBeCalledNTimesWithResults = function(expected){
  var count = 0;

  return function(actual){
    if(count < expected.length){
      expect(actual).to.equal(expected[count]);
    } else {
      expect(count).to.equal(expected.length);
    }
    count++;
  }
};

SocketTester.prototype.shouldNotBeCalled = function(){
  return function(){
    expect('function was called').to.equal('function should not be called');
  }
};

SocketTester.prototype.clearConnections = function(){
  this.connections.forEach(function(conn){
    conn.connection.disconnect();
  });
};

module.exports = SocketTester;