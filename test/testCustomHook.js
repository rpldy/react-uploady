import React from "react";
import { isFunction } from "lodash";
import { mount } from "enzyme";

export default (hook, props, updateProps = null) => {
    let wrapper, hookResult, hookParams;

    if (isFunction(props)) {
        hookParams = props;
        props = {};
    }

    const Comp = (props) => {
        hookResult = hook(...(hookParams ? hookParams() : [props]));
        return null;
    };

    //have to use mount() because shallow() doesnt support useEffect - https://github.com/airbnb/enzyme/issues/2086
    wrapper = mount(<Comp {...props} />);

    if (updateProps) {
        wrapper.setProps(updateProps);
    }

    return {
        wrapper,
        hookResult,
    };
};
