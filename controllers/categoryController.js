const db = require('../models')
const Category = db.Category
const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then((categories) => {
      return res.render('admin/categories', { categories })
    })
  },
  postCategory: (req, res) => {
    const { name } = req.body
    if (!name) {
      req.flash('error_message', "name didn't exist")
    } else {
      return Category.create({
        name
      }).then((category) => {
        res.redirect('/admin/categories')
      })
    }
  }
}
module.exports = categoryController
