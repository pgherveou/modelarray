

<!-- Start index.js -->

## ModelArray(values, model)

ModelArray Constructor

### Params: 

* **Array** *values* 

* **[Object]** *model* item Model constructor

Item constructor class

#### NOTE:
items should expose an id, cid or a toString() method
that can be use as a key to index models in the array

if your item has a set method, it will be use
to update references when calling arrayItem.set()

## _uniq()

cast arguments and create a unique list of values
that are not already in this array

## _cast(obj)

cast obj to this array model

### Params: 

* **Object** *obj* 

### Return:

* **the** casted value

## silent()

silent next operation

## emit()

Wraps [`Emitter#emit`](https://github.com/component/emitter#emit)
emit event when silent flag is off

## index([args...])

index models

### Params: 

* **Object** *[args...]* 

## unindex([args...])

remove models indexes

### Params: 

* **Object** *[args...]* 

## get(value)

Get a model from the array.

### Params: 

* **Object** *value* an id or model

### Return:

* **Model** 

## remove([args...])

remove item from the array

### Params: 

* **Object** *[args...]* 

## set(models)

sync modelArray with specifed models

### Params: 

* **Array** *models* 

## reset(reinitialize)

reset items in array

### Params: 

* **Array** *reinitialize* the array with the one specified here

## push()

Wraps [`Array#push`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push)

## pop()

Wraps [`Array#pop`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop)

## splice()

Wraps [`Array#splice`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice)

## unshift()

Wraps [`Array#unshift`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift)

## shift()

Wraps [`Array#shit`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/shift)

## sort()

Wraps [`Array#sort`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort)

<!-- End index.js -->

