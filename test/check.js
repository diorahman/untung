var check = require('../delta');
var fs = require('fs');
var dir = __dirname + '/data';

describe('check simple list', function(){
  it ('should detect the removed package', function(done){
    var n = fs.readFileSync(dir + '/new.removed.list');
    var o = fs.readFileSync(dir + '/old.removed.list');
    var nList = n.toString().split('\n');
    var oList = o.toString().split('\n');
    var result = check(nList, oList);
    result.removed.length.should.equal(1);
    done();
  });

  it ('should detect the added package', function(done){
    var n = fs.readFileSync(dir + '/new.added.list');
    var o = fs.readFileSync(dir + '/old.added.list');
    var nList = n.toString().split('\n');
    var oList = o.toString().split('\n');
    var result = check(nList, oList);
    result.added.length.should.equal(1);
    done();
  });

  it ('should detect the upgraded package', function(done){
    var n = fs.readFileSync(dir + '/new.upgraded.list');
    var o = fs.readFileSync(dir + '/old.upgraded.list');
    var nList = n.toString().split('\n');
    var oList = o.toString().split('\n');
    var result = check(nList, oList);
    result.upgraded.length.should.equal(1);
    done();
  });

  it ('should detect the downgraded package', function(done){
    var n = fs.readFileSync(dir + '/new.downgraded.list');
    var o = fs.readFileSync(dir + '/old.downgraded.list');
    var nList = n.toString().split('\n');
    var oList = o.toString().split('\n');
    var result = check(nList, oList);
    result.downgraded.length.should.equal(1);
    done();
  });
});
