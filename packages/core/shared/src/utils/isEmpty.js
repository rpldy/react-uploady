// @flow

type Empty = null | void;

function isEmpty (val: any): val is Empty { // eslint-disable-line
    return (val === null || val === undefined);
}

export default isEmpty;
