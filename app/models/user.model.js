//const sql = require("../config/connection");
const Sequelize = require("sequelize");

const User = (sequelize, Sequelize) => { 
  return sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email:{
            type: Sequelize.STRING,
            unique: true,
            allowNull:false
        },
        country_code:{
          type: Sequelize.STRING,
          allowNull:true
        },
        device_type:{
          type: Sequelize.STRING,
          allowNull:true
        },
        device_token:{
          type: Sequelize.STRING,
          allowNull:true
        },
        authorize_net_id:{
          type: Sequelize.STRING,
          allowNull:true
        },
        profile:{
          type: Sequelize.STRING,
          allowNull:true
        },
        mobile: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isValidPhoneNo: function(value) {
              if (!value) return value;
        
              var regexp = /^[0-9]+$/;
              var values = (Array.isArray(value)) ? value : [value];
        
              values.forEach(function(val) {
                if (!regexp.test(val)) {
                  throw new Error("Number only is allowed.");
                }
              });
              return value;
            }
          }
        },
        password:{
          type: Sequelize.STRING,
          allowNull: false,
        },
        is_term_accept:{
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        created_at: Sequelize.DATE,
        updated_at:  Sequelize.DATE,
        },
        {
          timestamps: false,		
        });
};

          
module.exports = User;