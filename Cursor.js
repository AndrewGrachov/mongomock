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
	this.data = null;
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
	if (this.data===null) {
		this.data = this._source.map(map(this._fields));
	}
	callback(null, this.data);
};

Cursor.prototype.sort = function(sortObj) {
	if (this.data===null) {
		this.data = this._source.map(map(this._fields));
	}
	this.data = this.data.sort(function(i1,i2){
		for (var d in sortObj) {
			if (sortObj.hasOwnProperty(d)) {
				if (i1[d]>i2[d]) {
					return sortObj[d];
				}
				if (i1[d]<i2[d]) {
					return -1*sortObj[d];
				}
			}
		}
		return 0;
	});
	return this;
};

Cursor.prototype.hasNext = function() {
	if (this.data===null) {
		this.data = this._source.map(map(this._fields));
	}
	return this.index<this.data.length;
};

Cursor.prototype.next = function() {
	if (this.data===null) {
		this.data = this._source.map(map(this._fields));
	}
	var dat = this.data[this.index];
	this.index++;
	return dat;
};

Cursor.prototype.batchSize = function() {
	return this;
};

Cursor.prototype.addCursorFlag = function() {
	return this;
};

Cursor.prototype.close = function() {

};



module.exports = Cursor;