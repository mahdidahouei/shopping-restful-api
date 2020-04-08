const express = require('express');
const router = express.Router();
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
const ProductsController = require('../controllers/products');
const checkAuth = require('../middleware/check-auth');

router.get('/', ProductsController.products_get_all);

router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product);

router.get('/:productId', ProductsController.products_get_product);

router.patch('/:productId', checkAuth, ProductsController.products_update_product);

router.delete('/:productId', checkAuth, );

module.exports = router;