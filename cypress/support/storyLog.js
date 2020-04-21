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
    cy.window().then((w) => {
        return w.__cypressResults.storyLog;
    }));

Cypress.Commands.add("assertItemStartFinish", { prevSubject: true }, (storyLog, fileName, startIndex = 0) => {
    console.log("assertItemStartFinish received log", storyLog);

    expect(storyLog[startIndex].args[0]).to.equal("ITEM_START");
    expect(storyLog[startIndex].args[1].file.name).to.equal(fileName);

    //TODO: this wont work with multiple files !! look for start event't batch item id
    expect(storyLog[startIndex + 1].args[0]).to.equal("ITEM_FINISH");
    expect(storyLog[startIndex + 1].args[1].file.name).to.equal(fileName);
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
        different: false,
    }, options);

    console.log("assertItemStartFinish received log", storyLog, options);

    const matches = storyLog.reduce((res, line) => {
        const arg = line.args.find((a) => typeof a === "string" && pattern.test(a));
        if (arg) {
            res.push(arg);
        }
        return res;
    }, []);

    expect(matches.length).to.equal(options.times, `expect to find matches in log ${options.times} times`);

    if (options.different) {
        const checked = [];
        const found = matches.find((m) => {
            const same = !!~checked.indexOf(m);
            checked.push(m)
            return same;
        });

        expect(found, "expect pattern matches to all be different").to.be.undefined
    }
});
