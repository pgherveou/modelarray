# modelarray

  simple wrapper for your arrays with the following features:

  - behave just like an array (ie ` Array.isArray(myModelArray) === true`)
  - ensure unicity of items in the set
  - emit add /remove / reset / sort events

  the rest is up to you!


## Example
```js
 var jeremy = new User({id: 1, name: 'jeremy'});
     mehdi = new User({id: 2, name: 'mehdi'});
     pg = new User({id: 3, name: 'pg'});
     thomas = new User({id: 4, name: 'thomas'});

 // use Users items...
 var users = new modelArray([pg, mehdi, jeremy], User);

 // or pojo (note: obj needs to expose an id property)
 var objs = new ModelArray([{id: 1, name: 'pg'}, {id: 2, name: 'pg'}]);

 // or String, Numbers Object or any pojo
 var strs = new ModelArray(['pg', 'mehdi', 'jeremy']);

 // push will cast items, remove duplicate
 models.push(pg, thomas, {id: 5, name: joe});

 // remove some items
 models.remove(jeremy, mehdi);

 users.on('add', function (models) { /* do something on add */});
 users.on('remove', function (models) { /* do something on remove */});

```

## Installation

  Install with [component(1)](http://component.io):

    $ component install pgherveou/modelarray

  Install with [npm(2)](http://npmjs.org):

    $ npm install modelarray

## Api

  coming soon...

## License

  MIT
