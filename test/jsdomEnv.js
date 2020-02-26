/* taken from https://github.com/simon360/jest-environment-jsdom-global/blob/master/environment.js

copied rather that used as dependency because this lib wants
jest-environment-jsdom installed separately as peer dependency
*/

const JSDOMEnvironment = require("jest-environment-jsdom");

class JSDOMEnvironmentGlobal extends JSDOMEnvironment {
    constructor(config) {
        super(config);
        this.global.jsdom = this.dom;
    }

    teardown() {
        this.global.jsdom = null;
        return super.teardown();
    }
}

module.exports = JSDOMEnvironmentGlobal;
