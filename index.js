var expect = require('chai').expect;

/**
 * Constructor Function
 * @param {obj} io              socket.io-client instance
 * @param {string} socketUrl    socket url to connect to
 * @param {obj} socketOptions   socket.io-client connection options
 */
var SocketTester = function(io, socketUrl, socketOptions){
  this.io = io;
  this.socketUrl = socketUrl;
  this.socketOptions = socketOptions;
  this.connections = [];
  this.testConditions = [];
  this.timeout = 25;
};

/**
 * Creates connections, sets up listeners, and triggers events.
 * @param  {array}   clients  Array of client objects
 * @param  {Function} done    Mocha done function
 */
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
            if(typeof conn.emit[event] === 'function'){
              conn.emit[event](conn, event);
            } else {
              conn.connection.emit(event, conn.emit[event]);
            }
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
      var self = this;
      this.testConditions.forEach(function(test){
        try{
          test();
        } 
        catch(e) {
          self.clearConnections();
          throw new Error(e);
        }
      });
      this.clearConnections();
      done();
    }.bind(this), this.timeout);
  } else {
    this.clearConnections();
  }
};

/**
 * Checks if event is called with expected value
 * @param  {primitive|obj|function} expected Expected value to check against received value.  If passed a function, will invoke it passing the received value.
 */
SocketTester.prototype.shouldBeCalledWith = function(expected){
  return this.shouldBeCalledNTimesWith([expected]);
};

/**
 * Tests how many times the functions is called
 * @param  {[number]} n Target number of calls
 */
SocketTester.prototype.shouldBeCalledNTimes = function(n){
  var count = 0;

  this.testConditions.push(function(){
    expect(count).to.equal(n);
  });

  return function(){
    count++;
  }
};

/**
 * Tests multiple calls of the function against an ordered list of expected values 
 * @param  {[array]} expected An array of ordered expected outcomes.  Accepts primitive values, objects, and functions.
 */
SocketTester.prototype.shouldBeCalledNTimesWith = function(expected){
  var count = 0;

  this.testConditions.push(function(){
    expect(count).to.equal(expected.length);
  });

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

/**
 * Tests that a function is not called
 */
SocketTester.prototype.shouldNotBeCalled = function(){
  return function(){
    expect('function was called').to.equal('function should not be called');
  }
};

/**
 * Will emit an event a specified number of times with no arguments
 * @param  {[number]} n number of times to emit event
 */
SocketTester.prototype.emitNTimes = function(n){
  return this.emitNTimesWith(new Array(n));
};

/**
 * Will emit an event a specified number of times with ordered arguments
 * @param  {[array]} expected  ordered list of values to be emitted with the event
 */
SocketTester.prototype.emitNTimesWith = function(expected){
  return function(conn, event){
    for(var i = 0; i < expected.length; i++){
      conn.connection.emit(event, expected[i]);
    }
  };
};

/**
 * Disconnects clients for the next test
 */
SocketTester.prototype.clearConnections = function(){
  this.testConditions = [];
  this.connections.forEach(function(conn){
    conn.connection.disconnect();
  });
  this.connections = [];
};

module.exports = SocketTester;