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
  }
}

module.exports = commentController
