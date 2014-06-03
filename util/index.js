var bson = require('bson');
var ObjectID = bson.ObjectID;
var objectUtil = require('./objectUtil');

var checkArrayPresence = function (doc, key, modifier) {
	var filtered = doc[key].filter(function (item) {
		return item == modifier[key];
	});

	return filtered.length > 0;
};

var modifiers = {
	'$set': function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			objectUtil.setProp(key)(doc, modifier[key]);
		});
		return doc;
	},

	'$unset': function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			objectUtil.deleteProp(doc, key);
		});
		return doc;
	},

	'$addToSet': function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			var docProperty = objectUtil.prop(key)(doc);
			if (!docProperty instanceof Array) {
				throw '$addToSet called on non array property' + key;
			}
			var isPresent;
			var modifierProperty = modifier[key];

			if (modifierProperty.$each && modifierProperty.$each instanceof Array) {
				modifierProperty.$each.forEach(function (modifierItem) {

					var mod = {};
					objectUtil.setProp(key)(mod, modifierItem);
					isPresent = checkArrayPresence(doc, key, mod);

					if (!isPresent) {
						docProperty.push(modifierItem);
					}
				});
			}
			else {
				isPresent = checkArrayPresence(doc, key, modifier);
				if (!isPresent) {
					docProperty.push(modifierProperty);
				}
			}
		});
		return doc;

	},

	'$inc': function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			var docProp = objectUtil.prop(key)(doc);
			var modifierValue = modifier[key];
			docProp += modifierValue;
		});
		return doc;
	},

	'$rename': function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			var newPropertyKey = objectUtil.prop(key)(modifier);
			objectUtil.renameProp(doc, key, newPropertyKey);
		});
		return doc;
	},

	$pop: function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			var property = objectUtil.prop(key)(doc);
			var modifierValue = modifier[key];

			if (!property instanceof Array) {
				throw "property " + key + " is not array";
			}

			if (modifierValue == 1) {
				property.pop();
			}

			else if (modifierValue == -1) {
				property.shift();
			}
		});

		return doc;
	},

	$push: function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			var property = objectUtil.prop(key)(doc);
			var modifierProperty = modifier[key];

			if (!property instanceof Array) {
				throw "property " + key + " is not array";
			}

			if (modifierProperty.$each && modifierProperty.$each instanceof Array) {
				modifierProperty.$each.forEach(function (modifierItem) {
					property.push(modifierItem);
				});
			}
			else {
				property.push(modifierProperty);
			}
		});

		return doc;
	},

	$pull: function (doc, modifier) {
		Object.keys(modifier).forEach(function (key) {
			var property = objectUtil.prop(key)(doc);
			var modifierProperty = modifier[key];

			if (!property instanceof Array) {
				throw "property " + key + "is not array";
			}

			var subCollection = new Wrap(property.slice());
			subCollection.remove(modifierProperty); //todo: UGLY AS SHIT
			objectUtil.setProp(key)(doc, subCollection._data);
		});

		return doc;
	}
};

var comparsionOperators = {
	'$gt': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		return property > value;
	},
	'$gte': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		return property >= value;
	},
	'$lt': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		return property < value;
	},
	'$lte': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		return property <= value;
	},

	'$in': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		if (!value instanceof Array) {
			throw 'should set an array for $in call';
		}
		if (property instanceof Array) {
			return property.some(function (docFieldItem) {
				return value.some(function (valueFieldItem) {
					return docFieldItem == valueFieldItem;
				});
			});
		}
		else {
			return value.some(function (valueItem) {
				return property == valueItem;
			});
		}
	},
	$nin: function (doc, field, value) {
		return !this.$in(doc, field, value);
	},
	'$regex': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		return value.test(property);
	},

	'$ne': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		return property != value;
	},

	'$exists': function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		return (property !== undefined) === value; //null values does not include
	},

	$size: function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		if (property && property.length) {
			return property.length === value;
		}
		return false;
	},

	$all: function (doc, field, value) {
		var property = objectUtil.prop(field)(doc);
		if (property) {
			return value.every(function (valueItem) {
				property.some(function (docFieldItem) {
					docFieldItem == valueItem;
				});
			});
		}
		return false;
	},

	$elemMatch: function (doc, field, condition) {
		var property = objectUtil.prop(field)(doc);
		if (property) {
			return property.some(function (element) {
				return _allKeysValid(condition, element);
			});
		}
		return false;
	}


};

