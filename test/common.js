/*jshint -W079 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.APP_ENV = process.env.APP_ENV || 'development';
var sinon = require('sinon');
global.sinon = sinon;
var chai = require('chai');
global.chai = chai;
global.expect = chai.expect;
global.should = chai.should();
chai.config.includeStack = true;
chai.use(require('sinon-chai'));
require('mocha');
