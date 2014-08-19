var Collection = require("./Collection");

function MongoMock (collections) {
	var self = this;
	Object.keys(collections).forEach(function(key) {
		if(!collections[key] instanceof Array){
			throw key+" collection should be an array";
		}
		self[key] = new Collection(collections[key]);
	});
}

MongoMock.prototype.collection = function(collectionName, callback) {
	if(!callback) {
		return this[collectionName];
	}
	return callback(null, this[collectionName]);
};

MongoMock.prototype.ensureIndex = function (collection, index, options, callback) {
	callback(null, index);
};

module.exports = MongoMock;