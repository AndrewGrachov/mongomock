var MongoMock = require('../MongoMock');

describe('Collection test', function () {
	var mongo, result;

	before(function () {
		var db = {
			fruits: [
				{name: 'Banana', price: 20},
				{name: 'Apple', price: 10, tags: ['Africa', 'Turkey'], dueDate:new Date("2020-01-15T00:00:00.000Z")},
				{name: 'Orange', price: 25, dueDate:new Date("2019-11-01T00:00:00.000Z")},
				{name: 'Pineapple', price: 20, dueDate:new Date("2019-12-10T00:00:00.000Z")}
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
			mongo.collection('fruits').find({}).toArray(function (err, data) {
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
			mongo.collection('fruits').find({price: 20}).toArray(function (err, fruits) {
				result = fruits;
				done();
			});
		});

		it('#should return 2 fruits with price 20', function () {
			result.should.have.length(2);
		});
	});

	describe('when filtering collection by date equal criteria', function () {

		before(function (done) {
			mongo.collection('fruits').find({dueDate: new Date("2019-11-01T00:00:00.000Z")}).toArray(function (err, fruits) {
				result = fruits;
				done();
			});
		});

		it('#should return 1 fruits with due date 01 Nov 2019', function () {
			result[0].name.should.equal('Orange');
		});
	});

	describe('when filtering collection by complex criteria', function () {

		before(function (done) {
			var criteria = {$or: [
				{price: {$gte: 25}} ,
				{tags: { $in: ['Turkey'] }}
			]};
			mongo.collection('fruits').find(criteria).toArray(function (err, fruits) {
				result = fruits;
				done();
			});
		});

		it('#should return 2 fruits, one with price 25 second one with tags containing "Turkey"', function () {
			result.should.have.length(2);
			//todo:update
		});

	});

	describe('when stream collection', function () {
		var cursor, matchcollection = [];
		before(function (done) {
			cursor = mongo.collection('beverages').find();
			cursor.on('data', function (doc) {
				matchcollection.push(doc);
			});
			cursor.on('end', done);
		});
		it('should stream all beverages collection', function () {
			matchcollection.should.have.length(3);
		});
	});

	describe('sort collection asceding', function () {
		before(function (done) {
			mongo.collection('fruits').find().sort({name:1}).toArray(function (err, fruits) {
				result = fruits;
				done();
			});
		});
		it('should show all fruits sorted', function () {
			result[0].name.should.equal('Apple');
		});
	});
	describe('sort collection desceding', function () {
		before(function (done) {
			mongo.collection('fruits').find().sort({price:-1}).toArray(function (err, fruits) {
				result = fruits;
				done();
			});
		});
		it('should show all fruits sorted', function () {
			result[0].name.should.equal('Orange');
		});
	});

	describe('cursor handling with hasNext/next', function () {
		before(function (done) {
			result = mongo.collection('fruits').find();
			done();
		});
		it('should iterate cursor item by item', function () {
			var totalPrice = 0;
			while (result.hasNext()) {
				var item = result.next();
				totalPrice+=item.price;
			}
			result.close();
			totalPrice.should.equal(75); // All fruit prices acumulated 20+10+25+20
		});
	});


});