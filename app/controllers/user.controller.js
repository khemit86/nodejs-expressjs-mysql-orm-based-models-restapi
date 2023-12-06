const { validationResult } = require('express-validator');

var bcrypt = require('bcrypt');
const path = require("path") 

const validationResponse =  require('../validators/user.validation');
const config = require('../config/config');
const commonController = require('./common.controller');

const db = require("../models");


var utils = require('../config/utils');
var constants = require('../config/constants');

var imagePath =  config.ImageDefaultPath+config.ImageProfile;

const User = db.user;
const Cart = db.cart;
const ModelRole = db.model_role;
const PasswordReset = db.password_reset;

const Op = db.Sequelize.Op;

// Create and Save a new Customer
exports.create = async (req, res) => {
    
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
	let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    // Create a User
    const user = {
			email: req.body.email,
			name: req.body.name,
			country_code: req.body.country_code,
			mobile: req.body.mobile,
			password: hashedPassword.replace('$2b$', '$2y$'),
			is_term_accept: req.body.is_term_accept,
			device_type: req.body.device_type,
			device_token: req.body.device_token
		};

		User.findOne({ where: {email: req.body.email},attributes: ['name', 'email','country_code','mobile','id','password'] }).then(function(response) {

			if(!response){
				//Save User in the database
				User.create(user) 
					.then( async user => {
						
						res.json({
							"status_code":200,
							"message": "User Register successfully.",
							"data":user
						});
					})
					.catch(err => {
						res.json({
							"status_code":422,
							"message": "Some error occurred while creating the User."
						});
					});
			}else{
				res.json({
					"status_code":422,
					"message": "Email id already Exists."
				});
			}
		})
};

// Retrieve all Customers from the database.
exports.login = (req, res) => {
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
	User.findOne({ where: {email: req.body.email},attributes: ['name','authorize_net_id', 'email','country_code','mobile','id','password'] }).then( async function(user) {
		if(user){
			// password is laravel hash we have convert it in node hash
			let userpassword = user.password;
			let password = userpassword.replace('$2y$','$2b$');
			if(bcrypt.compareSync(req.body.password,password)){

				// Update device type and token
				const items = {
					device_type: req.body.device_type,
					device_token: req.body.device_token,
				};

				User.update(items,{ where: { email: req.body.email },returning: true });

				if(!user.authorize_net_id){

					var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
					merchantAuthenticationType.setName(constants.apiLoginKey);
					merchantAuthenticationType.setTransactionKey(constants.transactionKey);
				
					var customerAddress = new ApiContracts.CustomerAddressType();
					customerAddress.setFirstName(user.name);
					customerAddress.setPhoneNumber(user.mobile);
				
					var customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
					customerPaymentProfileType.setCustomerType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
					customerPaymentProfileType.setBillTo(customerAddress);
				
					var customerProfileType = new ApiContracts.CustomerProfileType();
					customerProfileType.setMerchantCustomerId('M_' + utils.getRandomString('cust'));
					customerProfileType.setEmail(user.email);
				
					var createRequest = new ApiContracts.CreateCustomerProfileRequest();
					createRequest.setProfile(customerProfileType);
					createRequest.setMerchantAuthentication(merchantAuthenticationType);
		
					var ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());
				
					ctrl.execute(function(){
				
						var apiResponse = ctrl.getResponse();
						var response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);
				
						if(response != null) 
						{
							if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
							{
								console.log('Successfully created a customer profile with id: ' + response.getCustomerProfileId());
		
								const items = {
									authorize_net_id: response.getCustomerProfileId(),
								};
		
								User.update(items,{ where: { id: user.id },returning: true });
		
							}
							else
							{
								res.json({
									"status_code":422,
									"message": response.getMessages().getMessage()[0].getText()
								});
							}
						}
						else
						{
							console.log('Null response received');
						}
					});
			
				}
				
				Cart.findOne({ where: { user_id: user.id },
					attributes: [[db.Sequelize.fn('count', db.Sequelize.col('id')), 'total']],
					raw: true, 
				}).then( response => {
						res.json({
							"status_code":200,
							"message": "User Found successfully.",
							"cart_count":response['total'],
							"data":user							
						});
					});
			}else{
				res.json({
					"status_code":422,
					"message": "Password is invalid."
				});
			}
			
		}else{
			res.json({
				"status_code":422,
				"message": "Email id does't Exists."
			});
		}
	});
};

// Logout User from.
exports.logout = (req, res) => {
	
	return res.json({
		"status_code":200,
		"message": "User Logout successfully."
	});
    
};

// send email to user for reset password

exports.forgotPassword = (req,res) => {
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
	User.findOne({ where: {email: req.body.email} ,attributes: ['name', 'email','country_code','mobile','id','password'] }).then(function(user) {
		if(user){

			let token = Math.random().toString(36);
			let hashedPassword = bcrypt.hashSync(user.name, 10);
			
			const passworduser = {
				email: req.body.email,
				token: token,
			}

			PasswordReset.findOne({ where: {email: req.body.email} })
				.then(async function(user) {

				await PasswordReset.destroy({where: {email: req.body.email} });

				await PasswordReset.create(passworduser)
					.then(async data => {

						let mailOptions = {
							from: '"<jyothi pitta>" test@octalsoftware.com',
							to: user.email,
							subject: 'Reset your account password',
							html: '<h4><b>Reset Password</b></h4>' + '<p>To reset your password, complete this form:</p>' +
							'<a href=' + config.site_url + 'reset/' + token + '> Click Here</a>' +
							'<br><br>' + '<p>Support Team</p>'
						}
						
						const mailSent =  await commonController.sendMail1(mailOptions);

						//sending mail to the user where he can reset password.User id and the token generated are sent as params in a link
							res.json({
								"status_code":200,
								"message": 'Check your mail to reset your password.'
							});
						
					})
					.catch(err => {
						res.json({
							"status_code":422,
							"message": "Some error occurred while sending mail."
						});
					});
			});
		}else{
			res.json({
				"status_code":422,
				"message": "Email id does't Exists."
			});
		}
	});
}

// update user Profile 

exports.userProfile = async (req,res) =>  {
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
			name: req.body.name,
			country_code: req.body.country_code,
			mobile: req.body.mobile,
			device_type: req.body.device_type,
			device_token: req.body.device_token,
		};

		if(req.files){
			let images = req.files.profile;

			let imageName = Date.now()+path.extname( 
				images.name).toLowerCase();

			images.mv(imagePath+""+imageName);
			items.profile = imageName;

		}

		User.findOne({ where: {id: req.body.user_id},attributes: ['name', 'email','country_code','mobile','id','password'] }).then(function(row) {

				//update user details  in the database
				User.update(items,{ where: { id:req.body.user_id },returning: true })
					.then(async data => {

						const result = await User.findOne({ where: { id:req.body.user_id },attributes: ['name', 'email','country_code','mobile','id','profile'] });
						res.json({
							"status_code":200,
							"message": "User Profile Updated successfully.",
							"profileimageUrl":config.ImageDefaultURl+config.ImageProfile,
							"data":result
						});
					})
					.catch(err => {
						res.json({
							"status_code":422,
							"message": "Some error occurred while saving Profile."
						});
					});
		})
		.catch(err => {
			res.json({
				"status_code":422,
				"message": "No User Found."
			});
		});
}
