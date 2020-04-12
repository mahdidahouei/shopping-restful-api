const Product = require('../models/product');
const mongoose = require('mongoose');

exports.products_get_all = (req, res, next) => {
    Product.find()
    .select('_id name price productImage') // only fetch these properties
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
};

exports.products_create_product = (req, res, next) => {
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

};

exports.products_get_product = (req, res, next) => {
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
};

exports.products_update_product = (req, res, next) => {
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
};

exports.products_delete_product = (req, res, next) => {
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
};