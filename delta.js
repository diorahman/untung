var vercmp = require('vercmp');

var internals = {};

internals.name = function(pkg) {
  return pkg.split(' ')[0];
}

internals.ver = function(pkg) {
  return pkg.split(' ')[1];
}

internals.compare = function(pkg1, pkg2) {
  var _ = internals;
  var ver1 = _.ver(pkg1);
  var ver2 = _.ver(pkg2);
  return vercmp(ver1, ver2);
}

internals.checkRemoved = function(newList, oldList) {
  var _ = internals;
  var removed = [];
  var lastMatchedIndex = 0;
  for (var i = 0; i < oldList.length; i++) {
    var skipped = oldList[i];
    if (skipped.length == 0)
      continue;
    var found = false;
    for (var j = lastMatchedIndex; j < newList.length; j++) {
      if (newList[j].length == 0)
        continue;
      if (_.name(newList[j]) == _.name(skipped)) {
        found = true;
        lastMatchedIndex = j + 1;
        break;
      }
    }
    if (!found) {
      removed.push({
        name : _.name(skipped),
        previousVersion : _.ver(skipped)
      });
    }
  }
  return removed;
}

module.exports = function(newList, oldList) {
  if (!Array.isArray(newList) || !Array.isArray(oldList))
    throw new TypeError("Error");

  var _ = internals;
  var lastMatchedIndex = 0;
  var pkgsAdded = [];
  var pkgsUpgraded = [];
  var pkgsDowngraded = [];

  for (var i = 0; i < newList.length; i++) {    
    var pkg1 = newList[i];
    var isNewPkg = true;
    if (pkg1.length == 0)
      continue;
    for (var j = lastMatchedIndex; j < oldList.length; j++) {
      var pkg2 = oldList[j];
      if (pkg2.length == 0)
        continue;
      if (_.name(pkg1) == _.name(pkg2)) {
        var result = _.compare(pkg1, pkg2);
        if (result > 0)
            pkgsUpgraded.push({
              name : _.name(pkg1),
              currentVersion : _.ver(pkg1),
              previousVersion : _.ver(pkg2),
            });
        if (result < 0)
            pkgsDowngraded.push({
              name : _.name(pkg1),
              currentVersion : _.ver(pkg1),
              previousVersion : _.ver(pkg2),
            });
        lastMatchedIndex = j + 1;
        isNewPkg = false;
        break;
      }
    }

    if (isNewPkg)
      pkgsAdded.push({
        name : _.name(pkg1),
        currentVersion : _.ver(pkg1)
      });
  }

  return {
    added : pkgsAdded,
    upgraded : pkgsUpgraded,
    downgraded : pkgsDowngraded,
    removed : _.checkRemoved(newList, oldList)
  }
}