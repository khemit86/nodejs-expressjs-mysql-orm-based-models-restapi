const Sequelize = require("sequelize");

const OrderProduct = (sequelize, Sequelize) => { 
  return sequelize.define('order_products', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
		},
		order_id: {
			type: Sequelize.INTEGER,
			allowNull: true,
        },
        item_id: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
		price: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		quantity: {
			type: Sequelize.INTEGER,
			allowNull: true,
        },
        extra_items:{
			type:Sequelize.TEXT,
			allowNull: true,
			get: function() {
				if(this.getDataValue("extra_items")){
					return JSON.parse(this.getDataValue("extra_items"));
				}else{
					return '';
				}
			},
			set: function(value) {
				return this.setDataValue("extra_items", JSON.stringify(value));
			}
		},
            created_at: Sequelize.DATE,
		    updated_at:  Sequelize.DATE,
		},
		{
			timestamps: false,
			tableName: 'order_products'		
     });
};

          
module.exports = OrderProduct;