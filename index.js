var expect = require('chai').expect;

var SocketTester = function(io, socketUrl, socketOptions){
  this.io = io;
  this.socketUrl = socketUrl;
  this.socketOptions = socketOptions;
  this.connections = [];
  this.testConditions = [];
  this.timeout = 25;
};

SocketTester.prototype.run = function(clients, done){

  var sub = function(clients, idx){

    var client = clients[idx++];
    var conn = this.io.connect(this.socketUrl, this.socketOptions);

    this.connections.push({connection: conn, emit: client.emit});

    if(client.on){
      for(var event in client.on){
        conn.on(event, client.on[event]);
      }
    }

    conn.on('connect', function(){
      if(idx === clients.length){

        this.connections.forEach(function(conn){
          for(var event in conn.emit){
            conn.connection.emit(event, conn.emit[event]);
          }
        }.bind(this));

      } else {
        sub.call(this, clients, idx);
      }
    }.bind(this));
  };

  sub.call(this, clients, 0);

  if(done){
    setTimeout(function(){
      this.testConditions.forEach(function(test){
        test();
      });
      this.clearConnections();
      done();
    }.bind(this), this.timeout);
  } else {
    this.clearConnections();
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

      if(typeof expected[count] === 'function'){
        expected[count](actual);
      } else if (typeof expected[count] === 'object'){
        expect(actual).to.eql(expected[count]);
      } else {
        expect(actual).to.equal(expected[count]);
      }
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