/**
 * Compatibility wrapper for hermes-eslint to work with ESLint 10.
 *
 * ESLint 10 requires ScopeManager implementations to provide an `addGlobals(names)` method
 * that creates variables with the given names in the global scope and resolves references.
 * hermes-eslint's ScopeManager does not implement this method, so we patch it here.
 */
import hermesParser from "hermes-eslint";

const { parseForESLint: originalParseForESLint } = hermesParser;

function parseForESLint(code, options) {
    const result = originalParseForESLint(code, options);

    if (result.scopeManager && typeof result.scopeManager.addGlobals !== "function") {
        result.scopeManager.addGlobals = function (names) {
            const globalScope = this.globalScope ?? this.scopes[0];

            if (!globalScope) {
                return;
            }

            for (const name of names) {
                if (!globalScope.set.has(name)) {
                    globalScope.__defineVariable(name, globalScope.set, globalScope.variables, null, null);
                }
            }

            const namesSet = new Set(names);

            globalScope.through = globalScope.through.filter((ref) => {
                const refName = ref.identifier.name;

                if (namesSet.has(refName)) {
                    const variable = globalScope.set.get(refName);

                    if (variable) {
                        ref.resolved = variable;
                        variable.references.push(ref);
                    }

                    return false;
                }

                return true;
            });

            if (globalScope.__implicit) {
                globalScope.__implicit.variables = globalScope.__implicit.variables.filter((v) => {
                    if (namesSet.has(v.name)) {
                        globalScope.__implicit.set.delete(v.name);
                        return false;
                    }

                    return true;
                });
            }
        };
    }

    return result;
}

export default {
    ...hermesParser,
    parseForESLint,
};
