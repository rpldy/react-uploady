export const uploadUrl = "http://test.tus.com/upload";

export const parallelFinalUrl = `${uploadUrl}/final`;

export const createTusIntercepts = (tusOptions = {}) => {
    const options = {
        parallel: 1,
        deferLength: false,
        ...tusOptions
    };

    const tusData = Array.from({ length: options.parallel },
        (_, i) => i).map((i) => {
        const path = i + 1
        return {
            size: 0,
            offset: 0,
            path: [path, path, path].join(""),
        };
    });

    let createsCount = 0;

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
    }).as("tusCreateReq");

    tusData.forEach(({ path }, i) => {
        cy.intercept("PATCH", `${uploadUrl}/${path}`, (req) => {
            const offset = parseInt(req.headers["content-length"]);
            tusData[i].offset += offset;

            req.reply(204, "", {
                "Tus-Resumable": "1.0.0",
                "Upload-Offset": `${tusData[i].offset}`,
            });
        }).as(`tusPatchReq${i + 1}`);
    });

    const getPartUrls = () =>
        tusData.map(({ path }) => `${uploadUrl}/${path}`);

    return {
        getPartUrls,

        assertCreateRequest: (createSize, cb = null) => {
            cy.wait("@tusCreateReq")
                .then((xhr) => {
                    const { headers } = xhr.request;
                    expect(headers["upload-length"]).to.eq(`${createSize}`);

                    if (options.parallel > 1) {
                        expect(headers["upload-concat"]).to.eq("partial");
                    }

                    cb?.(xhr);
                });
        },

        assertPatchRequest: (contentLength, index, cb = null) => {
            cy.wait(`@tusPatchReq${index + 1}`)
                .then((xhr) => {
                    const { headers } = xhr.request;
                    expect(headers["content-length"]).to.eq(`${contentLength}`);
                    expect(headers["content-type"]).to.eq("application/offset+octet-stream");

                    cb?.(xhr);
                });
        },

        assertCreateRequestTimes: (times, msg) => {
            cy.get("@tusCreateReq.all")
                .should("have.length", times, msg);
        },

        assertPatchRequestTimes: (index, times, msg) => {
            cy.get(`@tusPatchReq${index + 1}.all`)
                .should("have.length", times, msg);
        },

        assertParallelFinalRequest: (cb = null) => {
            if (options.parallel === 1) {
                throw new Error("Parallel final request can only be tested with parallel uploads > 1");
            }

            cy.wait("@tusCreateReq")
                .then((xhr) => {
                    expect(xhr.request.headers["upload-concat"])
                        .to.eq(`final;${getPartUrls().join(" ")}`);

                    cb(xhr);
                });
        },

        assertLastCreateRequest: (cb) => {
            cy.get(`@tusCreateReq.all`)
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
            }).as("tusResumeReq");
        },

        assertResumeRequest: (cb = null) => {
            cy.wait("@tusResumeReq")
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
                }).as(`tusResumeReq${i + 1}`);
            });
        },

        assertResumeForParts: () => {
            tusData.forEach(({ path }, i) => {
                cy.wait(`@tusResumeReq${i + 1}`)
                    .then(({  request }) => {
                        expect(request.method).to.eq("HEAD");
                        expect(request.headers["tus-resumable"]).to.eq("1.0.0");
                    });
            });
        },
    };
};

