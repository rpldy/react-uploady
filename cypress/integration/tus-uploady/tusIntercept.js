import { interceptWithDelay } from "../intercept";

export const uploadUrl = "http://test.tus.com/upload";

export const parallelFinalUrl = `${uploadUrl}/final`;

let callCount = 64;

beforeEach(() => {
   callCount = 64;
});

export const createTusIntercepts = (tusOptions = {}) => {
    callCount += 1;

    const addPatchIntercept = (delay, alias, url, tusData, index) => {
        interceptWithDelay(delay, alias, url, "PATCH",
            (req) => {
                const offset = parseInt(req.headers["content-length"]);
                tusData[index].offset += offset;

                return  {
                    statusCode: 204,
                    body: "",
                    headers: {
                        "Tus-Resumable": "1.0.0",
                        "Upload-Offset": `${tusData[index].offset}`,
                    }
                };
            });
    }

    const options = {
        parallel: 1,
        batchSize: 1,
        deferLength: false,
        patchDelay: 0,
        id: String.fromCharCode(callCount),
        ...tusOptions
    };

    const tusData = Array.from({ length: Math.max(options.parallel, options.batchSize) },
        (_, i) => i).map((i) => {
        const path = i + 1
        return {
            size: 0,
            offset: 0,
            path: [path, path, path].join(""),
        };
    });

    let createsCount = 0;

    const getA = (alias, wait, all) =>
        `${wait ? "@": ""}${alias}_${options.id}${all ? ".all" : ""}`;

    cy.intercept("POST", uploadUrl, (req) => {
        const concatHeader = req.headers["upload-concat"];
        const uploadLengthHeader = req.headers["upload-length"];
        console.log("HANDLING CREATE REQUEST - ", { createsCount, uploadLengthHeader, concatHeader });

        if (concatHeader?.startsWith("final")) {
            req.reply(201, { success: true }, {
                "Location": parallelFinalUrl,
                "Tus-Resumable": "1.0.0",
            });
        } else {
            const partSize = parseInt(req.headers["upload-length"]);
            let contentLength = parseInt(req.headers["content-length"]);

            if (!options.deferLength) {
                expect(partSize).to.be.a("number");
            }

            //support data on create
            contentLength = isNaN(contentLength) ? 0 : contentLength;

            if (contentLength) {
                tusData[createsCount].offset = contentLength;
            }

            tusData[createsCount].size = partSize;

            req.reply(200, { success: true }, {
                "Location": `${uploadUrl}/${tusData[createsCount].path}`,
                "Upload-Offset": `${contentLength}`,
                "Tus-Resumable": "1.0.0",
            });

            createsCount += 1;
        }
    }).as(getA("tusCreateReq"));

    // Create PATCH intercepts for initial tusData entries
    tusData.forEach(({ path }, i) => {
        addPatchIntercept(options.patchDelay, getA(`tusPatchReq${i + 1}`), `${uploadUrl}/${path}`, tusData, i);
    });

    const getPartUrls = () =>
        tusData.map(({ path }) => `${uploadUrl}/${path}`);

    return {
        getPartUrls,

        assertCreateRequest: (createSize = 0, cb = null) => {
            cy.wait(getA("tusCreateReq", true))
                .then((xhr) => {
                    const { headers } = xhr.request;

                    if (createSize) {
                        expect(headers["upload-length"]).to.eq(`${createSize}`);
                    } else {
                        expect(headers["upload-length"]).to.eq(`${tusData[0].size}`);
                    }

                    if (options.parallel > 1) {
                        expect(headers["upload-concat"]).to.eq("partial", "parallel parts should be created with 'partial' concat header");
                    } else {
                        expect(headers["upload-concat"]).to.eq(undefined, "no parallel parts shouldn't pass 'partial' concat header!");
                    }

                    cb?.(xhr);
                });
        },

        assertPatchRequest: (contentLength, index, cb = null) => {
            cy.wait(getA(`tusPatchReq${index + 1}`, true))
                .then((xhr) => {
                    const { headers } = xhr.request;
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");

                    if (contentLength) {
                        expect(headers["content-length"]).to.eq(`${contentLength}`);
                    }

                    cb?.(xhr);
                });
        },

        assertCreateRequestTimes: (times, msg) => {
            cy.get(getA("tusCreateReq", true, true))
                .should("have.length", times, msg);
        },

        assertPatchRequestTimes: (index, times, msg) => {
            cy.get(getA(`tusPatchReq${index + 1}`, true, true))
                .should("have.length", times, msg);
        },

        assertParallelFinalRequest: (cb = null) => {
            if (options.parallel === 1) {
                throw new Error("Parallel final request can only be tested with parallel uploads > 1");
            }

            cy.wait(getA("tusCreateReq", true))
                .then((xhr) => {
                    expect(xhr.request.headers["upload-concat"])
                        .to.eq(`final;${getPartUrls().join(" ")}`);

                    cb(xhr);
                });
        },

        assertCreateRequestByIndex: (index, cb = null) => {
            cy.get(getA("tusCreateReq", true, true))
                .then((calls) => {
                    const xhr = calls[index];
                    cb(xhr);
                });
        },

        assertLastCreateRequest: (cb) => {
            cy.get(getA("tusCreateReq", true, true))
                .then((calls) => {
                    const xhr = calls[calls.length - 1];
                    cb(xhr);
                });
        },

        addResumeForFinal: (length, offset = null) => {
            cy.intercept("HEAD", parallelFinalUrl, (req) => {
                if (length < 0) {
                    req.reply(404, "", {
                        "Tus-Resumable": "1.0.0",
                    });
                } else {
                    req.reply(200, { success: true }, {
                        "Tus-Resumable": "1.0.0",
                        "upload-length": `${length}`,
                        "upload-offset": `${offset ?? length}`,
                    });
                }
            }).as(getA("tusResumeReq"));
        },

        assertResumeRequest: (cb = null) => {
            cy.wait(getA("tusResumeReq", true))
                .then((xhr) => {
                    cb(xhr);
                });
        },

        addResumeForParts: (offset = []) => {
            tusData.forEach(({ path }, i) => {
                cy.intercept("HEAD", `${uploadUrl}/${path}`, (req) => {
                    if (offset?.[i] === -1) {
                        req.reply(404, "", {
                            "Tus-Resumable": "1.0.0",
                        });
                    } else {
                        req.reply(200, { success: true }, {
                            "Tus-Resumable": "1.0.0",
                            "upload-length": `${tusData[i].size}`,
                            "upload-offset": `${offset?.[i] ?? tusData[i].offset}`,
                            ...(options.parallel > 1 ? { "upload-concat": "partial" } : {}),
                        });
                    }
                }).as(getA(`tusResumeReq${i + 1}`));
            });
        },

        assertResumeForParts: (cb) => {
            tusData.forEach(({ path }, i) => {
                cy.wait(getA(`tusResumeReq${i + 1}`, true))
                    .then((xhr) => {
                        const {  request } = xhr;
                        expect(request.method).to.eq("HEAD");
                        expect(request.headers["tus-resumable"]).to.eq("1.0.0");
                        cb?.(xhr);
                    });
            });
        },
    };
};
