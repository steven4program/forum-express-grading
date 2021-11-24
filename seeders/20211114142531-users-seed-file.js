'use strict'
const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'root@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: true,
          name: 'root',
          image: `https://i.pravatar.cc/150?u=${Math.ceil(Math.random()) * 10}`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user1',
          image: `https://i.pravatar.cc/150?u=${
            Math.ceil(Math.random()) * 10 + 10
          }`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user2',
          image: `https://i.pravatar.cc/150?u=${
            Math.ceil(Math.random()) * 10 + 20
          }`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
}
