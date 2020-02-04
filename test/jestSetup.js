import enzymeAdapter from "enzyme-adapter-react-16";
import { shallow, mount, configure } from "enzyme";

// require("jest-enzyme"); //add enzyme matchers to global expect
require("core-js"); //need babel for newer ES features on older node versions

configure({ adapter: new enzymeAdapter() });

global.clearJestMocks = (...mocks) => {
	mocks.forEach((mock) => mock.mockClear());
};

global.shallow = shallow;
global.mount = mount;
