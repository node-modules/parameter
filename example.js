var Parameter = require('./');

var rule = {
  name: 'string',
  age: {type: 'int', max: 200},
  gender: ['male', 'female'],
  working: 'boolean',
  salary: {type: 'number', min: 0},
  birthday: 'date',
  now: 'dateTime',
  id: 'id',
  childrens: {
    type: 'array',
    itemType: 'object',
    required: false,
    rule: {
      name: 'string',
      age: { type: 'int', customMsg: 'age must be an integer!!!!' },
      gender: ['male', 'female'],
      birthday: {type: 'date', required: false}
    }
  },
  mate: {
    type: 'object',
    required: false,
    rule: {
      name: 'string',
      age: 'int',
      gender: ['male', 'female'],
      birthday: {type: 'date', required: false}
    }
  }
};

var valid = {
  name: 'foo',
  gender: 'male',
  age: 30,
  working: true,
  salary: 10000.1,
  birthday: '1990-01-01',
  now: '2015-01-07 00:00:00',
  id: '052111',
  childrens: [{
    name: 'bar1',
    age: 1,
    gender: 'female',
    birthday: '2014-01-01'
  }, {
    name: 'bar2',
    age: 2,
    gender: 'male',
    birthday: '2013-01-01'
  }],
  mate: {
    name: 'hee',
    age: 29,
    gender: 'female'
  }
};

var invalid = {
  name: 1,
  gender: 'male1',
  age: 300,
  working: 'true',
  salary: '10000.1',
  birthday: '1990-01-011',
  id: '052111x',
  childrens: [{
    name: 'bar1',
    gender: 'female',
    birthday: '2014-01-01'
  }, {
    name: 'bar2',
    age: 2,
    birthday: '2013-01-01'
  }],
  mate: {
    age: 29,
    gender: 'female'
  }
};

var p = new Parameter();

console.log('valid object result: ', p.validate(rule, valid));
console.log('invalid object result: ', p.validate(rule, invalid));
