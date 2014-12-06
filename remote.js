var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var delta = require('./delta')

var rootUrl = 'http://cdimage.blankonlinux.or.id/blankon/livedvd-harian';
var internals = {};

internals.isBuildSuccess = function (html) {
  var $ = cheerio.load(body);
  return $('a').length > 3;
}

internals.getBuildList = function(cb) {
  request(rootUrl, function(err, res, body) {
    if (err) 
      return cb(err);
    if (res.statusCode != 200)
      return cb (new Error('not 200'));
    var $ = cheerio.load(body);
    var list = [];
    var links = $('a');
    for (var i = 1; i < links.length; i++) {
      list.push($(links[i]).attr('href'));
    }
    cb (null, list);
  });
}

internals.isBuildSuccess = function(path, cb) {
  request(rootUrl + '/' + path, function(err, res, body){
    if (err)
      return cb(err);
    if (res.statusCode != 200)
      return cb(new Error('not 200'));
    var $ = cheerio.load(body);
    cb(null, $('a').length > 3);
  });
}

internals.getLog = function(cb) {
  request(rootUrl + '/current/log.txt', function(err, res, body){
    if (err)
      return cb(err);
    if (res.statusCode != 200)
      return cb(new Error('not 200'));
    console.log(body.substring(body.length - 599)); // 599 is maaaagiiiccc :)
    cb();
  });
}

internals.getLatestTwoSuccessBuilds = function (list) {
  var breaks = 0;
  var indexes = [];
  for (var i = list.length - 1; i > -1; i--) {
    if (list[i]){
      indexes.push(i);
      breaks++;
    }
    if (breaks == 2) 
      break;
  }
  return indexes;
}

internals.getDelta = function(urls, cb) {
  async.mapSeries(urls, function(url, fn) {
    request(url, function(err, res, body){
      if (res.statusCode != 200)
        return fn(new Error('not 200'));
      // todo check status code, and consider it as an error
      fn(err, body);
    });
  }, function(err, result){
    if (err)
      return cb(err);
    var newerList = result[0].split('\n'); 
    var olderList = result[1].split('\n');
    cb(null, delta(newerList, olderList));
  });
}

internals.getDiff = function(options, cb) {
  internals.getBuildList(function(err, list){
  var _ = internals;
  async.mapSeries(list, internals.isBuildSuccess, function(err, result){ 
    if (err)
        return;
      var indexes = _.getLatestTwoSuccessBuilds(result);
      var newIndex = list[indexes[0]];
      var olderIndex = list[indexes[1]];

      console.log('the latest two successful builds: ', olderIndex, 'and', newIndex);
      console.log('diff(', newIndex, ',', olderIndex, ') ->');

      var newerList = rootUrl + '/' + list[indexes[0]] + options.name + '.list';
      var olderList = rootUrl + '/' + list[indexes[1]] + options.name + '.list';
      _.getDelta([newerList, olderList], function(err, delta) {
        console.log (JSON.stringify(delta, null, 2));
      });
    });
  });
}

module.exports = function() {
  var _ = internals;
  console.log('checking current build...');
  _.isBuildSuccess('current/', function(err, success){
    if (err) {
      console.log('something is wrong buddy.');
      return;
    }
    if (!success) {
      console.log('current build is failed.');
      console.log('here\'s the log: ');
      _.getLog(function(){
        console.log('please wait, we have more...');
      });
    }
    _.getDiff({name : 'tambora-desktop-amd64'});
  })
}