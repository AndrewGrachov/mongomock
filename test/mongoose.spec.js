var MongoMock = require('../MongoMock');
var proxyquire = require('proxyquire');

describe('When trying to mock driver in mongoose', function () {
	var mongo;

	var db = {
	fruits:[{name:'Banana',price:20},{name:'Apple',price:10,tags:['Africa','Turkey']},{name:'Orange',price:25},{name:'Pineapple',price:20}],
	beverages:[{name:'CocaCola',price:15},{name:'MongoCola',price:10},{name:'Pepsi',price:25}]
	};

	mongo = new MongoMock(db);
	var mongoose = proxyquire('mongoose', {'mongodb': mongo});
	var Schema = mongoose.Schema;

	var fruitSchema = new Schema({
		name: {type: 'string'},
		price: {type: 'number'},
		tags: ['string']
	});
	var Fruit = mongoose.model('fruit', fruitSchema);

	var result;

	before(function () {
		mongoose.connect('anypath');
	});
	before(function (done) {
		Fruit.find(function (err, fruits) {
			result = fruits;
			done();
		});
	});

	it('should return fruit models collection', function () {
		console.log('result:', result);
	});
});