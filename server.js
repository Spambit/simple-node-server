const express = require("express");
const port = 3000;
const app = express(),
  bodyParser = require('body-parser'),
  path = require('path'),
  fileUpload = require("express-fileupload");

app.use(bodyParser.json());

app.listen(port, function() {
  console.log("Server is running on " + port + " port");
});

app.get("/", function(req, res) {
  res.send("<h1>Hello World!</h1>");
});

app.get("/download/:filename", (req, res) => {
  let fileName = req.params.filename;
  console.log(__dirname);
  delay(10000);
  res.sendFile(path.join(__dirname, 'download', fileName));
});

function delay(millisec) {
  if (millisec < 0) return;
  console.log("Server is delaying your request for :" + millisec + "ms");
  let timeNow = Date.now(),
    futureTime = timeNow + millisec;
  while (Date.now() <= futureTime) {}
  console.log("Server woke up after :" + millisec + "ms");
}

let uploadFilename = 0;
const fs = require("fs");
app.use("/upload", function(req, res) {
  console.log("Old filename was :" + uploadFilename);
  uploadFilename++;
  console.log("New filename is :" + uploadFilename);
  req.on("data", function(data) {
    delay(10000);
    fs.appendFileSync(`upload/${uploadFilename}.jpg`, data);
  });
  req.on("end", () => {
    res.send("File uploaded.");
    console.log("File uploaded and client was notified.");
  });
});
