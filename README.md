# socket-tester

Socket-tester is an easy to use tool for testing Socket.io code with Mocha.  Socket-tester makes writing tests for Socket.io easy, succint, and with a whole lot less messy boilerplate.

It is designed to work with Mocha as a test framework and socket-io.client to manage creating client connections.

Check out the [Github Repo](https://github.com/alexzywiak/socketTester)

## Introduction

Writing code testing the interactions of multiple clients for Socket.io quickly leads to a messy nest of connect callbacks and setTimeout calls.  Socket-tester handles all the repetitive boilerplate of setting up client connections, setting up event handlers, and tearing down connections after the tests are run.  Its syntax is flat, concise and easy to use without having to manage nested connect statements. It also includes a number of flexible helper functions that test for the most common use cases.  Socket-tester makes writing tests for Socket.io code as easy as using Socket.io itself.

# Installation

Socket-tester is available on npm.

```
npm install socket-tester
```

## Setup

To begin using socket-tester, create a new instance of it by passing in an instance of [socket.io-client](https://www.npmjs.com/package/socket.io-client), the socket url you wish to use, and socket options for connecting.

Here is an example set up using chai as an assertion library.  The server instance is also being required in as app.

```js
var expect = require('chai').expect;
var io     = require('socket.io-client');
var SocketTester = require('socket-tester');

var app = require('../testServer/index');

var socketUrl = 'http://localhost:3000';

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketTester = new SocketTester(io, socketUrl, options);

describe('Sockets', function () {
  // testing magic goes here
});

```

## Examples

Getting started:

```js
var expect = require('chai').expect;
var io     = require('socket.io-client');
var SocketTester = require('socket-tester');

var app = require('../testServer/index');

var socketUrl = 'http://localhost:3000';

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketTester = new SocketTester(io, socketUrl, options);

describe('Sockets', function () {
  it('should check if a function is called with a given value', function(done){
    var client1 = {
      on: {
        'message': socketTester.shouldBeCalledWith('test')
      },
      emit: {
        'join room': 'room'
      }
    };

    var client2 = {
      emit: {
        'join room': 'room',
        'message': 'test'
      }
    };

    socketTester.run([client1, client2], done);
  });
});
```

Test for a function that shouldn't be called:

```js
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

  socketTester.run([client1, client2], done);
});
```

Test a function is called a certain number of times:

```js
it('should test functions called n times', function(done){
  var client1 = {
    on: {
      'message': socketTester.shouldBeCalledNTimes(1)
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
```

Test a function is called multiple times with different values:

```js
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
```

## API

### socketTester.run(*socket.io-client, socketUrl, socketOptions*)

```
/**
 * Creates connections, sets up listeners, and triggers events.
 * @param  {array}   clients  Array of client objects
 * @param  {Function} done    Mocha done function
 */
```

Client objects should be in the following format.  Events will be emitted in order of their declaration.  Use helper functions to emit the same event multiple times or test multiple calls of the same event.

```
var client = {
  on: {
    'first event name' : callback,
    'second event name': callback
  },
  emit: {
    'first event name' : 'value to pass'
  }
};
```

### socketTester.shouldBeCalledWith(*expected*)

```
/**
 * Checks if event is called with expected value
 * @param  {primitive|obj|function} expected Expected value to check against received value.  If passed a function, will invoke it passing the received value.
 */
```
Expected value is tested for equality of primitive values, deep equality of objects and arrays, and if passed a function will pass in the received value as an argument.

Example:
```js
it('should check if a function is called with a given value', function(done){
    var client1 = {
      on: {
        'message': socketTester.shouldBeCalledWith('test')
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

    socketTester.run([client1, client2], done);
  });
});
```

### socketTester.shouldBeCalledNTimes(*n*)

```
/**
 * Tests how many times the functions is called
 * @param  {[number]} n Target number of calls
 */
```
Example:
```js
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
  }

  socketTester.run([client1, client2], done);
});
```

### socketTester.shouldBeCalledNTimesWith(*expected*)

```
/**
 * Tests multiple calls of the function against an ordered list of expected values 
 * @param  {[array]} expected An array of ordered expected outcomes.  Accepts primitive values, objects, and functions.
 */
```
Expected can be an array of primitive values, objects, or functions.  It is tested for equality of primitive values, deep equality of objects and arrays, and if passed a function, will pass in the received value as an argument.

Example:
```js
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
```

### socketTester.shouldNotBeCalled()

```
/**
 * Tests that a function is not called
 */
```
Example:
```js
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

  socketTester.run([client1, client2], done);
});
```

### socketTester.emitNTimes(*n*)

```
/**
 * Will emit an event a specified number of times with no arguments
 * @param  {[number]} n number of times to emit event
 */
```
Example:
```js
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
```

### socketTester.emitNTimesWith(*values*)

```
/**
 * Will emit an event a specified number of times with ordered arguments
 * @param  {[array]} expected  ordered list of values to be emitted with the event
 */
```

Example:
```js
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
```
