/*global describe:true,beforeEach:true,afterEach:true,it:true*/

var ModelArray = require(this.window ? 'modelarray' : '..'),
    chai = require('chai'),
    expect = chai.expect,
    compare, json, users, pg, pg2, mehdi, jeremy, thomas, emit;

/**
 * User model
 */

function User(obj) {
  this.id = obj.id;
  this.cid = 'c' + obj.id;
  this.name = obj.name;
}

User.prototype.compare = function (u1, u2) {
  if (u1.name < u2.name)  return -1;
  if (u1.name > u2.name)  return 1;
  return 0;
};

User.prototype.toString = function () {
  return this.name;
};

User.prototype.set = function (obj) {
  this.name = obj.name;
  for (var ppty in obj) this[ppty] = obj[ppty];
};

User.prototype.toJSON = function () {
  return {
    id: this.id,
    name: this.name
  };
};

/**
 * Users collection
 */

function Users(values) {
  return ModelArray.call(this, values, User);
}

/*!
 * Inherit ModelArray
 */

Users.prototype.__proto__ = ModelArray.prototype;

/*!
 * scenarios
 */

var scenarios = [
  {
    name: 'array of User',
    init: function () {
      compare = null;
      jeremy = new User({id: 1, name: 'jeremy'});
      mehdi = new User({id: 2, name: 'mehdi'});
      pg = new User({id: 3, name: 'pg'});
      thomas = new User(4, 'thomas');
      pg2 = new User({id: 3, name: 'Pierre-Guillaume'});
      users = new Users([pg, mehdi, jeremy]);
      json = [pg.toJSON(), mehdi.toJSON(), jeremy.toJSON()];
    }
  },
  {
    name: 'array of Object',
    init: function () {
      compare = function (o1, o2) {
        if (o1.name < o2.name) return -1;
        if (o1.name > o2.name) return 1;
        return 0;
      };
      jeremy = {id: 1, name: 'jeremy'};
      mehdi = {id: 2, name: 'mehdi'};
      pg = {id: 3, name: 'pg'};
      thomas = {id: 4, name: 'thomas'};
      pg2 = {id: 3, name: 'Pierre-Guillaume'};
      users = new ModelArray([pg, mehdi, jeremy]);
      json = [pg, mehdi, jeremy];
    }
  },
  {
    name: 'array of Object (no id)',
    init: function () {
      compare = function (o1, o2) {
        if (o1.name < o2.name) return -1;
        if (o1.name > o2.name) return 1;
        return 0;
      };
      jeremy = {name: 'jeremy'};
      mehdi = {name: 'mehdi'};
      pg = pg2 = {name: 'pg'};
      thomas = {name: 'thomas'};
      users = new ModelArray([pg, mehdi, jeremy]);
      json = [pg, mehdi, jeremy];
    }
  },
  {
    name: 'array of String',
    init: function () {
      compare = null;
      pg =  pg2 = 'pg';
      mehdi = 'mehdi';
      jeremy = 'jeremy';
      thomas = 'thomas';
      users = new ModelArray([pg, mehdi, jeremy]);
      json = [pg, mehdi, jeremy];
    }
  },
  {
    name: 'array of Number',
    init: function () {
      compare = null;
      pg = pg2 = 3;
      mehdi = 2;
      jeremy = 1;
      thomas = 4;
      users = new ModelArray([pg, mehdi, jeremy]);
      json = [pg, mehdi, jeremy];
    }
  },
  {
    name: 'array of Date',
    init: function () {
      compare = function (d1, d2) {
        if (d1 < d2) return -1;
        if (d1 > d2) return 1;
        return 0;
      };

      pg = pg2 = new Date('2012-01-01');
      mehdi = new Date('2011-01-01');
      jeremy = new Date('2010-01-01');
      thomas = new Date('2013-01-01');
      users = new ModelArray([pg, mehdi, jeremy]);
      json = [pg.toJSON(), mehdi.toJSON(), jeremy.toJSON()];
    }
  }
];

