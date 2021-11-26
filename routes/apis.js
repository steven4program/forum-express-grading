const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryControllers')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

router.post(
  '/admin/restaurants',
  upload.single('image'),
  adminController.postRestaurant
)
router.get('/admin/restaurants', adminController.getRestaurants)
router.put('/admin/restaurants/:id', adminController.putRestaurant)
router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.post(
  '/admin/restaurants',
  upload.single('image'),
  adminController.postRestaurant
)

router.delete('admin/restaurants/:id', adminController.deleteRestaurant)

router.get('/admin/categories', categoryController.getCategories)
router.post('/admin/categories', categoryController.postCategories)
router.put('/admin/categories/:id', categoryController.putCategories)

module.exports = router
