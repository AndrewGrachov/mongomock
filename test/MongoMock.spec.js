var MongoMock = require('../MongoMock');
var Collection = require('../Collection');

describe('When creating MongoMock', function () {
	var mongo;

	var db = {
		fruits: [
			{name: 'Banana', price: 20},
			{name: 'Apple', price: 10, tags: ['Africa', 'Turkey']},
			{name: 'Orange', price: 25},
			{name: 'Pineapple', price: 20},
		],
		beverages: [
			{name: 'CocaCola', price: 15},
			{name: 'MongoCola', price: 10},
			{name: 'Pepsi', price: 25},
		],
	};

	mongo = new MongoMock(db);

	it('#should return MongoMock object', function () {
		mongo.should.have.property('collection');
		mongo.collection.should.be.a('function');
	});

	it('#should return Collection object on collection call', function () {
		mongo.collection('fruits').should.be.instanceof(Collection);
	});
});
