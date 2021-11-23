const bcrypt = require('bcryptjs')
const db = require('../models')
const helpers = require('../_helpers')
const { Op } = require('sequelize')
const { User, Restaurant, Comment, Favorite, Like, Followship } = db

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    if (passwordCheck !== password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email } }).then((user) => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
          }).then((user) => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', 'Login successfully!')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', 'Logout successfully!')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    const userId = req.params.id
    return User.findByPk(userId, {
      include: { model: Comment, include: Restaurant }
    }).then((user) => {
      return res.render('profile', { user: user.toJSON() })
    })
  },
  editUser: (req, res) => {
    const userId = req.params.id
    return User.findByPk(userId).then((user) => {
      return res.render('edit', { user: user.toJSON() })
    })
  },
  putUser: (req, res) => {
    const { file } = req
    const { name, email } = req.body
    const userId = req.params.id
    // prevent user editing other user's profile
    if (Number(userId) !== Number(helpers.getUser(req).id)) {
      req.flash('error_messages', '不能編輯其他使用者的資料')
      return res.redirect(`/users/${userId}`)
    }

    // check if name or email is valid
    if (!name || !email) {
      req.flash('error_messages', 'Name or Email field is empty')
      return res.redirect('back')
    }

    // Can't change to an email which has already been registered
    User.findOne({ where: { email, [Op.not]: { id: userId } } }).then(
      (emailCheck) => {
        if (emailCheck) {
          req.flash('error_messages', 'This email has already been registered')
          return res.redirect('back')
        } else {
          // if the action involve changing profile image
          if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
              return User.findByPk(userId).then((user) => {
                user
                  .update({
                    name,
                    email,
                    image: file ? img.data.link : user.image
                  })
                  .then((user) => {
                    req.flash('success_messages', '使用者資料編輯成功')
                    return res.redirect(`/users/${userId}`)
                  })
                  .catch((error) => console.log(error))
              })
            })
            // if the action doesn't involve changing profile image
          } else {
            return User.findByPk(userId).then((user) => {
              user
                .update({
                  name,
                  email,
                  image: user.image
                })
                .then((user) => {
                  req.flash('success_messages', '使用者資料編輯成功')
                  return res.redirect(`/users/${userId}`)
                })
                .catch((error) => console.log(error))
            })
          }
        }
      }
    )
  },
  addFavorite: (req, res) => {
    const RestaurantId = req.params.restaurantId
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId
    }).then((restaurant) => {
      Restaurant.findByPk(RestaurantId).then((restaurant) => {
        restaurant.increment('favoriteCounts')
      })
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    const RestaurantId = req.params.restaurantId
    return Favorite.destroy({
      where: {
        UserId: req.user.id,
        RestaurantId
      }
    }).then((restaurant) => {
      Restaurant.findByPk(RestaurantId).then((restaurant) => {
        restaurant.decrement('favoriteCounts')
      })
      return res.redirect('back')
    })
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    }).then((restaurant) => {
      return res.redirect('back')
    })
  },
  removeLike: (req, res) => {
    return Like.destroy({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    }).then((restaurant) => {
      return res.redirect('back')
    })
  },
  getTopUser: (req, res) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    }).then((users) => {
      users = users.map((user) => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map((d) => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then((followship) => {
      return res.redirect('back')
    })
  },
  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then((followship) => {
      followship.destroy().then((followship) => {
        return res.redirect('back')
      })
    })
  }
}

module.exports = userController
