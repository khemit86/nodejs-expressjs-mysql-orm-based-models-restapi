const { validationResult } = require('express-validator');
const config = require('../config/config');
const validationResponse =  require('../validators/restaurant.validation');

const db = require("../models");

const Cart = db.cart;
const MasterMenu = db.master_menu;
const Restaurant = db.restaurent;

const Op = db.Sequelize.Op;
const Wallet = db.wallets;

// add cart data in  database .
exports.addToCart = (req, res) => {

	const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    const myValidationResult = validationResult.withDefaults({
        formatter: (error) => {
            return { msg: error.msg,};
        }
    });
  
    if (!errors.isEmpty()) {
        var results =  myValidationResult(req).mapped();
    
        var response = validationResponse.response(results);
    
        return res.json({
                    "status_code":422,
                    "message":response,
                });
    }

    // Create a Address
    const items = {
            user_id: req.body.user_id,
            restaurant_id: req.body.restaurant_id,
            item_id: req.body.item_id,
            price: req.body.price,
			quantity: req.body.quantity,
        };

        if(req.body.extra_items != ''){
			items.extra_items = req.body.extra_items;
		}
		
		Cart.findOne({ where: {user_id: req.body.user_id, item_id: req.body.item_id} })
			.then( async function(user_cart) {
				if(!user_cart){

					//Save User in the database
					Cart.create(items)
						.then(async function (data) {
							await Cart.findOne({ where: { user_id: req.body.user_id },
								attributes: [[db.Sequelize.fn('count', db.Sequelize.col('id')), 'total']],
								raw: true, 
							}).then( response => {
								res.json({
									"status_code":200,
									"message": "Data Added to cart Successfully.",
									"cart_count":response['total'],
									"data":data						
								});
							});
						})
						.catch(err => {
							res.json({
								"status_code":422,
								"message": "Some error occurred while saving Address."
							});
						});
				}else{

					await user_cart.increment({ 'quantity': 1 });

					await Cart.findOne({ where: { user_id: req.body.user_id },
						attributes: [[db.Sequelize.fn('count', db.Sequelize.col('id')), 'total']],
						raw: true, 
					}).then( response => {
							res.json({
								"status_code":200,
								"message": "Data Added to cart Successfully.",
								"cart_count":response['total'],
								"data":user_cart						
							});
						});

				}
			}
		);
};

exports.getCartList = async (req,res) => {
	
	try {
		await Cart.findAll({ where: { status: config.status.Active, user_id: req.params.user_id },
					attributes: {
						include: [[db.Sequelize.literal('item.name'), 'item_name']],
					},
					include: [
						{
							model: MasterMenu,
							as: 'item',
							attributes: [],
							required: false,
						}
					] 
					})
					.then(async function(response) {
							if(response.length > 0){
								
								const restaurant =  await Restaurant.findOne({ where: {status: config.status.Active,id: response[0].restaurant_id } });
								var walletData = await Wallet.findOne({limit: 1,where:{user_id: req.params.user_id},
									order: [ [ 'created_at', 'DESC' ]] })
								res.json({
									"status_code":200,
					 				"message": "Found successfully.",
									"restaurantimageUrl":config.ImageDefaultURl+config.ImageRestaurant,
									"foodimageUrl":config.ImageDefaultURl+config.ImageMenuItem,
									"data":response,
									"restaurant":restaurant,
									"balance_amount":walletData.balance_amount,
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
};

//  update Customer Cart
exports.updateCart = (req, res) => {

    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    const myValidationResult = validationResult.withDefaults({
        formatter: (error) => {
            return { msg: error.msg,};
        }
    });
  
    if (!errors.isEmpty()) {
        var results =  myValidationResult(req).mapped();
    
        var response = validationResponse.response(results);
    
        return res.json({
                    "status_code":422,
                    "message":response,
                });
    }

		// Create a Address
		const items = {
			user_id: req.body.user_id,
			restaurant_id: req.body.restaurant_id,
			item_id: req.body.item_id,
			price: req.body.price,
			quantity: req.body.quantity
		};

		if(req.body.extra_items != ''){
			items.extra_items = req.body.extra_items;
		}

        //update cart details  in the database
        Cart.update(items,{ where: { id:req.body.id },returning: true })
            .then(async data => {

				const result = await Cart.findOne({ where: { id:req.body.id } });
                res.json({
                    "status_code":200,
					"message": "Cart Updated successfully.",
					"data":result
                });
            })
            .catch(err => {
                res.json({
                    "status_code":422,
                    "message": "Some error occurred while saving Address."
                });
            });
};


//  delete Customer Cart items
exports.deleteCart = (req, res) => {
	//console.log(req.params.id);return false;
        //delete User in the database
        Cart.destroy({ where: { id:req.params.id } })
            .then(data => {
                res.json({
                    "status_code":200,
                    "message": "Cart item Deleted successfully.",
                });
            })
            .catch(err => {
                res.json({
                    "status_code":422,
                    "message":err
                });
            });
};

//  Empty Customer Cart items
exports.emptyCart = (req, res) => {

	//delete User in the database
	Cart.destroy({ where: { user_id:req.params.user_id } })
		.then(data => {
			res.json({
				"status_code":200,
				"message": "Cart Deleted successfully.",
			});
		})
		.catch(err => {
			res.json({
				"status_code":422,
				"message": "Some error occurred while saving Address."
			});
		});
};

//  Count Customer Cart items
exports.cartTotalItems = (req, res) => {

		//get Cart count from  database
		Cart.findOne({ where: { user_id: req.params.user_id },
			attributes: [[db.Sequelize.fn('count', db.Sequelize.col('id')), 'total']],
			raw: true, 
		})
		.then(data => {
			res.json({
				"status_code":200,
				"message": "Cart Found successfully.",
				"total_items":data.total
			});
		})
		.catch(err => {
			res.json({
				"status_code":422,
				"message": "Some error occurred while saving Address."
			});
		});
};