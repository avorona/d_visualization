export function getArrayWithLimitedLength(length) {
  var array = new Array();

  array.push = function() {
    if (this.length >= length) {
      this.shift();
    }
    return Array.prototype.push.apply(this,arguments);
  };

  return array;

}
