const { validationResult } = require('express-validator');
const validationResponse =  require('../validators/restaurant.validation');
const config = require('../config/config');


const db = require("../models");
const User = db.user;
const Restaurant = db.restaurent;
const RestaurantMenu = db.restaurant_menu;
const MasterMenu = db.master_menu;
const Review = db.review;
const Coupon = db.coupon;
const Cart = db.cart;

const Op = db.Sequelize.Op;

// Retrieve all Restaurant from the database.
exports.getRestaurant = async (req, res) => {

	try {
		await Promise.all([
			Restaurant.findAll({ where: {status: config.status.Active },
				include:[
					{ 
						model: RestaurantMenu,
						as:'Food',
						where: { status: config.status.Active },
						required: false,
						separate : true,
						attributes: ['item_id'],
						limit: 2,
						include: [
							{
								model: MasterMenu,
							}
						]
					}
				]
			}),
			Coupon.findAll({ where: {status: config.status.Active } }),

		])
		.then(function(response) {		
				if(response.length > 0){
					res.json({
						"status_code":200,
						"message": "Record Found successfully.",
						"restaurantimageUrl":config.ImageDefaultURl+config.ImageRestaurant,
						"foodimageUrl":config.ImageDefaultURl+config.ImageMenuItem,
						"couponimageUrl":config.ImageDefaultURl+config.ImageCoupon,
						"data":response[0],
						'coupons':response[1]
					});
				}else{
					res.json({
						"status_code":422,
						"message": "No Record Found."
					});
				}
		});
	}
	catch(e) {
		res.json({
			"status_code":422,
			"message": "Some error occurred while getting Details."
		});
	}
};

exports.getRestaurantDetails = async (req,res) => {
	
	try {
		await Promise.all([
			Restaurant.findOne({ where: {status: config.status.Active,id: req.params.id },
				include:[
					{ 
						model: RestaurantMenu,
						as:'Food',
						where: { status: config.status.Active },
						required: false,
						attributes: ['item_id'],
						include: [
							{
								model: MasterMenu,
							}
						]
					}
				] 
			}),
			Review.findOne({ where: { status: config.status.Active, type: config.rating.Restaurant, restaurant_id: req.params.id },
				attributes: [[db.Sequelize.fn('avg', db.Sequelize.col('rating')), 'rating'],[db.Sequelize.fn('count', db.Sequelize.col('restaurant_id')), 'total_comment']],
				raw: true, 
			})	
		])
		.then(function(response) {		
				if(response.length > 0){
					res.json({
						"status_code":200,
						"message": "Found successfully.",
						"restaurantimageUrl":config.ImageDefaultURl+config.ImageRestaurant,
						"foodimageUrl":config.ImageDefaultURl+config.ImageMenuItem,
						"data":response[0],
						'rating':response[1]['rating'],
						'total_comment':response[1]['total_comment']
					});
				}else{
					res.json({
						"status_code":422,
						"message": "No Record Found."
					});
				}
			}
		);
	}
	catch(e) {
		res.json({
			"status_code":422,
			"message": "Some error occurred while getting Details."
		});
	}
}