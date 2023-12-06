const Sequelize = require("sequelize");

const Language = (sequelize, Sequelize) => { 
  return sequelize.define('language', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
			type: Sequelize.STRING,
			allowNull: true,
        },
        lang_code: {
			type: Sequelize.STRING,
			allowNull: true,
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
			tableName: 'languages'		
     });
};

          
module.exports = Language;