// @flow

const getPropsExtractor = (prop: string | string[]) => {
    const props = [].concat(prop);

    return (arr: Object[]) =>
        arr.map((i) => props.map((p) => i[p]).join());
};

/*
stringifies props together - will return true for same type of value (ex: function)
even if refs are different
 */
export default (arr1: Object[], arr2: Object[], prop: string | string[]): boolean => {
    let diff = true;
    const propsExtractor = getPropsExtractor(prop);

    if (arr1 && arr2 && arr1.length === arr2.length) {
        const props1 = propsExtractor(arr1),
            props2 = propsExtractor(arr2);

        diff = !!props1.find((p, i) => p !== props2[i]);
    }

    return !diff;
};
