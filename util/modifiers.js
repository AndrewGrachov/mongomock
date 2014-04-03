module.exports = {
	'$set': function(doc,modifier) {
		Object.keys(modifier).forEach(function(key) {
			doc[key] = modifier[key];
		});
		return doc;
	},
	'$unset': function(doc,modifier) {
		Object.keys(modifier).forEach(function(key) {
			delete doc[key];
		});
		return doc;
	},
	'$addToSet': function(doc,modifier) {
		Object.keys(modifier).forEach(function(key) {
			if(!doc[key] instanceof Array){
				throw '$addToSet called on non array property'+key;
			}

			var value = doc[key].find(function(item) {
				return item == modifier[key]; //todo:object equality;
			});

			if(!value){
				doc[key].push(modifier[key]);
			}
		});
		return doc;

	},
	'$inc': function(doc,modifier) {
		Object.keys(modifier).forEach(function(key) {
			doc[key]+=modifier[key];
		});
		return doc;
	}
};