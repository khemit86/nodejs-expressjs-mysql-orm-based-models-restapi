//const sql = require("../config/connection");
const Sequelize = require("sequelize");

const Wallets = (sequelize, Sequelize) => { 
	return sequelize.define('wallets', 
		{
			user_id:{
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			transaction_id:{
				type: Sequelize.STRING,
				allowNull: false,
			},
			transation_type:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			transation_amount:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			balance_amount:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			message:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			transaction_response:{
				type: Sequelize.STRING,
				allowNull: true,
			},			
			status:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			created_at:{
				type: Sequelize.STRING,
				allowNull: true,
			}
	    },
	    {
			timestamps: false,
			tableName: 'wallets'
	    }
	);
};
    
module.exports = Wallets;