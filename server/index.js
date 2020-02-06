const express = require("express"),
	fileUpload = require("express-fileupload"),
	cors = require("cors"),
	app = express();

const port = process.env.PORT;

app.use(fileUpload());
app.use(cors());

app.post("/upload", function (req, res) {

	let timeout = req.query.long ? 10000 : 1000;

	console.log("MOCK SERVER - RECEIVED UPLOAD REQ - response in: " + timeout, req.files, req.headers);

	setTimeout(() => {
		res.status(201).json({ success: true });
	}, timeout);

});

app.listen(port, function () {
	console.log("server started on PORT: ", port); // eslint-disable-line
});