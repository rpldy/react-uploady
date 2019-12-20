const express = require("express"),
	fileUpload = require("express-fileupload"),
	cors = require("cors"),
	app = express();

const port = process.env.PORT;

app.use(fileUpload());
app.use(cors());

app.post("/upload", function (req, res) {


	console.log("MOCK SERVER - RECEIVED UPLOAD REQ", req.files);

	setTimeout(() => {
		res.status(201).json({ success: true });
	}, 1000);

});

app.listen(port, function () {
	console.log("server started: ", port); // eslint-disable-line
});