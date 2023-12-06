//const sql = require("../config/connection");
const Sequelize = require("sequelize");

const RoleUser = (sequelize, Sequelize) => { 
  return sequelize.define('role_user', {
	        role_id:{
				type: Sequelize.INTEGER,
				defaultValue: 3,
			},
			user_id:{
				type: Sequelize.INTEGER,
				allowNull: false,
			}
	    },
	    {
			timestamps: false,
			tableName: 'role_user'
	    }
	);
};

          
module.exports = RoleUser;