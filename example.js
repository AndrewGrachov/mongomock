var MongoMock = require('./MongoMock');

var db = {
	fruits:[{name:'Banana',price:20},{name:'Apple',price:10,tags:['Africa','Turkey']},{name:'Orange',price:25},{name:'Pineapple',price:20}],
	beverages:[{name:'CocaCola',price:15},{name:'MongoCola',price:10},{name:'Pepsi',price:25}]
}

var mongo = new MongoMock(db);

mongo.collection('fruits').find({price:20},function(err,fruits){
	console.log("fruits with price 20:",fruits);

	mongo.collection('fruits').insert({name:'InsertedFruit',price:56,number:1,noNeedField:"something"},function(err,fruit){
		console.log("inserted");

		mongo.collection('fruits').find({price:56},function(err,fruits){
			console.log("new insterted fruits:",fruits);
		})

		mongo.collection('fruits').update({price:56},{$set:{price:99},$inc:{number:1},$unset:{noNeedField:1}},function(err,updatesCount){
			console.log("updates count:",updatesCount);

			mongo.collection('fruits').find({},function(err,fruits){
				console.log("updated fruits:",fruits);

				mongo.collection('fruits').find({price:{$gte:20}},function(err,fruits){
					console.log("fruits with price greater than 20:",fruits);

					mongo.collection('fruits').find({name:{$in:['Banana']}},function(err,fruits){
						console.log("$in test on banana:",fruits);
						mongo.collection('fruits').find({tags:{$in:['Africa']}},function(err,fruits){
							console.log("$in test array to array:",fruits);

							mongo.collection('fruits').findOne({price:20},function(err,fruit){
								console.log("find one query, first item with 20 price:",fruit);

								mongo.collection('fruits').count({price:{$gte:20}},function(err,count){
									console.log('count fruits with price greater than 20:',count);
								});
							})
						})
					})
				});
			})
		})
	})
})

