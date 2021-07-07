const express = require('express');
const uploadRouter = express.Router();
const authenticate = require('../authenticate');
const multer = require('multer')

const storage = multer.diskStorage(
    {
        destination: (req, file, callback) => {
            callback(null, 'public/images');
        },

        filename: (req, file, callback) =>{
            callback(null, file.originalname);
        }
    }
);

const imageFileFilter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return callback(new Error('You can only upload image files'), false);
    }
    
    callback(null,true);
};

const upload = multer({storage: storage, fileFilter: imageFileFilter});

uploadRouter.use(express.json());

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload' + req.params.dishId);
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res, next) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload' + req.params.dishId);
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload' + req.params.dishId);
})

module.exports = uploadRouter;