var conditionals = require("../conditionals");

function Wrap(array){
	this._data = array;
	return this;
}

function Constructor(array){
	return new Wrap(array);
}

function _allKeysValid(query,item){
	return Object.keys(query).every(function(key){
		// price:{gte:32}
		if(typeof query[key]=='object'){
			return Object.keys(query[key]).every(function(operator){
				return conditionals[operator](item,key,query[key][operator]);
			});
		}
		return query[key] == item[key];
	});
}

Wrap.prototype.find = function(query){
	var newArr = this._data.filter(function(item){
		return _allKeysValid(query,item)
	});

	return newArr;
}
Wrap.prototype.findOne = function(query){
	for(var i=0;i<this._data.length;i++){
		if(_allKeysValid(query,this._data[i])){
			return this._data[i];
		}
	}
	return;
}

module.exports = Constructor;