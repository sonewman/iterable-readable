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

function read_(str, data, done) {
  function push(err, data) {
    if (err) return str.emit('error', err)
    str.push(data)
    done()
  }

  if (data == null) return str.push(null)

  if ('function' === typeof str._callback) {
    str._callback(data, push)
  } else {
    str.push(data)
    done()
  }
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
  var self = this
  if (self._index < self._length)
    read_(self, self._iterable[self._index], finishRead)

  function finishRead() {
    self._index += 1
    if (self._index === self._length)
      self.push(null)
  }
}

function pushGenValue_(v) {
  return v.done ? null : v.value
}

function IterableReadable(iterable, opts, fn) {
  this._iterable = iterable
  this._callback = fn

  this._initv = iterable.next()

  var options = assign({}, opts)
  if (setObjectMode(this._initv, options))
    options.objectMode = true

  Readable.call(this, options)

  this._initRun = true
}

IterableReadable.prototype = Object.create(Readable.prototype, {
  constructor: { value: IterableReadable }
})

IterableReadable.prototype._read = function () {
  if (this._initRun) {
    this._initRun = false
    read_(this, pushGenValue_(this._initv), noop)
    this._initv = null
  } else {
    read_(this, pushGenValue_(this._iterable.next()), noop)
  }
}