scenarios.forEach(function (scenario) {

  describe(scenario.name, function () {

    beforeEach(function () {
      scenario.init();
      emit = 0;
    });

    afterEach(function () {
      users.off();
      users = null;
    });

    it('should behave like an array', function () {
      expect(users).to.be.an.instanceof(Array);
      expect(users).to.be.an.instanceof(ModelArray);
      expect(users).to.have.length(3);
      expect(Array.isArray(users)).to.be.ok;
    });

    it('should get', function () {
      expect(users.get(pg)).to.eq(pg);
      if (pg.id) expect(users.get(pg.id)).to.eq(pg);
      if (pg.id) expect(users.get({id: pg.id})).to.eq(pg);
      if (pg.cid) expect(users.get({cid: pg.cid})).to.eq(pg);
    });

    it('should remove', function () {
      users.on('remove', function (models) {
        expect(models).to.have.length(2);
        expect(models[0]).to.eq(pg);
        expect(models[1]).to.eq(mehdi);
        emit++;
      });
      users.remove(pg, mehdi, mehdi);

      expect(emit).to.eq(1);
      expect(users).to.have.length(1);
    });

    it('should set', function () {
      users
        .on('remove', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(mehdi);
          emit++;
        })
        .on('add', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(thomas);
          emit++;
        })
        .set([pg2, thomas, jeremy, jeremy]);

      expect(users).to.have.length(3);
      expect(users.get(pg).name).to.eq(pg2.name);
      expect(emit).to.eq(2);
    });

    it('should reset', function () {
      users
        .on('reset', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(thomas);
        })
        .reset([thomas]);
      expect(users).to.have.length(1);
    });

    it('should push', function () {
      users.on('add', function (models) {
        expect(models).to.have.length(1);
        expect(models[0]).to.eq(thomas);
        emit++;
      }).push(thomas, pg);
      expect(users).to.have.length(4);
      expect(emit).to.eq(1);
    });

    it('should add an array of items', function () {
      users.on('add', function (models) {
        expect(models).to.have.length(1);
        expect(models[0]).to.eq(thomas);
        emit++;
      }).add([thomas, pg]);
      expect(users).to.have.length(4);
      expect(emit).to.eq(1);
    });

    it('should add single item', function () {
      users.on('add', function (models) {
        expect(models).to.have.length(1);
        expect(models[0]).to.eq(thomas);
        emit++;
      }).add(thomas);
      expect(users).to.have.length(4);
      expect(emit).to.eq(1);
    });

    it('should pop', function () {
      users.on('remove', function (model) {
        expect(model).to.eq(jeremy);
        emit++;
      }).pop();
      expect(users).to.have.length(2);
      expect(emit).to.eq(1);
    });

    it('should splice', function () {
      users
        .on('remove', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(mehdi);
          emit++;
        })
        .on('add', function (models) {
          expect(models).to.have.length(1);
          expect(models[0]).to.eq(thomas);
          emit++;
        })
        .splice(1, 1, thomas, pg);
      expect(users).to.have.length(3);
      expect(emit).to.eq(2);
    });

    it('should unshift', function () {
      users.on('add', function (models) {
        expect(models).to.have.length(1);
        expect(models[0]).to.eq(thomas);
        emit++;
      }).unshift(thomas, pg);
      expect(users).to.have.length(4);
      expect(emit).to.eq(1);
    });

    it('should shift', function () {
      users.on('remove', function (model) {
        expect(model).to.eq(pg);
        emit++;
      }).shift();
      expect(users).to.have.length(2);
      expect(emit).to.eq(1);
    });

    it('should sort', function () {
      users.on('sort', function () {
        emit++;
      }).sort(compare);
      expect(users.slice()).to.deep.eq([jeremy, mehdi, pg]);
      expect(emit).to.eq(1);
    });

    it('should convert to JSON', function () {
      expect(users.toJSON()).to.deep.eq(json);
    });

  });
});



