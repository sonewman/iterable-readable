var desc = require('macchiato')

var it = require('./')
var Writable = require('readable-stream').Writable

desc('Iterable-Readable')
.it('should take an array pump it out as chunks', function (t) {
  var arr = [1, 2, 3, 4, 5]
  var got = []

  it(arr)
  .pipe(new Writable({
    objectMode: true,
    write: function (val, enc, next) {
      got.push(val)
      next()
    }
  }))
  .on('finish', function () {
    t.eqls(got, arr)
    t.end()
  })
})
.it('should take a generator and pump it out as chunks', function (t) {
  var arr = [1, 2, 3, 4, 5]
  var got = []

  var i = 0
  function* gen() {
    while (i < arr.length) {
      yield arr[i]
      i += 1
    }
  }

  it(gen)
  .pipe(new Writable({
    objectMode: true,
    write: function (val, enc, next) {
      got.push(val)
      next()
    }
  }))
  .on('finish', function () {
    t.eqls(got, arr)
    t.end()
  })
})
.it('should take an iterator and pump it out as chunks', function (t) {
  var arr = [1, 2, 3, 4, 5]
  var got = []

  var i = 0
  function* gen() {
    while (i < arr.length) {
      yield arr[i]
      i += 1
    }
  }

  it(gen())
  .pipe(new Writable({
    objectMode: true,
    write: function (val, enc, next) {
      got.push(val)
      next()
    }
  }))
  .on('finish', function () {
    t.eqls(got, arr)
    t.end()
  })
})
.it('should just push data if object', function (t) {
  var got

  it({ a: 1 })
  .pipe(new Writable({
    objectMode: true,
    write: function (val, enc, next) {
      got = val
      next()
    }
  }))
  .on('finish', function () {
    t.eqls(got, { a: 1 })
    t.end()
  })
})
.it('should just push data as buffer if string', function (t) {
  var got

  it('abc')
  .pipe(new Writable({
    objectMode: true,
    write: function (val, enc, next) {
      got = val
      next()
    }
  }))
  .on('finish', function () {
    t.assert(Buffer.isBuffer(got))
    t.eqls(got.toString(), 'abc')
    t.end()
  })
})
.it('should take a transform function with array', function (t) {
  var arr = [1, 2, 3, 4, 5]
  var got = []

  it(arr, function (val, next) {
    next(null, val * 2)
  })
  .pipe(new Writable({
    objectMode: true,
    write: function (val, enc, next) {
      got.push(val)
      next()
    }
  }))
  .on('finish', function () {
    t.eqls(got, [2, 4, 6, 8, 10])
    t.end()
  })
})
.it('should take a transform function with a generator', function (t) {
  var arr = [1, 2, 3, 4, 5]
  var got = []

  var i = 0
  function* gen() {
    while (i < arr.length) {
      yield arr[i]
      i += 1
    }
  }

  it(gen, function (val, next) {
    next(null, val * 2)
  })
  .pipe(new Writable({
    objectMode: true,
    write: function (val, enc, next) {
      got.push(val)
      next()
    }
  }))
  .on('finish', function () {
    t.eqls(got, [2, 4, 6, 8, 10])
    t.end()
  })
})