var logicalOperators = {
	$or: function (doc, array) {
		return array.some(function (condition) {
			return _allKeysValid(condition, doc);
		});
	},

	$and: function (doc, array) {
		return array.every(function (condition) {
			return _allKeysValid(condition, doc);
		});
	},

	$not: function (doc, condition) {
		return !_allKeysValid(condition, doc);
	},

	$nor: function (doc, array) {
		return !this.$and(doc, array);
	}

};
//todo:wtf
function areEqual(field1, field2) {
	if (field1 instanceof ObjectID) {
		return field1.toString() === field2.toString();
	}

	return field1 == field2;
}

function _updateDoc(doc, modifier, wrapped) {
	var isUpdatingWholeDoc = Object.keys(modifier).every(function (key) {
		return !modifiers[key];
	});

	if (isUpdatingWholeDoc) {
		var index = wrapped._data.indexOf(doc);
		wrapped._data[index] = doc;
		return;
	}

	Object.keys(modifier).forEach(function (key) {
		if (!modifiers[key]) {
			throw 'this modifier is not supported for now or invalid: ' + key;
		}
		else {
			var modifierValue = modifier[key];
			var modifiedDoc = modifiers[key](doc, modifierValue);
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

function _allKeysValid(query, item) {

	if (typeof query !== 'object') {
		return query === item;
	}

	if (!query || !item) {
		return false;
	}

	function anyMatchOf(key, pathStep, item) {
		return item[pathStep].some(function (subArrayItem) {
			var subQueryKey = key.replace(new RegExp(pathStep + '\\.'), "");
			var subQuery = {};
			subQuery[subQueryKey] = query[key];

			return _allKeysValid(subQuery, subArrayItem);
		});
	}


	return Object.keys(query).every(function (key) {
		if (logicalOperators[key]) {
			return logicalOperators[key](item, query[key]);
		}
		// price:{gte:32}
		else if (typeof query[key] == 'object') {
			return Object.keys(query[key]).every(function (operator) {
				return comparsionOperators[operator](item, key, query[key][operator]);
			});
		}
		else if (typeof key === 'string' && new RegExp('.*\\..*').test(key)) {
			var properties = key.split('.');
			var path = [];


			for (var i = 0; i < properties.length; i++) {
				var property = properties[i];
				path.push(property);
				var pathStep = path.join(".");
				if (item[pathStep] instanceof Array) {
					var nextOperator = parseInt(properties[i + 1]);
					if (!isNaN(nextOperator)) {

						var subQueryKey = key.replace(new RegExp(pathStep + '\\.' + properties[i + 1] + '\\.'), "");
						var subQuery = {};
						subQuery[subQueryKey] = query[key];
						var subArrayItem = item[pathStep][properties[i + 1]];

						return _allKeysValid(subQuery, subArrayItem);
					} else {
						//key,pathStepitem
						return anyMatchOf(key, pathStep, item);
					}
				}
			}
		}

		return areEqual(query[key], item[key]);
	});
}

Wrap.prototype.find = function (query, options) {

	options = options || {};

	var filteredArray = this._data.filter(function (item) {
		return _allKeysValid(query, item);
	});

	if (options.skip) {
		filteredArray = filteredArray.slice(options.skip, filteredArray.length);
	}

	if (options.limit) {
		filteredArray.length = options.limit;
	}

	return filteredArray;
};

Wrap.prototype.findOne = function (query) {
	for (var i = 0; i < this._data.length; i++) {
		if (_allKeysValid(query, this._data[i])) {
			return this._data[i];
		}
	}
	return;
};

Wrap.prototype.update = function (query, modifier, options) {
	options = options || {};

	var self = this;
	var counter = 0;

	if (options.multi) {
		var docs = this.find(query, {});
		docs.forEach(function (doc) {
			_updateDoc(doc, modifier, self);
			counter++;
		});
	}
	else {
		var doc = this.findOne(query);
		if (doc) {
			counter++;
			_updateDoc(doc, modifier, self);
		}
	}
	if (counter === 0 && options.upsert) {
		if (modifier.$set) {
			counter++;
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

	for (var i = 0; i < docs.length; i++) {
		var doc = docs[i];
		var index = self._data.indexOf(doc);

		if (index !== -1) {
			self._data.splice(index, 1);
		}
	}

	return;
};

Wrap.prototype.findAndModify = function (query, modifier, options) {
	options = options || {};

	var doc = this.findOne(query);
	if (doc) {
		if (options.new) {
			_updateDoc(doc, modifier, this);
		}
		else {
			_updateDoc(JSON.parse(JSON.stringify(doc)), modifier, this);
		}
	}
	else if (!modifier.$set && options.upsert) {
		doc = this.insert(modifier);
	}
	return doc;
};

module.exports = Constructor;