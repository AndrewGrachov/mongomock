var _ = require('./util');
var modifiers = require('./modifiers');

function Collection(initialArray){
	this._data = initialArray.slice();
	this._mutableData = initialArray.slice();
}

Collection.prototype._restore = function(){
	this._mutableData = this._data.slice();
}
Collection.prototype._find = function (query,options,callback){
	var filteredArray = _(this._mutableData.slice()).find(query);
	if(callback){
		this._restore();
		return callback(null,filteredArray);
	}
	else {
		this._mutableData = _(this._data).find(query);
		return this;
	}
}

Collection.prototype.find = function(){
	var args = Array.prototype.slice.call(arguments, 0);
	var callback,query,options;
	if(args.length ===1){
		callback = args[0];
		query = {};
		options = {};
		return this._find(query,options,callback);
	}
	else if (args.length==2){
		if(typeof args[1]==='function'){
			callback = args.pop();
			query = args.shift();
			options = {};
		}
		else{
			options = args.pop();
			query = args.shift();
		}
	}
	else if (args.length==3){
		callback = args.pop();
		query=args.shift();
		options= args.shift();
	}
	return this._find(query,options,callback);
}

Collection.prototype.findOne = function(query,callback){
	callback(null, _(this._data).findOne(query));
}

Collection.prototype.count = function(query,options,callback){
	if ('function' === typeof options) callback = options, options = {};
	if(options == null) options = {};
	if(!('function' === typeof callback)) callback = null;

	this.find(query,options,function(err,items){
		return callback(null,items.length);
	})
}

Collection.prototype.toArray = function(callback){
	if(callback){
		callback(null,this._mutableData);
	}
}

Collection.prototype.sort = function(){

}
Collection.prototype.skip = function(number){
	this._mutableData = this._mutableData.slice(0,number);
	return this;
}
Collection.prototype.limit = function(){

}
Collection.prototype.insert = function(doc,options,callback){
	if ('function' === typeof options) callback = options, options = {};
	if(options == null) options = {};
	if(!('function' === typeof callback)) callback = null;
	this._data.push(doc);
	this._restore();
	callback(null,doc);

}

Collection.prototype._updateDoc = function(doc,modifier){
	var self = this;
	Object.keys(modifier).forEach(function(key){
		if(!modifiers[key]){
			throw 'this modifier is not supported for now or invalid: '+ key
		}
		else{
			var modifiedDoc = modifiers[key](doc,modifier[key]);
			var index = self._data.indexOf(doc);
			self._data[index] = modifiedDoc;
		}
	});
	return;
}

Collection.prototype.update = function(query,modifier,options,callback){
	if ('function' === typeof options) callback = options, options = {};
	if(options == null) options = {};
	if(!('function' === typeof callback)) callback = null;
	var self = this;

	this._find(query,{},function(err,docs){
		var counter = 0;
		if(options.multi){
			docs.forEach(function(doc){
				self._updateDoc(doc,modifier);
				counter++;
			});
		}
		else {
			counter++;
			self._updateDoc(docs[0],modifier);
		}
		callback(null,counter);
	})

};

module.exports = Collection;