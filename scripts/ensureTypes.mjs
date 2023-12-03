#!/usr/bin/env node
import assert from "assert";
import path from "path";
import fs from "fs-extra";
import { getMatchingPackages } from "./lernaUtils.mjs";
import { logger } from "./utils.mjs";

const TYPES_FOLDER = "types",
    DEF_FILE = "index.d.ts",
    DEF_TEST_FILE = "index.test-d.ts";

const ensurePackageTypeDefinitions = (pkg) => {
    logger.verbose(`>>>> ensuring types for package: '${pkg.name}'`);

    assert.ok(pkg.get("types"), `expect ${pkg.name} package.json types field is defined`);

    const defFile = path.join(pkg.location, TYPES_FOLDER, DEF_FILE),
        defFileExists = fs.existsSync(defFile);

    assert.ok(defFileExists, `expect ${pkg.name} types definition file to exist at:
        ${defFile}`);

    const defTestFile = path.join(pkg.location, TYPES_FOLDER, DEF_TEST_FILE),
        defTestFileExists = fs.existsSync(defTestFile) || fs.existsSync(defTestFile + "x");

    assert.ok(defTestFileExists, `expect ${pkg.name} types test file to exist at:
            ${defTestFile}(x)`);
};

const ensureTypes = async () => {
    logger.info(`>>> ensuring packages type definitions`);

    const pkgs = getMatchingPackages();

    pkgs.forEach(ensurePackageTypeDefinitions);
};

ensureTypes();
