var modifiers = require('./modifiers');
var bson = require('bson');
var ObjectID = bson.ObjectID;

var comparsionOperators = {
	'$gt': function(doc, field, value) {
		return doc[field]>value;
	},
	'$gte': function(doc, field, value) {
		return doc[field]>=value;
	},
	'$lt': function(doc, field, value) {
		return doc[field]<value;
	},
	'$lte': function(doc, field, value) {
		return doc[field]<=value;
	},

	'$in': function(doc, field, value) {
		if(!value instanceof Array){
			throw 'should set an array for $in call';
		}
		if(doc[field] instanceof Array){
			return doc[field].some(function(docFieldItem) {
				return value.some(function(valueFieldItem) {
					return docFieldItem == valueFieldItem;
				});
			});
		}
		else{
			return value.some(function(valueItem) {
				return doc[field] == valueItem;
			});
		}
	},
	$nin: function(doc, field, value) {
		return !this.$in(doc, field, value);
	},
	'$regex': function(doc, field, value) {
		return value.test(doc[field]);
	},

	'$ne': function(doc, field, value) {
		return doc[field] != value;
	},

	'$exists': function(doc, field, value) {
		return (doc[field] !== undefined) === value; //null values does not include
	},

	$size: function(doc, field, value) {
		if (doc[field] && doc[field].length ) {
			return doc[field].length === value;
		}
		return false;
	},

	$all: function(doc, field, value) {
		if (doc[field]) {
			return value.every(function (valueItem) {
				doc[field].some(function (docFieldItem) {
					docFieldItem == valueItem;
				});
			});
		}
		return false;
	},

	$elemMatch: function(doc, field, condition) {
		if(doc[field]){
		return doc[field].some(function (element) {
			return _allKeysValid(condition,element);
			});
		}
		return false;
	}


};

var logicalOperators = {
	$or: function(doc,array) {
		return array.some(function (condition) {
			return _allKeysValid(condition,doc);
		});
	},

	$and: function(doc,array) {
		return array.every(function (condition) {
			return _allKeysValid(condition,doc);
		});
	},

	$not: function(doc, condition) {
		return !_allKeysValid(condition,doc);
	},

	$nor: function(doc,array) {
		return !this.$and(doc,array);
	}

};
//todo:wtf
function areEqual (field1,field2) {
	if (field1 instanceof ObjectID) {
		return field1.toString() === field2.toString();
	}

	return field1 == field2;
}

function _updateDoc(doc,modifier,wrapped) {

	Object.keys(modifier).forEach(function(key) {
		if(!modifiers[key]){
			throw 'this modifier is not supported for now or invalid: '+ key;
		}
		else {
			var modifiedDoc = modifiers[key](doc,modifier[key]);
			var index = wrapped._data.indexOf(doc);
			wrapped._data[index] = modifiedDoc;
		}
	});
	return;
}


function Wrap(array) {
	this._data = array;
	return this;
}

function Constructor(array) {
	return new Wrap(array);
}

function _allKeysValid(query,item) {
	return Object.keys(query).every(function(key) {
		if (logicalOperators[key]){
			return logicalOperators[key](item,query[key]);
		}
		// price:{gte:32}
		else if(typeof query[key]=='object') {
			return Object.keys(query[key]).every(function(operator){
				return comparsionOperators[operator](item,key,query[key][operator]);
			});
		}
		return areEqual (query[key], item[key]);
	});
}

Wrap.prototype.find = function(query,options) {
	var filteredArray = this._data.filter(function(item){
		return _allKeysValid(query,item);
	});

	if (options.skip) {
		filteredArray = filteredArray.slice(options.skip,filteredArray.length);
	}

	if (options.limit) {
		filteredArray.length = options.limit;
	}

	return filteredArray;
};

Wrap.prototype.findOne = function(query) {
	for (var i=0; i<this._data.length; i++) {
		if (_allKeysValid(query,this._data[i])) {
			return this._data[i];
		}
	}
	return;
};

Wrap.prototype.update = function (query,modifier,options) {
	var self = this;
	var counter = 0;

	if (options.multi) {
		var docs = this.find(query,{});
		docs.forEach(function(doc) {
			_updateDoc(doc,modifier,self);
				counter++;
		});
	}
	else {
		var doc = this.findOne(query);
		if (doc) {
			counter++;
			_updateDoc(doc,modifier,self);
		}
	}
	if(counter === 0 && options.upsert) {
		if(modifier.$set){
			this.insert(modifier.$set);
		}
	}
	return counter;
};

Wrap.prototype.insert = function (doc) {
	if (!doc._id || !doc._id instanceof ObjectID) {
		doc._id = new bson.ObjectId();
	}
	this._data.push(doc);
	return doc;
};

Wrap.prototype.remove = function (query) {
	var self = this;
	var docs = this.find(query);

	docs.forEach(function(doc) {
		self._data = self._data.splice(self._data.indexOf(doc),1);
	});
	return;
};

Wrap.prototype.findAndModify = function (query,modifier,options) {
	options = options || {};

	var doc = this.findOne(query);
	if (doc) {
		_updateDoc(doc,modifier,this);
	}
	return doc;
};

module.exports = Constructor;