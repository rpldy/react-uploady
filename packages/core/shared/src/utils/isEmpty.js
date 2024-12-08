// @flow

type Empty = null | void;

function isEmpty (val: any): val is Empty {
    return (val === null || val === undefined);
}

export default isEmpty;
