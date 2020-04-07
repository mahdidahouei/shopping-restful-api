const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
var i = 0;
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/');
    },
    filename: (req, file, callback) => {
        var dateString = new Date().toISOString();
        i++;
        callback(null, i + '-' + file.originalname);
    },  
});
const fileFilter = (req, file, callback) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        callback(null, true);
    else 
        callback(new Error('Only jpeg and png files are accepted'), false);
}
const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024*1024*5
    },
    fileFilter: fileFilter,
});
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');

router.get('/', (req, res, next) => {
    Product.find()
    .select('_id name price productImage')
    .exec()
    .then(docs => {
        
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return{
                    _id:doc._id,
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    request: {
                        type: 'Get',
                        url: 'http://localhost:3000/products/' + doc._id,
                    },
                };
            }),
        };

        res.status(200).json(response);
    })
    .catch(err => {
        console.log('a get request failed with status code 500');
        res.status(500).json({
            error: err,
        });
    });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: 'http://localhost:3000/' + req.file.path,
    });
    product.save().then( (result) => {
        console.log(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                productImage: result.productImage,
                request:{
                    type: 'GET',
                    url:  'http://localhost:3000/products/' + result._id,
                },
            },
        });
        
    }).catch(err => {
        console.log('a post request failed');
        res.status(500).json({
            error: err,
        });
    });

});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('_id name price productImage')
    .exec()
        .then(doc => {
            console.log(doc);
            if(doc) 
                res.status(200).json(doc);
            else 
                res.status(404).json({message: 'Not fucking found!'});
        })
        .catch(err => {
            console.log({error: err});
            res.status(500).json({error: err});
        });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({_id: id}, {
        $set: updateOps
    }).exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
            message: 'Product updated successfully!',
            request:{
                type: 'GET',
                url:  'http://localhost:3000/products/' + result._id,
            }
        });
    })
    .catch(err => {
        console.log({
            error: err
        });
    });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product was deleted successfully!',
                request:{
                    type: 'POST',
                    url:'http://localhost:3000/products',
                    body:{
                        name: {type: 'String', required: 'true'},
                        price: {type: 'Number', required: 'true'},
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            });
        });
});

module.exports = router;