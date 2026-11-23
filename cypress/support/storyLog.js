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

//a query, so it re-reads the log on every retry (the decorator replaces the array on each story render)
Cypress.Commands.addQuery("storyLog", () => () => {
    const w = window.parent.__cypressResults ? window.parent : cy.state("window");
    w.__cypressResults.storyLog._env = w.__cypressEnv;
    return w.__cypressResults.storyLog;
});

//assert functions throw on failure and never call cy.*, so they can run inside .should() which re-reads the log and retries until they pass or time out
//.should() and not a query: a query logs every expect() of every retry to the command log
const addLogAssert = (name, assert) =>
    Cypress.Commands.add(name, { prevSubject: true }, (storyLog, ...args) => {
        let result;

        return cy.storyLog()
            .should((log) => {
                result = assert(log, ...args);
            })
            .then(() => result);
    });

const serializeLog = (log) => {
    return log.map(({ args }, index) => `[${index}]=${args[0]}`).join(",");
};

const findItemStartIndex = (storyLog, prop, value, after = -1) => {
    const finder = ({ args }) => args[0] === "ITEM_START" && _get(args[1], prop) === value;
    return ~after ?
        storyLog.slice(after).findIndex(finder) + after :
        storyLog.findIndex(finder);
};

const assertStartFinish = (storyLog, startIndex, prop, value, after = false) => {
    if (!isNaN(startIndex)) {
        if (after) {
            const afterIndex = startIndex;
            startIndex = findItemStartIndex(storyLog, prop, value, afterIndex);
            expect(startIndex).to.be
                .above(afterIndex, `expect to find ITEM_START for ${value} in log: ${serializeLog(storyLog)} after index: ${afterIndex}`);
        } else {
            expect(storyLog[startIndex]?.args[0]).to.equal("ITEM_START", `expect ITEM_START at: ${startIndex} in log: ${serializeLog(storyLog)}`);
            expect(_get(storyLog[startIndex].args[1], prop)).to.equal(value, `expect ${prop} at index: ${startIndex} to equal: ${value}`);
        }
    } else {
        startIndex = findItemStartIndex(storyLog, prop, value);

        expect(startIndex).to.be.above(-1, `expect to find ITEM_START for ${value} in log: ${serializeLog(storyLog)}`);
    }

    const itemId = storyLog[startIndex].args[1].id;

    const matchingFinish = storyLog
        .slice(startIndex + 1)
        .find((entry) =>
            entry.args[0] === "ITEM_FINISH" && entry.args[1].id === itemId);

    expect(matchingFinish, `expect matching ITEM_FINISH for ID: ${itemId} in log: ${serializeLog(storyLog)}`).to.exist;

    return {
        start: storyLog[startIndex],
        finish: matchingFinish
    };
};

addLogAssert("assertFileItemStartFinish", (storyLog, fileName, startIndex, after = false) =>
    assertStartFinish(storyLog, startIndex, "file.name", fileName, after));

addLogAssert("assertUrlItemStartFinish", (storyLog, url, startIndex = 0, after = false) =>
    assertStartFinish(storyLog, startIndex, "url", url, after));

addLogAssert("assertLogEntryCount", (storyLog, count) => {
    expect(storyLog, `expect story log to have ${count} entries`).to.have.lengthOf(count);
    return storyLog;
});

addLogAssert("assertLogEntryContains", (storyLog, index, obj) => {
    const logLine = storyLog[index];
    expect(logLine, `expect log line ${index} to exist in log: ${serializeLog(storyLog)}`).to.exist;

    const match = logLine.args.find((a) => isContains(a, obj));

    expect(match, `expect log line ${index} to contain obj`).to.exist;
    return storyLog;
});

const findLogEntry = (storyLog, eventName, options) => {
    let logLine;

    try {
        if (options.all) {
            logLine = storyLog.filter((item) => item.args[0] === eventName).map((item) => item.args.slice(1));
        } else if (eventName instanceof RegExp) {
            logLine = storyLog.filter((item) =>  eventName.test( item.args[0]));
            expect(logLine).to.have.lengthOf.at.least(2, `expect to find at least 2 matches for ${eventName}`);
            logLine = logLine.map((ll) => ({ ...ll, args: ll.args.slice(1) }));
        } else {
            const item = storyLog.find((item) => item.args[0] === eventName);
            expect(item, `expect to find log line for event: ${eventName}`).to.not.be.undefined;
            logLine = item.args.slice(1);
        }
    } catch (ex) {
        throw new StoryLogError(`Failed to custom assert log entry: ${eventName}. log[${storyLog.length} items]: ${JSON.stringify(storyLog)}`, ex);
    }

    return logLine;
};

//a command, not a query: the asserter may call cy.*, so only the lookup retries and the asserter then runs once with its result
Cypress.Commands.add("customAssertLogEntry", { prevSubject: true }, (storyLog, eventName, asserter, options = {}) => {
    let logLine;

    return cy.storyLog()
        .should((log) => {
            logLine = findLogEntry(log, eventName, options);
        })
        .then((log) => {
            asserter(logLine, log._env);
        });
});

const assertLogPattern = (storyLog, pattern, options = {}) => {
    options = Object.assign({}, {
        times: 1,
        index: -1,
        different: false,
    }, options);

    let between = options.between || [options.times, options.times];

    const matches = storyLog.reduce((res, line, index) => {
        const arg = line.args.find((a) => typeof a === "string" && pattern.test(a));
        if (arg) {
            res.push({ arg, index });
        }
        return res;
    }, []);

    if (~options.index) {
        const inLine = matches.find(({ index }) => index === options.index);
        expect(inLine, `expect pattern match: ${pattern} to be in index: ${options.index} in log: ${serializeLog(storyLog)}`).to.exist;
    } else {
        if (between[0] === between[1]) {
            expect(matches.length).to.equal(options.times, `expect to find match: ${pattern} in log ${options.times} times`);
        } else {
            expect(matches.length).least(between[0], `expect to find match: ${pattern} in log at least: ${between[0]} times`);
            expect(matches.length).most(between[1], `expect to find match: ${pattern} in log at most: ${between[1]} times`);
        }

        if (options.different) {
            const checked = [];
            const found = matches.find((m) => {
                const same = !!~checked.indexOf(m.arg); //check before we put into the checked array
                checked.push(m.arg);
                return same;
            });

            expect(found, "expect pattern matches to all be different").to.be.undefined;
        }
    }

    return matches;
};

addLogAssert("assertLogPattern", assertLogPattern);

addLogAssert("assertNoLogPattern", (storyLog, pattern, options = {}) =>
    assertLogPattern(storyLog, pattern, { ...options, times: 0 }));

Cypress.Commands.add("resetStoryLog", { prevSubject: true }, (storyLog) => {
	storyLog.splice(0, storyLog.length);
});
