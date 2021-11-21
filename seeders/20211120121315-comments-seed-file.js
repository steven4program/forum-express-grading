'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Comments',
      Array.from({ length: 10 }).map((d, i) => ({
        id: i * 10 + 1,
        text: faker.lorem.sentence(),
        UserId: Math.ceil(Math.random() * 3),
        RestaurantId: Math.ceil(Math.random() * 50),
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
}
