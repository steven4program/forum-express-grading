const db = require('../models')
const Category = db.Category
const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then((categories) => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then((category) => {
          return res.render('admin/categories', {
            categories,
            category: category.toJSON()
          })
        })
      } else {
        return res.render('admin/categories', { categories })
      }
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
  }
}
module.exports = categoryController
