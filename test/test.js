var expect = require('chai').expect;
var io     = require('socket.io-client');

var app = require('../testServer/index');

var SocketTester = require('../index');

var socketUrl = 'http://localhost:3000';

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketTester = new SocketTester(io, socketUrl, options);
var room = 'lobby';
var connections = [];


describe('Sockets', function () {

  it('should handle setup for multiple clients', function(done){
    var client1 = {
      on: {
        'message': function(msg){
          expect(msg).to.equal('test');
        }
      },
      emit: {
        'join room': room
      }
    };

    var client2 = { 
      emit: {
        'join room': room,
        'message': 'test'
      }
    };

    var client3 = {
      on: {
        'message': function(msg){
          expect(msg).to.equal('test');
        }
      }, 
      emit: {
        'join room': room,
        'message': 'test'
      }
    };

    socketTester.run([client1, client2, client3], done);
  });

  describe('Event Listener Helpers', function () {
    describe('socketTester.shouldBeCalledWith', function () {

      it('should check if a function is called with a given value', function(done){
        var client1 = {
          on: {
            'message': socketTester.shouldBeCalledWith('test')
          },
          emit: {
            'join room': room
          }
        };

        var client2 = {
          emit: {
            'join room': room,
            'message': 'test'
          }
        };

        socketTester.run([client1, client2], done);
      });
    });

    describe('socketTester.shouldNotBeCalled', function () {

      it('should handle functions that should not be called', function(done){
        var client1 = {
          on: {
            'message': socketTester.shouldNotBeCalled()
          },
          emit: {
            'join room': 'test'
          }
        };

        var client2 = {
          emit: {
            'join room': room,
            'message': 'test'
          }
        };

        var client3 = {
          emit: {
            'join room': room,
            'message': 'test'
          }
        };

        socketTester.run([client1, client2, client3], done);
      });
    });

    describe('socketTester.shouldBeCalledNTimes', function () {
      it('should test functions called n times', function(done){
        var client1 = {
          on: {
            'message': socketTester.shouldBeCalledNTimes(2)
          },
          emit: {
            'join room': room
          }
        };

        var client2 = {
          emit: {
            'join room': room,
            'message': 'test'
          }
        };

        var client3 = {
          emit: {
            'join room': room,
            'message': 'shoe'
          }
        };

        socketTester.run([client1, client2, client3], done);
      });
    });

    describe('socketTester.shouldBeCalledNTimesWith', function () {
      it('should test functions called n times with primitive values', function(done){
        var client1 = {
          on: {
            'message': socketTester.shouldBeCalledNTimesWith(['test', 'shoe'])
          },
          emit: {
            'join room': room
          }
        };

        var client2 = {
          emit: {
            'join room': room,
            'message': 'test'
          }
        };

        var client3 = {
          emit: {
            'join room': room,
            'message': 'shoe'
          }
        };

        socketTester.run([client1, client2, client3], done);
      });

      it('should test functions called n times with object values', function(done){
        var client1 = {
          on: {
            'message': socketTester.shouldBeCalledNTimesWith([{a: 1, b:2}, {c:3, d:4}])
          },
          emit: {
            'join room': room
          }
        };

        var client2 = {
          emit: {
            'join room': room,
            'message': {a:1, b:2}
          }
        };

        var client3 = {
          emit: {
            'join room': room,
            'message': {c:3, d:4}
          }
        };

        socketTester.run([client1, client2, client3], done);
      });

      it('should test functions called n times with test functions', function(done){
        var client1 = {
          on: {
            'message': socketTester.shouldBeCalledNTimesWith([
              function(data){
                expect(data.a).to.equal(1);
              },
              function(data){
                expect(data.d).to.equal(4);
              }
              ])
          },
          emit: {
            'join room': room
          }
        };

        var client2 = {
          emit: {
            'join room': room,
            'message': {a:1, b:2}
          }
        };

        var client3 = {
          emit: {
            'join room': room,
            'message': {c:3, d:4}
          }
        };

        socketTester.run([client1, client2, client3], done);
      });
    });
  });

describe('Emit Event Helpers', function () {

  describe('socket.emitNTimes', function () {
    it('should test functions called n times with test functions', function(done){
      var client1 = {
        on: {
          'message': socketTester.shouldBeCalledNTimes(2)
        },
        emit: {
          'join room': room
        }
      };

      var client2 = {
        emit: {
          'join room': room,
          'message': socketTester.emitNTimes(2)
        }
      };

      socketTester.run([client1, client2], done);
    });
  });

  describe('socket.emitNTimesWith', function () {
    it('should test functions called n times with test functions', function(done){
      var client1 = {
        on: {
          'message': socketTester.shouldBeCalledNTimesWith(['a', 'b'])
        },
        emit: {
          'join room': room
        }
      };

      var client2 = {
        emit: {
          'join room': room,
          'message': socketTester.emitNTimesWith(['a', 'b'])
        }
      };

      socketTester.run([client1, client2], done);
    });
  });
});


});