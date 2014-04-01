var Collection = require("./Collection");

function MongoMock (collections){
	var self = this;
	Object.keys(collections).forEach(function(key){
		if(!collections[key] instanceof Array){
			throw key+" collection should be an array";
		}
		self[key] = new Collection(collections[key]);
	});
}
MongoMock.prototype.collection = function(collectionName){
	return this[collectionName];
}
module.exports = MongoMock;
