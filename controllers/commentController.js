const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: (req, res) => {
    const { text, RestaurantId } = req.body
    const UserId = req.user.id
    return Comment.create({
      text,
      RestaurantId,
      UserId
    }).then((comment) => {
      res.redirect(`/restaurants/${RestaurantId}`)
    })
  },
  deleteComment: (req, res) => {
    return Comment.findByPk(req.params.id).then((comment) => {
      comment.destroy().then((comment) => {
        res.redirect(`/restaurants/${comment.RestaurantId}`)
      })
    })
  }
}

module.exports = commentController
