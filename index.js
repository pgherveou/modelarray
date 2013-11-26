/*!
 * dependencies
 */

var emitter = require('emitter');

/**
 * ModelArray Constructor
 * @param {Array} values
 * @param {[Object]} model item Model constructor
 * @inherits EventEmitter
 *
 * Examples:
 *     jeremy = new User({id: 1, name: 'jeremy'});
 *     mehdi = new User({id: 2, name: 'mehdi'});
 *     pg = new User({id: 3, name: 'pg'});
 *     thomas = new User({id: 4, name: 'thomas'});
 *
 *     // use Users items...
 *     var users = new modelArray([pg, mehdi, jeremy], User);
 *
 *     // or String, Numbers Object or any pojo
 *     var strs = new ModelArray(['pg', 'mehdi', 'jeremy']);
 *
 *     // listen to add event
 *     users.on('add', function (models) {
 *        // ...
 *     });
 *
 *     // will cast items, remove duplicate, and trigger a add event..
 *     models.push(pg, thomas, {id: 5, name: jareen});
 *
 *     // will remove event..
 *     models.remove(jeremy, mehdi);
 *
 * @api public
 */

function ModelArray (values, model) {
  var arr = [];
  arr.__proto__ = this;

  Object.defineProperty(this, '_silent', {
    value: false,
    writable: true
  });

  Object.defineProperty(this, '_callbacks', {
    value: Object.create(null),
    writable: true
  });

  Object.defineProperty(this, 'model', {
    value: model
  });

  Object.defineProperty(this, '_byId', {
    value: Object.create(null),
    writable: true
  });

  if (values && Array.isArray(values)) {
    arr.silent().push.apply(arr, values);
  } else if (values) {
    arr.silent().push.call(arr, values);
  }
  return arr;
}

/*!
 * Inherit from Array & mixin with emitter
 */

ModelArray.prototype = emitter([]);

/*!
 * expose ModelArray
 */

module.exports = ModelArray;

/**
 * Item constructor class
 *
 * if your item has a set method, it will be use
 * to update references when calling arrayItem.set()
 *
 * @property model
 */

ModelArray.prototype.model;

/**
 * cast arguments and create a unique list of values
 * that are not already in this array
 *
 * @api private
 */

function _uniq() {
  var list = [], ids = Object.create(null);

  [].forEach.call(arguments, function (obj) {
    // ignore item already in array
    if (!obj) return;
    if (this.get(obj)) return;

    // cast object
    var model = this._cast(obj),
        id = model.id || model.cid || model;

    // make sure we don't add it twice
    if (ids[id]) return;

    list.push(model);
    if ('object' !== typeof id) ids[id] = true;
  }, this);

  return list;
}

/**
 * cast obj to this array model
 *
 * @param  {Object} obj
 * @return the casted value
 * @api private
 */

ModelArray.prototype._cast = function (obj) {
  if (!this.model) return obj;
  if (obj instanceof this.model) return obj;
  return new this.model(obj);
};

/**
 * silent next operation
 *
 * @api public
 */

ModelArray.prototype.silent = function (v) {
  if (v === undefined) v = true;
  this._silent = v;
  return this;
};

/**
 * Wraps [`Emitter#emit`](https://github.com/component/emitter#emit)
 * emit event when silent flag is off
 *
 * @api public
 */

ModelArray.prototype.emit = function () {
  if (this._silent) {
    this._silent = false;
  } else {
    emitter.prototype.emit.apply(this, arguments);
  }
  return this;
};

/**
 * index models
 *
 * @param {Object} [args...]
 * @api private
 */

ModelArray.prototype.index = function () {
  var value;
  [].forEach.call(arguments, function (m) {
    if (m.id) this._byId[m.id] = m;
    if (m.cid) this._byId[m.cid] = m;
    if (!m.id && !m.cid && ('object' !== typeof (value = m.valueOf()))) {
      this._byId[value] = m;
    }
  }, this);
};

/**
 * remove models indexes
 *
 * @param {Object} [args...]
 * @api private
 */

ModelArray.prototype.unindex = function () {
  [].forEach.call(arguments, function (m) {
    if (m.id) delete this._byId[m.id];
    if (m.cid) delete this._byId[m.cid];
    if (!m.id && !m.cid) delete this._byId[m.valueOf()];
  }, this);
};

/**
 * Get a model from the array.
 *
 * @param {Object} value an id or model
 * @return {Model}
 * @api public
 */

ModelArray.prototype.get = function (obj) {
  if (!obj) return;
  var id = obj.id || obj.cid || obj.valueOf();
  if (id && 'object' !== typeof(id)) return this._byId[id];
  return this[this.indexOf(id)];
};

/**
 * Alias of get
 */

ModelArray.prototype.id = ModelArray.prototype.get;

/**
 * remove item from the array
 *
 * @param {Object} [args...]
 * @event remove
 * @api public
 */

