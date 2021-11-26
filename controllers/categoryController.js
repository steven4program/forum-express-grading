const db = require('../models')
const { Category } = db

const adminService = require('../services/adminService.js')
const categoryService = require('../services/categoryService.js')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },
  postCategory: (req, res) => {
    adminService.postCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_message', data['message'])
        return res.redirect('back')
      }
      req.flash('success_message', data['message'])
      res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res) => {
    const { name } = req.body
    if (!name) {
      req.flash('error_message', "name didn't exist")
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id).then((category) => {
        category.update(req.body).then((category) => {
          res.redirect('/admin/categories')
        })
      })
    }
  },
  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id).then((category) => {
      category.destroy().then((category) => {
        res.redirect('/admin/categories')
      })
    })
  }
}
module.exports = categoryController
