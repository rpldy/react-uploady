const _get = require("lodash/get");

class StoryLogError extends Error{
    constructor(msg, prev) {
        super(prev ? msg + " - " + prev.message : msg);

        if (prev) {
            this.stack = `${msg}
        ${prev.stack}`;
        }
    }
}

const isObject = (obj) => obj && typeof obj === "object";

const isContains = (a, b) => {
    let result = false;

    if (isObject(a) && isObject(b)) {
        const objEntries = Object.entries(b);

        result = !objEntries.length ||
            objEntries.every(([key, val]) => {
                return a[key] === val ||
                    (isObject(val) && isObject(a[key]) ?
                        isContains(a[key], val) : false);
            });
    }

    return result;
};

Cypress.Commands.add("storyLog", () =>
	(window.parent.__cypressResults ?
		cy.wrap(window.parent) : cy.window())
		.then((w) => {
            w.__cypressResults.storyLog._env = w.__cypressEnv;
			return w.__cypressResults.storyLog;
		}));

const serializeLog = (log) => {
    return log.map(({ args }, index) => `[${index}]=${args[0]}`).join(",");
}

const assertStartFinish = (storyLog, startIndex, prop, value) => {
    if (!isNaN(startIndex)) {
        expect(storyLog[startIndex]?.args[0]).to.equal("ITEM_START", `expect ITEM_START at: ${startIndex} in log: ${serializeLog(storyLog)}`);

        cy.wrap(storyLog[startIndex].args[1])
            .its(prop).should("eq", value);
    } else {
        startIndex = storyLog.findIndex(({ args }) => args[0] === "ITEM_START" && _get(args[1], prop) === value);

        expect(startIndex).to.be.above(-1, `expect to find ITEM_START for ${value} in log: ${serializeLog(storyLog)}`);
    }

    const itemId = storyLog[startIndex].args[1].id;

    const matchingFinish = storyLog
        .slice(startIndex + 1)
        .find((entry) =>
            entry.args[0] === "ITEM_FINISH" && entry.args[1].id === itemId);

    expect(matchingFinish, `expect matching ITEM_FINISH for ID: ${itemId} in log: ${serializeLog(storyLog)}`).to.exist;

    return cy.wrap({
        start: storyLog[startIndex],
        finish: matchingFinish
    });
};

Cypress.Commands.add("assertFileItemStartFinish", { prevSubject: true }, (storyLog, fileName, startIndex) => {
    console.log("assertFileItemStartFinish received log", storyLog);
    assertStartFinish(storyLog, startIndex, "file.name", fileName);
});

Cypress.Commands.add("assertUrlItemStartFinish", { prevSubject: true }, (storyLog, fileName, startIndex = 0) => {
    console.log("assertUrlItemStartFinish received log", storyLog);
    assertStartFinish(storyLog, startIndex, "url", fileName);
});

Cypress.Commands.add("assertLogEntryCount", { prevSubject: true }, (storyLog, count) => {
    expect(storyLog, `expect story log to have ${count} entries`).to.have.lengthOf(count);
});

Cypress.Commands.add("assertLogEntryContains", { prevSubject: true }, (storyLog, index, obj) => {
    const logLine = storyLog[index];

    const match = logLine.args.find((a) => isContains(a, obj));

    expect(match, `expect log line ${index} to contain obj`).to.exist;
});

Cypress.Commands.add("customAssertLogEntry", { prevSubject: true }, (storyLog, eventName, asserter, options = {}) => {
    let logLine;

    const invalid = storyLog.find((item) => !item);
    if (invalid) {
        throw new StoryLogError(`customAssertLogEntry: found issue with log: ${JSON.stringify(storyLog)}`);
    }

    try {
        if (options.all) {
            logLine = storyLog.filter((item) => item.args[0] === eventName).map((item) => item.args.slice(1));
        } else if (options.index) {
            logLine = storyLog[options.index];
            expect(logLine.args[0], `expect log line ${options.index} with ${logLine.args[0]} to equal = ${eventName}`).to.equal(eventName);
            logLine = logLine.args.slice(1);
        } else {
            logLine = storyLog.find((item) => item.args[0] === eventName).args.slice(1);
        }
    } catch (ex) {
        throw new StoryLogError(`Failed to custom assert log entry: ${eventName}. log[${storyLog.length} items]: ${JSON.stringify(storyLog)}`, ex)
    }

    asserter(logLine, storyLog._env);
});

const assertLogPattern = (storyLog, pattern, options = {}) => {
    options = Object.assign({}, {
        times: 1,
        index: -1,
        different: false,
    }, options);

    let between = options.between || [options.times, options.times];

    console.log("assertLogPattern received log", storyLog, options);

    const matches = storyLog.reduce((res, line, index) => {
        const arg = line.args.find((a) => typeof a === "string" && pattern.test(a));
        if (arg) {
            res.push({ arg, index });
        }
        return res;
    }, []);

    if (~options.index) {
        const inLine = matches.find(({index}) => index === options.index);
        expect(inLine.index, `expect pattern match to be in index: ${options.index}`).to.eq(options.index);
    } else {
        if (between[0] === between[1]) {
            expect(matches.length).to.equal(options.times, `expect to find match: ${pattern} in log ${options.times} times`);
        } else {
            expect(matches.length).least(between[0], `expect to find match: ${pattern} in log at least: ${between[0]} times`);
            expect(matches.length).most(between[1], `expect to find match: ${pattern} in log at most: ${between[1]} times`)
        }

        if (options.different) {
            const checked = [];
            const found = matches.find((m) => {
                const same = !!~checked.indexOf(m.arg); //check before we put into the checked array
                checked.push(m.arg);
                return same;
            });

            expect(found, "expect pattern matches to all be different").to.be.undefined
        }
    }

    return cy.wrap(matches);
}

Cypress.Commands.add("assertLogPattern", { prevSubject: true }, assertLogPattern);

Cypress.Commands.add("assertNoLogPattern", { prevSubject: true }, (storyLog, pattern, options = {}) =>
    assertLogPattern(storyLog, pattern, { ...options, times: 0 }));

Cypress.Commands.add("resetStoryLog", {prevSubject: true}, (storyLog) => {
	storyLog.splice(0, storyLog.length);
});
