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
			return w.__cypressResults.storyLog;
		}));

const assertStartFinish = (storyLog, startIndex, prop, value) => {
    expect(storyLog[startIndex].args[0]).to.equal("ITEM_START");

    cy.wrap(storyLog[startIndex].args[1])
        .its(prop).should("eq", value);

    const itemId = storyLog[startIndex].args[1].id;

    const matchingFinish = storyLog
        .slice(startIndex + 1)
        .find((entry) =>
            entry.args[0] === "ITEM_FINISH" && entry.args[1].id === itemId);

    expect(matchingFinish, `expect matching ITEM_FINISH for ID: ${itemId}`).to.exist;

    return cy.wrap({
    	start: storyLog[startIndex],
		finish: matchingFinish
	});
};

Cypress.Commands.add("assertFileItemStartFinish", { prevSubject: true }, (storyLog, fileName, startIndex = 0) => {
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

Cypress.Commands.add("assertLogPattern", { prevSubject: true }, (storyLog, pattern, options = {}) => {

    options = Object.assign({}, {
        times: 1,
        index: -1,
        different: false,
    }, options);

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
        expect(matches.length).to.equal(options.times, `expect to find match: ${pattern} in log ${options.times} times`);

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
});
