/*!
 * parameter - benchmark.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var p = require('./');
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var data = {
  id: '043624',
  nick: '苏千',
  date: '2013-06-25',
  time: '2013-06-25 01:12:22',
  age: 29,
  sid1: 123,
  sid2: '123',
  sid3: 'foo'
};

var ruleId1 = {id: p.Id};
var ruleId2 = {id: {type: p.Id}};
var ruleId3 = {id: {isId: true}};
var ruleDate1 = {date: p.Date};
var ruleDate2 = {date: {type: p.Date}};
var ruleDate3 = {date: {isDate: true}};
var ruleDateTime1 = {time: p.DateTime};
var ruleDateTime2 = {time: {type: p.DateTime}};
var ruleDateTime3 = {time: {isDateTime: true}};
var ruleNumber1 = {age: "number"};
var ruleNumber2 = {age: {type: "number"}};
var ruleSting1 = {nick: "string"};
var ruleSting2 = {nick: {type: "string"}};
var ruleRequireFalse = {not_exists: "string", required: false};
var ruleRegex1 = {sid1: /^\d+$/};
var ruleRegex2 = {sid2: { type: /^\d+$/ }};
var ruleRegex5 = {sid2: { type: /^\d+$/, message: 'should be digital' }};
var ruleRegex3 = {sid3: /^\d+$/};
var ruleRegex4 = {sid3: { type: /^\d+$/, message: 'should be digital' }};

suite
.add('rules pass: {id: p.Id}', function () {
  p.verify(data, ruleId1);
})
.add('rules pass: {id: {type: p.Id}}', function () {
  p.verify(data, ruleId2);
})
.add('rules pass: {id: {idId: true}}', function () {
  p.verify(data, ruleId3);
})

.add('rules pass: {date: p.Date}', function () {
  p.verify(data, ruleDate1);
})
.add('rules pass: {date: {type: p.Date}}', function () {
  p.verify(data, ruleDate2);
})
.add('rules pass: {date: {isDate: true}}', function () {
  p.verify(data, ruleDate3);
})

.add('rules pass: {time: p.DateTime}', function () {
  p.verify(data, ruleDateTime1);
})
.add('rules pass: {time: {type: p.DateTime}}', function () {
  p.verify(data, ruleDateTime2);
})
.add('rules pass: {time: {isDateTime: true}}', function () {
  p.verify(data, ruleDateTime3);
})

.add('rules pass: {age: "number"}', function () {
  p.verify(data, ruleNumber1);
})
.add('rules pass: {age: {type: "number"}}', function () {
  p.verify(data, ruleNumber2);
})
.add('rules pass: {nick: "string"}', function () {
  p.verify(data, ruleSting1);
})
.add('rules pass: {nick: {type: "string"}}', function () {
  p.verify(data, ruleSting2);
})
.add('rules pass: {not_exists: "string", required: false}', function () {
  p.verify(data, ruleRequireFalse);
})

.add('rules pass: {age: /^\\d+$/}', function () {
  p.verify(data, ruleRegex1);
})
.add('rules pass: {age: {type: /^\\d+$/}}', function () {
  p.verify(data, ruleRegex2);
})
.add('rules pass: {age: {type: /^\\d+$/, message: "should be digital"}}', function () {
  p.verify(data, ruleRegex5);
})
.add('rules fail: {age: {type: /^\\d+$/}}', function () {
  p.verify(data, ruleRegex3);
})
.add('rules fail: {age: {type: /^\\d+$/, message: "should be digital"}}', function () {
  p.verify(data, ruleRegex4);
})

// add listeners
.on('cycle', function (event) {
  console.log(String(event.target));
})
.on('complete', function () {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run({ async: false });
