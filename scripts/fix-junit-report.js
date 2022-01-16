const fs = require("fs")
const parseString = require("xml2js").parseString
const xml2js = require("xml2js")

const fixFileXml = (data, filePath) => {
    parseString(data, (err, xml) => {
        if (err) {
            return console.log(err);
        }

        const file = xml.testsuites.testsuite[0].$.file;

        xml.testsuites.testsuite.forEach((testsuite, index) => {
            if (index > 0) {
                testsuite.$.file = file;
            }
        });

        const builder = new xml2js.Builder();
        const xmlOut = builder.buildObject(xml);

        fs.writeFile(filePath, xmlOut, (err) => {
            if (err) {
                throw err;
            }

            console.log(`- Finished fixing file: ${filePath}`);
        });
    })
};

fs.readdir("./cypress/results", (err, files) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`- FOUND ${files.length} results files`);

        files.forEach((file) => {
            const filePath = `./cypress/results/${file}`;

            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    fixFileXml(data, filePath);
                }
            })
        });
    }
})
