const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
        .select('_id product quantity')
        .populate('product', 'name')
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                }),
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId).exec().then(product => {

        if(!product) return res.status(404).json({
            message: 'product not found'
        })

        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity,
        });
        return order.save();
        }).then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Order stored!',
                request: {
                    type: 'GET',  
                    url: 'http://localhost:3000/orders/' + result._id,
                }
            });
        }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('_id product quantity')
        .populate('product', 'name price')
        .exec()
        .then(order => {
            if (!order) return res.status(404).json({
                message: "Order Not found"
            });
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders',
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            });
        });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    Order.remove({_id: req.params.orderId})
        .exec()
        .then(order => {
            res.status(200).json({
                message: 'order was deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders/',
                    body: {
                        product: {type: 'ObjectId', required: 'true'},
                        quantity: {type: 'Number', default: '1'},
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