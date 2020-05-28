const express = require("express"),
    tus = require("tus-node-server");

const app = express();
const tusApp = express();
const port = process.env.PORT;
const tusServer = new tus.Server();

tusServer.datastore = new tus.FileStore({
    path: "/tusFiles"
});

tusApp.all("*", tusServer.handle.bind(tusServer));

app.use("/upload", tusApp);

app.listen(port, function () {
    console.log("server started on PORT: ", port); // eslint-disable-line
});
