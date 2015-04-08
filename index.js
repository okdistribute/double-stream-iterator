var util = require('util')
var Readable = require('readable-stream').Readable
var iterate = require('stream-iterate')

var destroy = function (stream) {
  if (stream.readable && stream.destroy) stream.destroy()
}

var DoubleStreamIterator = function (a, b) {
  if (!(this instanceof DoubleStreamIterator)) return new DoubleStreamIterator(a, b)
  Readable.call(this, {objectMode: true, highWaterMark: 16})

  this._destroyed = false
  this._a = a
  this._b = b

  this._readA = iterate(a)
  this._readB = iterate(b)
}
util.inherits(DoubleStreamIterator, Readable)

DoubleStreamIterator.prototype.next = function (err, consumes) {
  var self = this
  this.emit('error', new Error('Must implement next'))
}

DoubleStreamIterator.prototype._read = function () {
  var self = this
  self._readA(function (err, dataA, nextA) {
    if (err) return self.next(err, data, nextA)
    self._readB(function (err, dataB, nextB) {
      if (err) return self.next(err, data, nextB)
      self.next(null, dataA, dataB, nextA, nextB)
    })
  })
}

DoubleStreamIterator.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true
  destroy(this._a)
  destroy(this._b)
  if (err) this.emit('error', err)
  this.emit('close')
}

module.exports = DoubleStreamIterator
