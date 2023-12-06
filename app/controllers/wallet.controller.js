const { validationResult } = require('express-validator');
const validationResponse =  require('../validators/user.validation');
const config = require('../config/config');
const commonController = require('./common.controller');

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var utils = require('../config/utils');
var constants = require('../config/constants');

const db = require("../models");
const User = db.user;
const Card = db.cards;
const Wallet = db.wallets;
const Op = db.Sequelize.Op;

//  add amount to wallet
exports.addAmount = async (req, res) => {

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
    
    User.findOne({ where: { id: req.body.user_id },
        raw: true, 
    }).then( async function(user) {

        var userData = await User.findOne({where:{id: req.body.user_id}});
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
		transactionRequestType.setAmount(req.body.amount);
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
						// console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
						// console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
						// console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
      //                   console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
                        
                        // Wallet data
                        const walletData = {
                            user_id: req.body.user_id,
                            transaction_id: response.getTransactionResponse().getTransId(),
                            transation_type: 'Payment',
                            transation_amount: req.body.amount,
                            balance_amount: req.body.user_id,
                            message: 'Payment added successfully.',
                            //transaction_response: JSON.stringify(response.getTransactionResponse()),
                            status: 1,

                        };

                        // console.log(walletData)

                        //Save User in the database
                        Wallet.create(walletData)
                            .then(data => {

                                res.json({
                                    "status_code":200,
                                    "message": "Payment added successfully.",
                                    "data":data
                                });
                            })
                            .catch(err => {
                                res.json({
                                    "status_code":422,
                                    "message": "Some error occurred while payment.",
                                    "err":err
                                });
                            });


					}
					else {
						console.log('Failed Transaction.');
						if(response.getTransactionResponse().getErrors() != null){
							console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
							console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                        }
                        res.json({
                            "status_code":422,
                            "message": response.getTransactionResponse().getErrors().getError()[0].getErrorText()
                        });
					}
				}
				else {
					console.log('Failed Transaction. ');
					if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
					
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                        console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                        res.json({
                            "status_code":422,
                            "message": response.getTransactionResponse().getErrors().getError()[0].getErrorText()
                        });
					}
					else {
						console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
                        console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
                        res.json({
                            "status_code":422,
                            "message": response.getMessages().getMessage()[0].getText()
                        });
					}
				}
			}
			else {
				console.log('Null Response.');
			}

		});

    });

    return

};

//  get Wallet list
exports.getWallets = (req, res) => {
        //get User card from database
        Wallet.findAll( {attributes: ['id','transaction_id','transation_type','transation_amount','balance_amount', 'message','created_at']},{ where: {user_id: req.params.user_id } })
            .then(async data => {

                var walletData = await Wallet.findOne({limit: 1,where:{user_id: req.params.user_id},
                    order: [ [ 'created_at', 'DESC' ]] })

                res.json({
                    "status_code":200,
                    "message": "Record Found successfully.",
                    "data":data,
                    "balance_amount":walletData.balance_amount,
                });
            })
            .catch(err => {
                res.json({
                    "status_code":422,
                    "message": "Some error occurred while get Card."
                });
            });
};