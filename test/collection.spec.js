var MongoMock = require('../MongoMock');

describe('Collection test', function () {
	var mongo, result;

	before(function () {
		var db = {
			fruits: [
				{name: 'Banana', price: 20},
				{name: 'Apple', price: 10, tags: ['Africa', 'Turkey']},
				{name: 'Orange', price: 25},
				{name: 'Pineapple', price: 20}
			],
			beverages: [
				{name: 'CocaCola', price: 15},
				{name: 'MongoCola', price: 10},
				{name: 'Pepsi', price: 25}
			]
		};
		mongo = new MongoMock(db);
	});

	it("#should have collection functionality", function () {
		mongo.collection('fruits').should.have.property('find');
		mongo.collection('fruits').should.have.property('findOne');
		mongo.collection('fruits').should.have.property('findAndModify');
		mongo.collection('fruits').should.have.property('update');
		mongo.collection('fruits').should.have.property('insert');
		mongo.collection('fruits').should.have.property('remove');
	});

	describe('when getting all collection by empty find criteria', function () {
		before(function (done) {
			mongo.collection('fruits').find({}, function (err, data) {
				result = data;
				done();
			});
		});

		it('#should return all collection', function () {
			result.should.have.length(4);
		});
	});

	describe('when filtering collection by basic criteria', function () {

		before(function (done) {
			mongo.collection('fruits').find({price: 20}, function (err, fruits) {
				result = fruits;
				done();
			});
		});

		it('#should return 2 fruits with price 20', function () {
			result.should.have.length(2);
		});
	});


	describe('when filtering collection by complex criteria', function () {

		before(function (done) {
			var criteria = {$or: [
				{price: {$gte: 25}} ,
				{tags: { $in: ['Turkey'] }}
			]};
			mongo.collection('fruits').find(criteria, function (err, fruits) {
				result = fruits;
				done();
			});
		});

		it('#should return 2 fruits, one with price 25 second one with tags containing "Turkey"', function () {
			result.should.have.length(2);
			//todo:update
		});

	});

});