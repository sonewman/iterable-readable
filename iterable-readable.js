module.exports = create

var Readable = require('readable-stream').Readable
var assign = require('object-assign')

function noop () {}

function createNoop() {
  var r = new Readable()
  r._read = noop
  r.push(null)
  return r
}

function create(iterable, opts, fn) {
  if (!iterable) return createNoop()

  if ('function' === typeof opts) {
    fn = opts
    opts = {}
  }

  opts = opts || {}

  if (Array.isArray(iterable)) {
    if (iterable.length === 0) return createNoop()
    return new ArrayReadable(iterable, opts, fn)
  }

  if ('function' === typeof iterable) {
    var gen = iterable()
    if ('function' === typeof gen.next)
      return new IterableReadable(gen, opts, fn)
  }

  if ('function' === typeof iterable.next) {
    return new IterableReadable(iterable, opts, fn)
  }

  // if all else fails push the value and end!
  var options = assign({}, opts)
  if (setObjectMode(iterable, options))
    options.objectMode = true

  var r = new Readable(options)
  r._read = noop
  r.push(iterable)
  r.push(null)
  return r
}

function setObjectMode(v, options) {
  return 'string' !== typeof v
    && !Buffer.isBuffer(v)
    && options.objectMode !== false
}

function ArrayReadable(iterable, opts, fn) {
  this._iterable = iterable
  this._callback = fn
  this._length = iterable.length
  this._index = 0

  var v = iterable[0]
  if (v == null) {
    Readable.call(this)
    this.push(v)
  } else {
    var options = assign({}, opts)
    if (setObjectMode(v, opts))
      options.objectMode = true

    Readable.call(this, options)
  }
}

ArrayReadable.prototype = Object.create(Readable.prototype, {
  constructor: { value: ArrayReadable }
})

ArrayReadable.prototype._read = function () {
  if (this._index < this._length) {
    this.push(this._iterable[this._index])

    this._index += 1
    if (this._index === this._length)
      this.push(null)
  }
}

function push_(str, v) {
  if (v.done) return str.push(null)
  else return str.push(v.value)
}

function IterableReadable(iterable, opts, fn) {
  this._iterable = iterable
  this._callback = fn

  var v = iterable.next()

  var options = assign({}, opts)
  if (setObjectMode(v, options))
    options.objectMode = true

  Readable.call(this, options)
  push_(this, v)
}

IterableReadable.prototype = Object.create(Readable.prototype, {
  constructor: { value: IterableReadable }
})

IterableReadable.prototype._read = function () {
  var v = this._iterable.next()
  push_(this, v)
}
