const Sequelize = require("sequelize");

const Order = (sequelize, Sequelize) => { 
  return sequelize.define('order', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        restaurant_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        subtotal: {
            type: Sequelize.STRING,
            defaultValue: 0,
        },
        total: {
            type: Sequelize.STRING,
            defaultValue: 0,
        },
        address: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        delivery_type: {
            type: Sequelize.INTEGER,
            defaultValue: 1,
        },
        delivery_time: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        payment_status:{
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
            created_at: Sequelize.DATE,
		    updated_at:  Sequelize.DATE,
		},
		{
			timestamps: false,
			tableName: 'orders'		
     });
};

          
module.exports = Order;