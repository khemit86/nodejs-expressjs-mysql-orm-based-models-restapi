//const sql = require("../config/connection");
const Sequelize = require("sequelize");

const Card = (sequelize, Sequelize) => { 
  return sequelize.define('cards', {
			brand:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			user_id:{
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			funding:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			card_no:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			token:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			exp_month:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			exp_year:{
				type: Sequelize.STRING,
				allowNull: true,
			},
			is_default:{
				type: Sequelize.INTEGER,
				defaultValue: 0,
			}
	    },
	    {
			timestamps: false,
			tableName: 'cards'
	    }
	);
};
    
module.exports = Card;