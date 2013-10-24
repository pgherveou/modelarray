# modelarray

  simple arrays of models with the following features:
  
  * behave just like an array (ie ` Array.isArray(myModelArray) === true`)
  * emit add /remove / reset / sort events
  * ensure unicity of items

  the rest is up to you!


## Example
```js
 var jeremy = new User({id: 1, name: 'jeremy'}),
     mehdi = new User({id: 2, name: 'mehdi'}),
     pg = new User({id: 3, name: 'pg'}),
     thomas = new User({id: 4, name: 'thomas'});

 // use Users items...
 var users = new modelArray([pg, mehdi, jeremy], User);

 // or pojo
 var objs = new ModelArray([{id: 1, name: 'pg'}, {id: 2, name: 'pg'}]);

 // or String (or Numbers, or anything else...)
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
