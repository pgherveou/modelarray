
# modelarray

  simple wrapper for your arrays with the following features
  - behave and act just like an array (ie Array.typeof(myModelArray) === true)
  - ensure unicity of items
  - emit add/remove/reset/sort events

  the rest is up to you!


## Installation

  Install with [component(1)](http://component.io):

    $ component install pgherveou/modelarray

## Examples
```js
  jeremy = new User(1, 'jeremy');
  mehdi = new User(2, 'mehdi');
  thomas = new User(4, 'thomas');
  pg = new User(3, 'pg');

  users = new Users([pg, mehdi, jeremy]);

  // listen to add, remove, reset or sort events
  users.on('add', function(models) {

  });

  models.push(thomas)

  // works with String, Numbersn Object or any pojo too
  users = new Users(['pg', 'mehdi', 'jeremy']);
  users.on('add', function(models) {//});
  models.push(thomas)
```

##remarks
- your item should expose an id, cid or a toString() method that can be use as a key to index models in the array
- if your item has a set method, this will be use to update references when calling arrayItem.set()

## API

### silent
  chainable method to call prior an operation to disable event

### emit
  see http://github.com/components/emitter

### get(id|obj)
  get item by id, cid or .toString() for primitive types

### remove(element1, ..., elementN)
  remove specifed elements from array

### set(arr)
  sync (update, remove andadd) array with arr

### reset(arr)
  reset the array and add elemens of arr

### push
  wrap Array.push

### pop
  wrap Array.push

### splice
  wrap Array.splice

### unshift
  wrap Array.unshift

### shift
  wrap Array.shift

### sort
  wrap Array.sort

## License

  MIT