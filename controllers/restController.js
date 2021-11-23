const db = require('../models')
const helpers = require('../_helpers')
const { Restaurant, Category, Comment, User } = db

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    const whereQuery = {}
    let categoryId = ''
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset,
      limit: pageLimit
    }).then((result) => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map(
        (item, index) => index + 1
      )

      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      const data = result.rows.map((r) => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map((d) => d.id).includes(
          r.id
        ),
        isLiked: req.user.LikedRestaurants.map((d) => d.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then((categories) => {
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    })
  },
  getRestaurant: (req, res) => {
    const restaurantId = req.params.id
    return Restaurant.findByPk(restaurantId, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] }
      ]
    }).then((restaurant) => {
      restaurant.increment('viewCounts')
      restaurant.save().then((restaurant) => {
        const isFavorited = restaurant.FavoritedUsers.map((d) => d.id).includes(
          req.user.id
        )
        const isLiked = restaurant.LikedUsers.map((d) => d.id).includes(
          req.user.id
        )
        return res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
    })
  },
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants: restaurants,
        comments: comments
      })
    })
  },
  getDashBoard: (req, res) => {
    const restaurantId = req.params.id
    return Restaurant.findByPk(restaurantId, {
      include: [Category, { model: Comment, include: [User] }]
    }).then((restaurant) => {
      return res.render('dashboard', { restaurant: restaurant.toJSON() })
    })
  },
  getTopRestaurant: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      include: [{ model: User, as: 'FavoritedUsers' }]
    }).then((restaurants) => {
      restaurants = restaurants
        .map((r) => ({
          ...r.dataValues,
          favoritedCount: r.dataValues.FavoritedUsers.length,
          isFavorited: helpers
            .getUser(req)
            .FavoritedRestaurants.map((d) => d.id)
            .includes(r.id)
        }))
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
      return res.render('topRestaurant', { restaurants })
    })
  }
}
module.exports = restController
