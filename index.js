var util = require('util')
var Readable = require('readable-stream').Readable
var iterate = require('stream-iterate')

var destroy = function (stream) {
  if (stream.readable && stream.destroy) stream.destroy()
}

var StreamSet = function (a, b) {
  if (!(this instanceof StreamSet)) return new StreamSet(a, b)
  Readable.call(this, {objectMode: true, highWaterMark: 16})

  this._destroyed = false
  this._a = a
  this._b = b

  this._readA = iterate(a)
  this._readB = iterate(b)
}

util.inherits(StreamSet, Readable)

StreamSet.prototype.next = function (err, consumes) {
  var self = this
  console.error('read unimplemented!')
  this.emit('error', new Error('Must implement read'))
}

StreamSet.prototype._read = function () {
  var self = this
  self._readA(function (err, dataA, nextA) {
    if (err) return self.next(err, data, nextA)
    self._readB(function (err, dataB, nextB) {
      if (err) return self.next(err, data, nextA)
      self.next(null, dataA, dataB, nextA, nextB)
    })
  })
}

StreamSet.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true
  destroy(this._a)
  destroy(this._b)
  if (err) this.emit('error', err)
  this.emit('close')
}

module.exports = StreamSet
