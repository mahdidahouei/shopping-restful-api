const express = require('express');
const app = express();
const morgan = require('morgan');
const body_parser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

//connect to the database
mongoose.connect(
    'mongodb://localhost/node-rest-shop',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);
mongoose.connection.once('open', () => { 
    console.log('MongoDB connected');
}).on('error', (error) => {
    console.log('MongoDB connection error: ', error);
});

app.use(morgan('dev'));
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.use((req, res, next) => {
    const error = new Error('Not fucking found!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    })
});

module.exports = app;