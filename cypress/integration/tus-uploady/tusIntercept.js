import intercept from "../intercept";

export const tusIntercept = (uploadUrl) => {
    intercept(uploadUrl, "POST", {
        headers: {
            "Location": `${uploadUrl}/123`,
            "Tus-Resumable": "1.0.0"
        }
    }, "createReq");

    intercept(`${uploadUrl}/123`, "PATCH", {
        headers: {
            "Tus-Resumable": "1.0.0",
        },
    }, "patchReq");

    intercept(`${uploadUrl}/123`, "HEAD", {
        headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": "1",
            "Upload-Length": "1",
        },
    }, "resumeReq");
};

