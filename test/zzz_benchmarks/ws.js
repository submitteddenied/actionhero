var should = require('should');
var actionheroPrototype = require(__dirname + "/../../actionhero.js").actionheroPrototype;
var actionheroClientPrototype = require(__dirname + '/../../public/javascript/actionheroClient.js').actionheroClient;
var faye = require('faye');
var actionhero = new actionheroPrototype();
var api;
var socketURL;
var connections = [];
var total = 500;

describe('WS Load Test', function(){

  before(function(done){
    actionhero.start(function(err, a){
      api = a;
      socketURL = 'http://localhost:' + api.config.servers.web.port;
      done();
    })
  });

  it('can create many connections', function(done){
    this.timeout(total * 50);

    var started = 0;
    for (var i = 0; i < total; i++) {
      started++;
      (function(i){
        connections[i] = new actionheroClientPrototype({host: socketURL, faye: faye});
        connections[i].connect(function(err, data){
          started--;
          // console.log(started)
          should.not.exist(err);
          if(started === 0){
            done();
          }
        });
      })(i)
    } 
  });

});
