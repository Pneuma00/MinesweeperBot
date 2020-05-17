require('./array.js');

Array.prototype.includesArray = function(eleArray) {
  return !this.every(arr => !Array.isEqual(arr, eleArray));
}