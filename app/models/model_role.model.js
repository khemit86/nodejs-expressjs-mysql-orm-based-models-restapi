const Sequelize = require("sequelize");

const ModelRole = (sequelize, Sequelize) => { 
  return sequelize.define('model_has_roles', {
	        role_id:{
	          type: Sequelize.INTEGER,
			  defaultValue: 3,
			  autoIncrement: false,
              primaryKey: true
	        },
	        model_type:{
	          type: Sequelize.STRING,
	          defaultValue: 'App\\Models\\User',
	        },
	        model_id:{
	          type: Sequelize.STRING,
	          allowNull: false,
	        }
		},
		{
			timestamps: false,
			tableName: 'model_has_roles'
    	}
    );
};

          
module.exports = ModelRole;