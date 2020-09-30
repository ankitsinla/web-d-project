const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');


const mongoURI = 'mongodb://localhost:27017/mbmapp';

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
    });
  }
});
var upload = multer({storage})

module.exports = upload;