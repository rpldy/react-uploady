// @flow

//mock produce (used in production only)
//replaces real Immer produce by webpack at bundle time
export default (state: Object, updater: (Object) => void) => {
    updater(state);
    return state;
};
