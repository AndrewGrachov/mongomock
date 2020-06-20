var MongoMock = require('./MongoMock');

var db = {
	fruits: [
		{name: 'Banana', price: 20, something: [{name: 2}]},
		{name: 'Apple', price: 10, tags: ['Africa', 'Turkey'], something: [{name: 1}]},
		{name: 'Orange', price: 25},
		{name: 'Pineapple', price: 20},
	],
	beverages: [
		{name: 'CocaCola', price: 15},
		{name: 'MongoCola', price: 10},
		{name: 'Pepsi', price: 25},
	],
};

var mongo = new MongoMock(db);

mongo.collection('fruits').findAndModify({name: 'Banana'}, {$set: {price: 50}}, function (err, doc) {
	console.log('fruit:', doc);
});

mongo.collection('fruits').find({something: {$elemMatch: {name: 1}}}, function (err, fruits) {
	console.log('fruits:', fruits);
});
