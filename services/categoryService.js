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
  }
}

module.exports = categoryService
