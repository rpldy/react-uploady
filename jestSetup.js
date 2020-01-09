import enzymeAdapter from "enzyme-adapter-react-16";
import { shallow, configure } from "enzyme";

// require("jest-enzyme"); //add enzyme matchers to global expect
require("core-js"); //need babel for newer ES features on older node versions

// const enzR16Adapter = require("enzyme-adapter-react-16");
// global.enzyme = require("enzyme");
//
configure({ adapter: new enzymeAdapter() });

global.clearJestMocks = (...mocks) => {
	mocks.forEach((mock) => mock.mockClear());
};

global.shallow = shallow;