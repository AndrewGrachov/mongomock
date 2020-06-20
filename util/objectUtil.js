function deepClone(object) {
	return JSON.parse(JSON.stringify(object));
}

function prop(name) {
	var propertiesArray = name.split('.');
	return function (object) {
		if (!object) {
			return;
		}
		var property = object;
		for (var i = 0; i < propertiesArray.length; i++) {
			if (typeof propertiesArray[i + 1] === 'number' && propertiesArray[i] instanceof Array) {
				property = property[propertiesArray[i]][propertiesArray[i + 1]];
				i++;
			} else {
				property = property[propertiesArray[i]];

				if (typeof property === 'undefined') {
					return;
				}

				if (property === null) {
					if (i + 1 === propertiesArray.length) {
						return null;
					} else {
						return;
					}
				}
			}
		}
		return property;
	};
}

function setProp(name) {
	var propertiesArray = name.split('.');
	return function (object, value) {
		if (!object) {
			return;
		}
		var property = object;
		for (var i = 0; i < propertiesArray.length - 1; i++) {
			if (typeof property[propertiesArray[i]] === 'undefined') {
				property[propertiesArray[i]] = {};
			}
			property = property[propertiesArray[i]];
		}
		property[propertiesArray[i]] = value;
		return value;
	};
}

function addPropIfNotExist(obj, prop, value) {
	if (obj instanceof Object && !(prop in obj)) {
		obj[prop] = value;
	}
	return obj;
}

function renameProp(obj, oldProp, newProp) {
	var oldPropertyValue = prop(oldProp)(obj);
	setProp(newProp)(obj, oldPropertyValue);
	deleteProp(oldProp)(obj);
	return obj;
}

function deleteProp(obj, oldProp) {
	setProp(oldProp)(obj, void 0);
	return obj;
}

function addArrayItemsPropIfNotExist(arr, prop, value) {
	if (arr instanceof Array) {
		arr.forEach(function (item) {
			addPropIfNotExist(item, prop, value);
		});
	}
	return arr;
}

function renameArrayItemsProp(arr, oldProp, newProp) {
	if (arr instanceof Array) {
		arr.forEach(function (item) {
			renameProp(item, oldProp, newProp);
		});
	}
	return arr;
}

function deleteArrayItemsProp(arr, oldProp) {
	if (arr instanceof Array) {
		arr.forEach(function (item) {
			deleteProp(item, oldProp);
		});
	}
	return arr;
}

module.exports = {
	deepClone: deepClone,
	prop: prop,
	setProp: setProp,
	addPropIfNotExist: addPropIfNotExist,
	renameProp: renameProp,
	deleteProp: deleteProp,
	addArrayItemsPropIfNotExist: addArrayItemsPropIfNotExist,
	renameArrayItemsProp: renameArrayItemsProp,
	deleteArrayItemsProp: deleteArrayItemsProp,
};
