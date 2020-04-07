const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {
    product.findById(req.body.productId).exec().then(product => {

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
            res.status(201).json(result);
        }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .exec()
        .then(order => {
            if (!order) return res.status(404).json({
                message: "Order Not found"
            });
            res.status(200).json(order);
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            });
        });
});

router.delete('/:orderId', (req, res, next) => {
    Order.remove({_id: req.params.orderId})
        .exec()
        .then(order => {
            res.status(200).json({
                message: 'order was deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            });
        });
});

module.exports = router;