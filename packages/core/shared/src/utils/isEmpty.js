// @flow

//defined as function for flow's sake... (https://github.com/facebook/flow/issues/3635)
function isEmpty (val: any): boolean %checks {
    return (val === null || val === undefined);
}

export default isEmpty;
