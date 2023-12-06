const { validationResult } = require('express-validator');
const validationResponse =  require('../validators/general.validation');
const config = require('../config/config');

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var utils = require('../config/utils');
var constants = require('../config/constants');

const db = require("../models");
const { createTransport } = require('nodemailer');
const Order = db.order;
const OrderProduct = db.order_product;
const Item = db.master_menu;
const Cart = db.cart;
const Card = db.cards;
const User = db.user;
const Wallet = db.wallets;
const OrderPayment = db.order_payment;

const Restaurant = db.restaurent;

const Op = db.Sequelize.Op;

// Add order Details in the database.
exports.checkout = async (req, res) => {

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

	if (!req.body.items) {
		return res.json({
			"status_code":422,
			"message": "Items required."
		});
	}

		var userData = await User.findOne({where:{id: req.body.user_id}});

		var userWalletData = await  Wallet.findOne({
									where: {
											user_id: req.body.user_id 
										},
									attributes: ['balance_amount', 'id', 'transation_type'],
									order: [
							            ['id', 'DESC']
							        ]
							    });

		if(req.body.total > userWalletData.balance_amount){
			return res.json({
					"status_code":422,
					"message":"Wallet Amount is less.Please add amount to wallet.",
				});
		}

		/*

		var cardData = await Card.findOne({where:{id: req.body.card_id}});

		var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
		merchantAuthenticationType.setName(constants.apiLoginKey);
		merchantAuthenticationType.setTransactionKey(constants.transactionKey);

		var profileToCharge = new ApiContracts.CustomerProfilePaymentType();
		profileToCharge.setCustomerProfileId(userData.authorize_net_id);

		var paymentProfile = new ApiContracts.PaymentProfile();
		paymentProfile.setPaymentProfileId(cardData.token);
		profileToCharge.setPaymentProfile(paymentProfile);

		var orderDetails = new ApiContracts.OrderType();
		orderDetails.setInvoiceNumber('INV-12345');
		orderDetails.setDescription('Product Description');

		var transactionRequestType = new ApiContracts.TransactionRequestType();
		transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
		transactionRequestType.setProfile(profileToCharge);
		transactionRequestType.setAmount(req.body.total);
		//transactionRequestType.setLineItems(lineItems);
		transactionRequestType.setOrder(orderDetails);
		//transactionRequestType.setShipTo(shipTo);

		var createRequest = new ApiContracts.CreateTransactionRequest();
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setTransactionRequest(transactionRequestType);

		//pretty print request
		console.log(JSON.stringify(createRequest.getJSON(), null, 2));
			
		var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

		ctrl.execute(function(){

			var apiResponse = ctrl.getResponse();

			var response = new ApiContracts.CreateTransactionResponse(apiResponse);

			//pretty print response
			console.log(JSON.stringify(response, null, 2));

			if(response != null){
				if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
					if(response.getTransactionResponse().getMessages() != null){
						console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
						console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
						console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
						console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
					}
					else {
						console.log('Failed Transaction.');
						if(response.getTransactionResponse().getErrors() != null){
							console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
							console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
						}
					}
				}
				else {
					console.log('Failed Transaction. ');
					if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
					
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
					else {
						console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
						console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
					}
				}
			}
			else {
				console.log('Null Response.');
			}

		});
	*/

	var orderData = {
		status: config.orderStatus.Pending,
		payment_status: req.body.payment_status,
		restaurant_id: req.body.restaurant_id,
		user_id: req.body.user_id,
		subtotal: req.body.subtotal,
		total: req.body.total,
		address:req.body.address,
		delivery_type: req.body.delivery_type,
		delivery_time: req.body.delivery_time
	}

	const payments = [];

	const orderPaymentdetails = req.body.payments;

	try {     
		const order = await Order.create(orderData)
		const orderId = order.id;
		const cartData = await Cart.findAll({ where: { status: config.status.Active, user_id:  req.body.user_id } })
		
		var allItems = [];
		for(var i = 0; i < cartData.length; i++){
			var items = {
				order_id:orderId,
				restaurant_id:cartData[i].restaurant_id,
				item_id:cartData[i].item_id,
				quantity:cartData[i].quantity,
				price:cartData[i].price
			}
			if(cartData[i].extra_items != ''){
				items.extra_items = cartData[i].extra_items
			}

			allItems.push(items);
		}

		await OrderProduct.bulkCreate(allItems);

		for (let j = 0; j < orderPaymentdetails.length; j++) {
			const paymentData = {
					order_id:orderId,
					name:orderPaymentdetails[j].name,
					price:orderPaymentdetails[j].price
				};

			payments.push(paymentData);
		}

		await Cart.destroy({ where: { user_id: req.body.user_id } });

		await OrderPayment.bulkCreate(payments);

		var orderNumber = config.orderNumber + orderId + order.restaurant_id;

		var balance_amount = userWalletData.balance_amount - req.body.total;

		const walletData = {
                    user_id: req.body.user_id,
                    transaction_id: orderNumber,
                    transation_type: 'Order Payment',
                    transation_amount: req.body.total,
                    balance_amount: balance_amount,
                    message: 'Order Created Successfully. With order No. '+orderNumber,
                    status: 1,
                };

                        // console.log(walletData)

                        //Save User in the database
        await Wallet.create(walletData).then(data => {

                               Order.update({order_number:orderNumber,payment_status:'1'},{ where: { id:orderId } });

                               return res.json({
									"status_code":200,
									"message": "Order Created Successfully.",
									"data":order
								});

                            })
                            .catch(err => {
                            	Order.update({order_number:orderNumber,payment_status:'2'},{ where: { id:orderId } });

                                return res.json({
	                                    "status_code":422,
	                                    "message": "Some error occurred while payment.",
	                                    "err":err
	                                });
                            });

	} catch (error) {
		res.json({
			"status_code":422,
			"message": "Somthing Went Wrong."
		});   
	}

};


