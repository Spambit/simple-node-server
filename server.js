const express = require("express");
const fs = require('fs');
const key = fs.readFileSync('encryption/myprivate.key');
const cert = fs.readFileSync( 'encryption/mycert.cert' );
const options = {
  key: key,
  cert: cert
  };
const https = require('https');
const http = require('http');
const httpsPort = 443;
const port = 3000;
const app = express(),
  bodyParser = require("body-parser"),
  path = require("path"),
  fileUpload = require("express-fileupload");

app.use(bodyParser.json());

http.createServer(app).listen(port, function() {
  console.log("Http Server is running on " + port + " port");
});

https.createServer(options, app).listen(httpsPort,function(){
  console.log("Https Server is running on " + httpsPort + " port");
});

// app.use(function(req, res, next) {
//   if (req.secure) {
//       next();
//   } else {
//       res.redirect('https://' + req.headers.host + req.url);
//   }
// });

//app.use(express.static(__dirname+'/hosted/dist'));
app.get("/", function(req, res) {
  console.log(req.protocol + '://' + req.get('host') + req.originalUrl);
  //res.send("<h1>Welcome</h1>");
  res.redirect('http://192.168.0.103:3001/');
  //res.sendFile(path.join(__dirname));
});

app.get("/download/:filename", (req, res) => {
  console.log(req.headers);
  let cookies = parseCookies(req);
  for (let key of Object.keys(cookies)) {
    var cookie = cookies[key];
    console.log(cookie);
  }
  let fileName = req.params.filename;
  console.log(JSON.stringify(req.headers));
  delay(5000);
  res.sendFile(path.join(__dirname, "download", fileName));
});

function parseCookies(request) {
  var list = {},
    rc = request.headers.cookie;

  rc &&
    rc.split(";").forEach(function(cookie) {
      var parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });
  return list;
}

function delay(millisec) {
  if (millisec < 0) return;
  console.log("Server is delaying your request for :" + millisec + "ms");
  let timeNow = Date.now(),
    futureTime = timeNow + millisec;
  while (Date.now() <= futureTime) {}
  console.log("Server woke up after :" + millisec + "ms");
}

let uploadFilename = 0;
app.use("/upload", function(req, res) {
  console.log("Old filename was :" + uploadFilename);
  uploadFilename++;
  console.log("New filename is :" + uploadFilename);
  req.on("data", function(data) {
    delay(5000);
    fs.appendFileSync(`upload/${uploadFilename}.jpg`, data);
  });
  req.on("end", () => {
    res.send("File uploaded.");
    console.log("File uploaded and client was notified.");
  });
});
