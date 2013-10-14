/*!
 * dependencies
 */

var emitter = require('emitter');


/**
 * cast arguments and create a unique list of values
 * that are not already in this array
 *
 * @api private
 */

function _uniq() {
  var list = [], ids = {};

  [].forEach.call(arguments, function (obj) {
    // ignore item already in array
    if (this.get(obj)) return;

    // cast object
    var model = this._cast(obj),
        id = model.id || model.cid || model;

    // make sure we don't add it twice
    if (ids[id]) return;

    list.push(model);
    ids[id] = true;
  }, this);

  return list;
}

/**
 * constructor
 */

function ModelArray (values) {
  var arr = [];
  arr.__proto__ = this;
  arr._byId = {};
  arr.mod = {};
  arr.silent().push.apply(arr, values);
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
 * member Model
 *
 * @property model
 */

ModelArray.prototype.model;

/**
 * cast obj to this array model
 *
 * @param  {Object} obj
 * @return {Model}
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
 * @api private
 */

ModelArray.prototype.index = function () {
  [].forEach.call(arguments, function (m) {
    if (m.id) this._byId[m.id] = m;
    if (m.cid) this._byId[m.cid] = m;
    if (!m.id && !m.cid) this._byId[m.toString()] = m;
  }, this);
};

/**
 * remove models indexes
 *
 * @api private
 */

ModelArray.prototype.unindex = function () {
  [].forEach.call(arguments, function (m) {
    if (m.id) delete this._byId[m.id];
    if (m.cid) delete this._byId[m.cid];
    if (!m.id && !m.cid) delete this._byId[m.toString()];
  }, this);
};

/**
 * Get a model from the array.
 *
 * @param {any} value
 * @return {Model}
 * @api public
 */

ModelArray.prototype.get = function (obj) {
  if (!obj) return;
  return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
};

/**
 * remove item from the array
 * emit remove event
 *
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
 * @param {Model|Array} models
 * @api public
 */

ModelArray.prototype.set = function (models) {
  var toAdd = [],
      toRemove = [],
      modelMap = {},
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
        id = existing.id || existing.cid || existing.toString();
        modelMap[id] = true;
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
    id = model.id || model.cid || model.toString();
    if (!modelMap[id]) toRemove.push(model);
  });

  // remove & add models
  if (toRemove.length) this.silent(silent).remove.apply(this, toRemove);
  if (toAdd.length) this.silent(silent).push.apply(this, toAdd);
  this.silent(false);
  return this;
};

/**
 * reset modelArray
 */

ModelArray.prototype.reset = function (models) {
  [].splice.call(this, 0, this.length);
  this.silent().push(models);
  this.emit('reset', models, this);
};

/**
 * Wraps [`Array#push`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/push)
 * emit add event
 *
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
 * Wraps [`Array#pop`](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/pop)
 * emit remove event
 *
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
 * emit add and remove event
 *
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
 * emit add event
 *
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
 * emit remove event.
 *
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
 * emit sort event.
 */

ModelArray.prototype.sort = function (fn) {
  var compare = fn || (this.model && this.model.prototype && this.model.prototype.compare),
      ret = [].sort.call(this, compare);
  this.emit('sort', this);
  return ret;
};