// Retrive Order list from database for particular user 
exports.orderList =  async (req,res) => {

	try {
	
		console.log(req.header('x-localization'));
		await Order.findAll({ where: { user_id:  req.params.user_id },
			attributes: {
				include: [[db.Sequelize.literal('restaurent.name'), 'name'],[db.Sequelize.literal('restaurent.image'), 'image']],
			},
			include: [
				{
					model: Restaurant,
					as: 'restaurent',
					attributes: [],
					required: false,
				}
			] 
		})
		.then(function(response) {
				if(response.length > 0){
					res.json({
						"status_code":200,
						"message": "Record Found successfully.",
						"restaurantimageUrl":config.ImageDefaultURl+config.ImageRestaurant,
						"data":response
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
}

// Retrive Order list from database for particular user 
exports.orderDeatils =  async (req,res) => {

	try {
		await Order.findOne({ where: { id:  req.params.order_id },
				attributes: {
					include: [[db.Sequelize.literal('restaurent.name'), 'name'],[db.Sequelize.literal('restaurent.image'), 'image']],
				},
				include: [
					{
						model: Restaurant,
						as: 'restaurent',
						attributes: [],
						required: false,
					},
					{
						model: OrderProduct,
						as: 'products',
						required: false,
						include: [
							{
							model: Item,
							as: 'item',
							required: false,
							}
						],
					},
					{
						model: OrderPayment,
						as: 'payment',
						attributes: ['name','price'],
						required: false,
					}
				] 
			})
			.then(function(response) {
				if(response){
					res.json({
						"status_code":200,
						"message": "Record Found successfully.",
						"restaurantimageUrl":config.ImageDefaultURl+config.ImageRestaurant,
						"foodimageUrl":config.ImageDefaultURl+config.ImageMenuItem,
						"data":response
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
}