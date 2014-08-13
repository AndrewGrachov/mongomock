//cowboy cursor mock
var util = require('util');
var _q = require('./util');
var ReadableStream = require('stream').Readable;
function map(fields) {
	var keys = Object.keys(fields);
	var exclude = keys.every(function(key) {
		return fields[key] === -1;
	});
	var include = keys.every(function(key) {
		return !!fields[key] && fields[key] !== -1;
	});
	if(!exclude && !include) {
		throw 'you can either select fields to include, or select fields to exclude';
	}
	return function(doc) {
		var mapped = {};

		if (exclude) {
			keys.forEach(function (key) {
				delete doc[key];
			});
			return doc;
		}

		keys.forEach(function (key) {
			mapped[key] = doc[key];
		});
		return mapped;
	};
}

var Cursor = function (source, query, fields, options) {
	this._fields = fields || {};
	this._source =_q(source).find(query, options);
	this.index = 0;
	ReadableStream.call(this, {objectMode: true});
};

util.inherits(Cursor, ReadableStream);

Cursor.prototype._read = function () {
	var self = this;

	if (this.index < this._source.length) {
		//mock 'reading time' 
		setTimeout(function () {
			self.push(map(self._fields)(self._source[self.index]));
			self.index++;
		},5);
	} else {
		self.push(null);
	}
};

Cursor.prototype.toArray = function (callback) {
	var docs = this._source.map(map(this._fields));
	callback(null, docs);
};


module.exports = Cursor;