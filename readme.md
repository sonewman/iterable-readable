# Iterable-Readable

Turn an Array, iterable or generator into a readable stream:

### Usage

```javascript
var itStream = require('iterable-stream')

// An array:

itStream([1, 2, 3, 4, 5])
  .pipe(process.stdout)

// generator:

var arr = [1, 2, 3, 4, 5]

var i = 0
function* gen() {
  while (i < arr.length) {
    yield arr[i]
    i += 1
  }
}

itStream(gen)
  .pipe(process.stdout)

// iterable

itStream(gen())
  .pipe(process.stdout)
```
You can also pass a preprocessing function:
```javascript
var arr = [1, 2, 3, 4, 5]

itStream([1, 2, 3, 4, 5], (val, next) => next(null, val * 2))
  .pipe(process.stdout) // => 2, 4, 6, 8, 10
```

### Licence
MIT
