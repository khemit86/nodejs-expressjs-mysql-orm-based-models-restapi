//const sql = require("../config/connection");
const Sequelize = require("sequelize");

const Restaurent = (sequelize, Sequelize) => { 
  return sequelize.define('restaurent', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        address: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        latitude: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        longitude:{
            type: Sequelize.STRING,
            allowNull:true
		},
		opening_time:{
            type: Sequelize.STRING,
            allowNull:true
		},
		closing_time:{
            type: Sequelize.STRING,
            allowNull:true
        },
        image:{
        	type: Sequelize.STRING,
        	allowNull:true
        },
        status:{
        	type: Sequelize.INTEGER,
        	defaultValue: 1,
        },
        created_at: Sequelize.DATE,
		updated_at:  Sequelize.DATE,
		},
		{
			timestamps: false,
			tableName: 'restaurent'		
     });
};

          
module.exports = Restaurent;