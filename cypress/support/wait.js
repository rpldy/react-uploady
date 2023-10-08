import { WAIT_X_SHORT, WAIT_SHORT, WAIT_MEDIUM, WAIT_LONG, WAIT_X_LONG } from "../constants";

[
    { name: "ExtraShort", time: WAIT_X_SHORT },
    { name: "Short", time: WAIT_SHORT },
    { name: "Medium", time: WAIT_MEDIUM },
    { name: "Long", time: WAIT_LONG },
    { name: "ExtraLong", time: WAIT_X_LONG },
]
    .forEach(({ name, time }) =>
        Cypress.Commands.add(`wait${name}`, () => {
            cy.wait(time);
        }));

