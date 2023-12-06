const { validationResult } = require('express-validator');
const config = require('../config/config');


const db = require("../models");
const Language = db.language;
const Coupon = db.coupon;

const Op = db.Sequelize.Op;

// Retrieve all language from the database.
exports.getLanguage = (req, res) => {

	
	var conditions = {
		status: config.status.Active
	}
	Language.findAll({ where: conditions ,attributes: ['name', 'lang_code','id'] })
				.then(function(response) {

					if(response.length > 0){
						res.json({
							"status_code":200,
							"message": "Record Found successfully.",
							"data":response
						});
					}else{
						res.json({
							"status_code":422,
							"message": "No Record Found."
						});
					}
				}
			);
};

// Retrieve all Coupon Code from the database.
exports.getCoupons = (req, res) => {

	var conditions = { 	status: config.status.Active }
	Coupon.findAll({ where: conditions })
				.then(function(response) {

					if(response.length > 0){
						res.json({
							"status_code":200,
							"message": "Record Found successfully.",
							"couponimageUrl":config.ImageDefaultURl+config.ImageCoupon,
							"data":response
						});
					}else{
						res.json({
							"status_code":422,
							"message": "No Record Found."
						});
					}
				}
			);
};