import React from "react";
import { mount } from "enzyme";

export default (runHook, updateProps = null) => {
	let wrapper, hookResult;

	const Comp = () => {
		hookResult = runHook();
		return null;
	};

	//have to use mount() because shallow() doesnt support useEffect - https://github.com/airbnb/enzyme/issues/2086
	wrapper = mount(<Comp />);

	if (updateProps) {
		wrapper.setProps(updateProps);
	}

	return {
		wrapper,
		hookResult,
	};
};