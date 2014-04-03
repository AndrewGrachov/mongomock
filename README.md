mongomock
=========

mock for mongoDb to use in unit tests
Trying to cover-up mongo native nodejs driver interface, to make support for proper unit testing without flooding the db.

#Dependencies
**bson**

#Usage

1. Download/clone repo.
2. Put anywhere and use as basic node module by calling
    ```require('./mongomock')``` for example.npm is on the way

#Getting started

```
var MongoMock = require('./mongomock');

//initial mock data
var db = {
	fruits:[{name:'Banana',price:20},{name:'Apple',price:10,tags:['Africa','Turkey']},
	{name:'Orange',price:25},{name:'Pineapple',price:20}],
	beverages:[{name:'CocaCola',price:15},{name:'MongoCola',price:10},{name:'Pepsi',price:25}]
}

var mongo = new MongoMock(db);

mongo.collection('fruits').find({price:20},function(err,fruits){
  console.log("YAHOO we have fruits with price 20 now!",fruits);
})
```

#Methods support
  **collection.find(query,options,callback)**

  **collection.findOne(query,callback)**

  **collection.update(query,modifier,options,callback)**

  **collection.insert(doc,callback)**

  **collection.remove(query,callback)**

  **collection.findAndModify(doc,modifier,options,callback)**

#Query operators support:
  **$gte**

  **$gt**

  **$lt**

  **$lte**

  **$in**

  **$regex**

  **$and

  **$or

#Modifier operators support
  **$set**

  **$unset**

  **$inc**

  **$addToSet**

#Todo
1. Date(and types) support
2. projections support

