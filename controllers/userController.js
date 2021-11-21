const bcrypt = require('bcryptjs')
const db = require('../models')
const helpers = require('../_helpers')
const { Op } = require('sequelize')
const { User, Restaurant, Comment, Favorite, Like } = db

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
    // User.findOne({ where: { email, [Op.not]: { id: userId } } }).then(
    //   (emailCheck) => {
    //     if (emailCheck) {
    //       req.flash('error_messages', 'This email has already been registered')
    //       return res.redirect('back')
    //     }
    //   }
    // )

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
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    }).then((restaurant) => {
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    }).then((favorite) => {
      favorite.destroy().then((restaurant) => {
        return res.redirect('back')
      })
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
  }
}

module.exports = userController
