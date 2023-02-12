// @flow

const pick = (obj: Object, props: string[]): ?Object =>
    obj && Object.keys(obj).reduce((res, key) => {
        if (~props.indexOf(key)) {
            res[key] = obj[key];
        }
        return res;
    }, ({}: { [string]: any }));

export default pick;
