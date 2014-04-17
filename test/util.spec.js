var _ = require('../util');
var expect = require('expect.js');

describe('mongo-query utility belt test',function () {
	var db = {
			fruits:[
					{name:'Banana', price:20,redundantField:'ololo'},
					{name:'Apple', price:10,tags:['Africa','Turkey']},
					{name:'Orange', price:20},
					{name:'Pineapple', price:20},
					{name: 'Cucumber', price:56, suppliers: [{name:"anonymous234",subSuppliers:[{name:"1",address:'blahblah'}]}]}
					],
			beverages:[ {name:'CocaCola',price:15,suppliers:['one','two','three']},
						{name:'MongoCola',price:10,suppliers:['one','two','three','four','five','six']},
						{name:'Pepsi',price:25,suppliers:['one','two','three','four','five']},
						{name: 'BoobCola',price:999,suppliers:['one','two','three']},
						{name: 'ZeroVatkaCola',price:1000,suppliers:['one','two','three'],someArray:['one','two','three']}
					]
		};

	describe('when querying with string expression on array elements',function() {

		var fruits = _(db.fruits).find({'suppliers.name':'anonymous234'});
		var subArrayFruit = _(db.fruits).findOne({'suppliers.subSuppliers.0.name':1});
		it('#should have length 1',function() {
			fruits.should.have.length(1);
		});

		it('#should query 1 fruit with array 2 level deep in array',function () {
			subArrayFruit.should.exist;
			subArrayFruit.should.have.property('name').equal('Cucumber');
		});
	});

	describe('when perfoming update operation',function(){

		describe('#when success case without multiple, update first element with price 20, change it to 30',function() {
			var counter =_(db.fruits).update({price:20},{$set:{price:30},$unset:{redundantField:1}});
			it('#should update 1 document',function() {
				counter.should.equal(1);
			});

			var modifiedDoc = _(db.fruits).findOne({name:'Banana'});
			it('#should have price 30',function() {
				modifiedDoc.should.have.property('price').equal(30);
				modifiedDoc.should.not.have.property('redundantField');
			});
		});

		describe('#when success case with multiple. Changing all prices with 20 to 30', function() {
			var counter = _(db.fruits).update({price:20},{$set: {price:30} },{ multi:true });
			it('#should update 2 documents',function () {
				counter.should.equal(2);
			});

			var docsWith20Price = _(db.fruits).find({price:20});
			it('#should have to fruits with price 20 left',function () {
				docsWith20Price.should.have.length(0);
			});
		});

		describe('#when no docs found and upsert isnt true',function () {
			var counter = _(db.fruits).update({price:20},{$set:{price:30,name:'modifiedFruit'}});
			it('#should return zero counter',function (){
				counter.should.equal(0);
			});

			var docs = _(db.fruits).find({name:'modifiedFruit'});
			it('#should have no fruits with name "modifiedFruit"',function () {
				docs.should.have.length(0);
			});
		});

		describe('#when no docs found and upsert is true',function () {
			var counter = _(db.fruits).update({price:20},{$set:{price:30,name:'modifiedFruit'}},{upsert:true});
			it('#should return 1 counter',function (){
				counter.should.equal(1);
			});

			var docs = _(db.fruits).find({name:'modifiedFruit'});
			it('#should have 1 fruit1 with name "modifiedFruit"',function () {
				docs.should.have.length(1);
			});
		});

		describe('#testing array modifiers',function() {

			describe('#testing $push modifier',function () {

				describe('#without $each',function() {
					_(db.beverages).update({name:'Pepsi'},{$push:{'suppliers':'six'}});

					var beverage = _(db.beverages).findOne({name:'Pepsi'});

					it('should have supplier named "six" in suppliers array',function (){
						beverage.suppliers.should.have.length(6);
					});
				});

				describe('#with $each modifier',function(){
					_(db.beverages).update({name:'MongoCola'},{$push:{'suppliers':{$each:['seven','eight','nine']}}});
					var beverage = _(db.beverages).findOne({name:'MongoCola'});

					it('should have suppliers field length === 9',function() {
						beverage.suppliers.should.have.length(9);
					});
				});
			});

			describe('#testing $addToSet modifier',function () {
				describe('#when element is not present',function() {
					_(db.beverages).update({name:'CocaCola'},{$addToSet:{suppliers:'four'}});
					var beverage = _(db.beverages).findOne({name:'CocaCola'});
					it('#should have supplier added',function() {
						beverage.suppliers.should.have.length(4);
					});
				});

				describe('#when element is present',function() {
					_(db.beverages).update({name:'BoobCola'},{$addToSet:{suppliers:'one'}});
					var beverage = _(db.beverages).findOne({name:'BoobCola'});
					it('#shouldnt have supplier added',function() {
						beverage.suppliers.should.have.length(3);
					});
				});

				describe('#when adding $each modifier',function() {
					_(db.beverages).update({name:'ZeroVatkaCola'},{$addToSet:{suppliers:{$each:['one','four','five']}}});
					var beverage = _(db.beverages).findOne({name:'ZeroVatkaCola'});

					it('#should insert 2 values and dont insert 1',function(){
						beverage.suppliers.should.have.length(5);
					});
				});

			});

			describe('#testing $pull modifier',function() {
				_(db.beverages).update({name:'ZeroVatkaCola'},{$pull:{someArray:'two'}});
				var doc = _(db.beverages).findOne({name:'ZeroVatkaCola'});
				it('#should pull two value',function() {
					doc.someArray.should.have.length(2);
				});
			});


		});
	});

	describe('when performing findAndModify operation', function () {
		describe('#when its not found', function () {
			var fruit = _(db.fruits).findAndModify({name:'somefuckingfruit'},{$set:{name:'ololo'}});

			it('should have fruit undefined',function (){
				expect(fruit).to.not.be;
			});
		});

		describe('#when its found and return modified object', function () {
			var beverage = _(db.beverages).findAndModify({name:'CocaCola'},{$set:{price:199}},{new:true});
			it('#should return new object',function () {
				beverage.should.have.property('price').equal(199);
			});
		});

		describe('#when its found and return non modified object', function () {
			var beverage = _(db.beverages).findAndModify({name:'MongoCola'},{$set:{price:199}});
			it('#should return new object',function () {
				beverage.should.have.property('price').equal(10);
			});
		});

		describe('#when its not found and upsert true', function () {
			var beverage = _(db.beverages).findAndModify({name:'someRandomBeverage'},{price:100,name:"someRandomFruit"},{upsert:true});
			it('#should return new object',function () {
				beverage.should.have.property('price',100);
				beverage.should.have.property('name','someRandomFruit');
			});

			it('#should add new object to collection',function () {
				var beverage = _(db.beverages).findOne({name:'someRandomFruit'});
				expect(beverage).to.be;
			});
		});
	});
});