ModelArray.prototype.remove = function () {
  var toRemove = [];

  [].forEach.call(arguments, function (model) {
    model = this.get(model);
    if (!model) return;
    toRemove.push(model);
    this.unindex(model);
    [].splice.call(this, this.indexOf(model), 1);
  }, this);

  // trigger events
  if (toRemove.length) {
    this.emit('remove', toRemove, this);
  } else {
    this.silent(false);
  }

  return toRemove;
};

/**
 * sync modelArray with specifed models
 *
 * @param {Array} models
 * @event add
 * @event remove
 * @api public
 */

ModelArray.prototype.set = function (models) {
  var toAdd = [],
      toRemove = [],
      ids = [],
      silent = !!this._silent,
      id;

  // normalize to array
  if (!Array.isArray(models)) models = [models];

  // update, flag items to add/remove
  models
    .map(this._cast, this)
    .forEach(function (model) {
      var existing = this.get(model);
      if (existing) {
        ids.push(existing.id || existing.cid || existing.valueOf());
        if (existing.set) {
          existing.set(model);
        } else {
          this.unindex(existing);
          this.index(model);
          this[this.indexOf(existing)] = model;
        }
      } else  {
        toAdd.push(model);
      }
    }, this);

  // get models to remove
  this.forEach(function (model) {
    id = model.id || model.cid || model.valueOf();
    if (ids.indexOf(id) === -1) toRemove.push(model);
  });

  // remove & add models
  if (toRemove.length) this.silent(silent).remove.apply(this, toRemove);
  if (toAdd.length) this.silent(silent).push.apply(this, toAdd);
  this.silent(false);
  return this;
};

/**
 * reset items in array
 *
 * @param {Array} reinitialize the array with the one specified here
 * @api public
 */

ModelArray.prototype.reset = function (models) {
  [].splice.call(this, 0, this.length);
  this._byId = Object.create(null);
  if (models) this.silent().push.apply(this, models);
  this.emit('reset', models, this);
};

/**
 * Wraps [`Array#push`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push)
 *
 * @event add
 * @api public
 */

ModelArray.prototype.push = function () {
  var values,
      ret;

  values = _uniq.apply(this, arguments);
  ret = [].push.apply(this, values);
  this.index.apply(this, values);

  // trigger events
  if (values.length) {
    this.emit('add', values, this);
  } else {
    this.silent(false);
  }

  return ret;
};

/**
 * add an array of item at the end of the array
 *
 * @event add
 * @api public
 */

ModelArray.prototype.add = function (items) {
  if (Array.isArray(items)) {
    this.push.apply(this, items);
  } else {
    this.push(items);
  }
};

/**
 * Wraps [`Array#pop`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop)
 *
 * @event remove
 * @api public
 */

ModelArray.prototype.pop = function () {
  var model = [].pop.call(this);
  this.unindex(model);

  // trigger event
  if (model) {
    this.emit('remove', model, this);
  } else {
    this.silent(false);
  }

  return model;
};

/**
 * Wraps [`Array#splice`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/splice)
 *
 * @event remove
 * @event add
 * @api public
 */

ModelArray.prototype.splice = function () {
  var silent = !!this._silent,
      ret, vals, toRemove, toAdd;

  if (arguments.length) {
    vals = [].slice.call(arguments, 0, 2);
    toRemove = [].splice.apply(this, vals);

    toAdd = _uniq.apply(this, [].slice.call(arguments, 2));
    [].splice.apply(this, [arguments[0], 0].concat(toAdd));

    // update indexes
    this.unindex.apply(this, toRemove);
    this.index.apply(this, toAdd);
  }
  if (toRemove.length) this.silent(silent).emit('remove', toRemove, this);
  if (toAdd.length) this.silent(silent).emit('add', toAdd, this);
  this.silent(false);
  return ret;
};

/**
 * Wraps [`Array#unshift`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/unshift)
 *
 * @event add
 * @api public
 */

ModelArray.prototype.unshift = function () {
  var values,
      ret;

  values = _uniq.apply(this, arguments);
  ret = [].unshift.apply(this, values);
  this.index.apply(this, values);

  // trigger event
  if (values.length) {
    this.emit('add', values, this);
  } else {
    this.silent(false);
  }

  return ret;
};

/**
 * Wraps [`Array#shit`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/shift)
 *
 * @event remove
 * @api public
 */

ModelArray.prototype.shift = function () {
  var model = [].shift.call(this);
  this.unindex(model);

  // trigger event
  if (model) {
    this.emit('remove', model, this);
  } else {
    this.silent(false);
  }

  return model;
};

/**
 * Wraps [`Array#sort`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort)
 *
 * @event sort
 * @api public
 */

ModelArray.prototype.sort = function (fn) {
  var compare = fn || (this.model && this.model.prototype && this.model.prototype.compare),
      ret = [].sort.call(this, compare);
  this.emit('sort', this);
  return ret;
};

/**
 * Create JSON representation of this array
 *
 * @api public
 */

ModelArray.prototype.toJSON = function () {
  return this.map(function (model) {
    return model.toJSON ? model.toJSON() : model;
  });
};
