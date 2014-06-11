var should = require('should');
var actionheroPrototype = require(__dirname + "/../../actionhero.js").actionheroPrototype;
var actionheroClientPrototype = require(__dirname + '/../../public/javascript/actionheroClient.js').actionheroClient;
var faye = require('faye');
var actionhero = new actionheroPrototype();
var api;
var socketURL;
var connections = [];

// Note: on OSX, it's hard to config your ulimits > 256.
// You can raise this limit up on other platforms
var total = 250; 
var timeout = (5000 + (total * 50));

var doAll = function(action, params, callback){
  var started = 0;
  var errors = [];
  for (var i = 0; i < connections.length; i++) {
    started++;
    (function(i){
      connections[i].action(action, params, function(d){
        started--;
        if(d.error != null){ errors.push(d); }
        if(started === 0){
          callback(errors);
        }
      });
    })(i)
  }
}

describe('WS Load Test', function(){

  before(function(done){
    actionhero.start(function(err, a){
      api = a;
      socketURL = 'http://localhost:' + api.config.servers.web.port;
      done();
    })
  });

  it('can create many connections', function(done){
    this.timeout(timeout);

    var started = 0;
    for (var i = 0; i < total; i++) {
      started++;
      (function(i){
        connections[i] = new actionheroClientPrototype({host: socketURL, faye: faye});
        connections[i].connect(function(err, data){
          started--;
          should.not.exist(err);
          if(started === 0){
            done();
          }
        });
      })(i)
    } 
  });

  it('parallel run: status', function(done){
    this.timeout(timeout);

    doAll('status', {}, function(errors){
      errors.length.should.equal(0);
      done();
    })
  });

  it('parallel run: randomNumber', function(done){
    this.timeout(timeout);

    doAll('randomNumber', {}, function(errors){
      errors.length.should.equal(0);
      done();
    })
  });

  it('parallel run: cacheTest', function(done){
    this.timeout(timeout);

    doAll('cacheTest', {key: 'k', value: 'v'}, function(errors){
      errors.length.should.equal(0);
      done();
    })
  });

});
