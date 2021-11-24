function ensureAuthenticated(req) {
  return req.isAuthenticated()
}

function getUser(req) {
  return req.user
}

function removeDuplicateComment(commentData) {
  const comments = []
  for (let thisComment of commentData) {
    const check = comments.find(
      (comment) => comment.RestaurantId === thisComment.RestaurantId
    )
    if (!check) {
      comments.push(thisComment)
    }
  }
  return comments
}

module.exports = {
  ensureAuthenticated,
  getUser,
  removeDuplicateComment
}
