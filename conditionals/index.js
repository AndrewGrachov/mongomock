module.exports ={
	'$gt':function(doc,field,value){
		return doc[field]>value;
	},
	'$gte':function(doc,field,value){
		return doc[field]>=value;
	},
	'$lt':function(doc,field,value){
		return doc[field]<value;
	},
	'$lte':function(doc,field,value){
		return doc[field]<=value;
	},

	'$in':function(doc,field,value){
		if(!value instanceof Array){
			throw 'should set an array for $in call'
		}
		if(doc[field] instanceof Array){
			return doc[field].some(function(docFieldItem){
				return value.some(function(valueFieldItem){
					return docFieldItem == valueFieldItem;
				});
			})
		}
		else{
			return value.some(function(valueItem){
				return doc[field] == valueItem;
			})
		}
	},
	'$regex':function(doc,field,value){
		return value.match(doc[field]);
	}

}