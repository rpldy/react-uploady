import enzymeAdapter from "enzyme-adapter-react-16";
import { shallow, mount, configure } from "enzyme";
import testCustomHook from "./testCustomHook";

require("core-js"); //need babel for newer ES features on older node versions

configure({ adapter: new enzymeAdapter() });

global.clearJestMocks = (...mocks) => {
	mocks.forEach((mock) => {
		if (mock) {
			if (mock.mockClear) {
				mock.mockClear();
			} else {
				global.clearJestMocks(...Object.values(mock));
			}
		}
	});
};

global.shallow = shallow;
global.mount = mount;
global.testCustomHook = testCustomHook;

process.on("unhandledRejection", (err) => {
	console.log("!!!!!!!! TEST OR CODE DIDNT HANDLE REJECTION !!!!!!! ", err);
	process.exit(1);
});
