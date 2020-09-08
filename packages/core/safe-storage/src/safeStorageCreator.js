// @flow

export default (storageType: string) => {
	let isSupported = false;

	const checkSupport = () => {
		try {
			if (storageType in window) {
				const key = "__lsTest";
				window[storageType].setItem(key, `__test-${Date.now()}`);
				window[storageType].removeItem(key);
				isSupported = true;
			}
		}
		catch(ex){
			//fail silently
		}
	};

	checkSupport();

	const methods = ["key", "getItem", "setItem", "removeItem", "clear"];

	const safeStorage = methods.reduce((res, method) => {
		res[method] = (...args: mixed[]) =>
			isSupported ? window[storageType][method](...args) : null;

		return res;
	}, {});

	safeStorage.isSupported = isSupported;

	Object.defineProperty(safeStorage, "length", {
		get(){
			return isSupported ? window[storageType].length : 0;
		}
	});

	return safeStorage;
};

