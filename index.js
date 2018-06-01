'use strict';
const nodemailer = require('nodemailer')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
require('dotenv').config()

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// var upload = multer({ dest: 'uploads/' })
var upload = multer({ storage: storage })
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/contact', upload.single('cv'), (req, res, next) => {

  fs.readFile("./attachment.txt", function (err, data) {

    let transporter = nodemailer.createTransport({
        host: process.env.SERVER,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });

    let mailOptions = {
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
        html: req.body.html,
        attachments: [{
          filename: req.file.originalname,
          path: `./uploads/${req.file.originalname}`
        }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        res.json({
          message: info.messageId,
          previewUrl: nodemailer.getTestMessageUrl(info)
        })
    });
  });
})

app.listen(4444, () => console.log('Example app listening on port 4444!'))
