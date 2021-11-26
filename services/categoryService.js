const db = require('../models')
const { Category } = db

const categoryService = {
  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    }).then((categories) => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then((category) => {
          callback({ categories, category })
        })
      } else {
        callback({ categories })
      }
    })
  },
  postCategory: (req, res, callback) => {
    const { name } = req.body
    if (!name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else {
      return Category.create({
        name
      }).then((category) => {
        callback({
          status: 'success',
          message: 'category was successfully created'
        })
      })
    }
  }
}

module.exports = categoryService
