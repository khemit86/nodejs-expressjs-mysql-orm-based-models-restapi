const Sequelize = require("sequelize");

const OrderPayment = (sequelize, Sequelize) => { 
  return sequelize.define('order_payments', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        name: {
            type: Sequelize.STRING,
            defaultValue: 0,
        },
        price: {
            type: Sequelize.STRING,
            allowNull: true,
        },
            created_at: Sequelize.DATE,
		    updated_at:  Sequelize.DATE,
		},
		{
			timestamps: false,
			tableName: 'order_payments'		
     });
};

          
module.exports = OrderPayment;