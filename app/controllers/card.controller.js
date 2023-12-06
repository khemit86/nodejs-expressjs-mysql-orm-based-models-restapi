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
const Op = db.Sequelize.Op;

//  Save Card
exports.addCard = async (req, res) => {

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

        var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(constants.apiLoginKey);
        merchantAuthenticationType.setTransactionKey(constants.transactionKey);
    
        var creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber(req.body.card_no);
        creditCard.setExpirationDate(req.body.exp_month+req.body.exp_year);
    
        var paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);
    
        var profile = new ApiContracts.CustomerPaymentProfileType();
        profile.setPayment(paymentType);
        // profile.setDefaultPaymentProfile(true);
    
        var createRequest = new ApiContracts.CreateCustomerPaymentProfileRequest();
    
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setCustomerProfileId(user.authorize_net_id);
        createRequest.setPaymentProfile(profile);

        var ctrl = new ApiControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());
    
        ctrl.execute(async function(){
    
            var apiResponse = ctrl.getResponse();
            var response = new ApiContracts.CreateCustomerPaymentProfileResponse(apiResponse);
    
            if(response != null) 
            {
                if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
                {
                    console.log('createCustomerPaymentProfile: Successfully created a customer payment profile with id: ' + response.getCustomerPaymentProfileId());

                    // Create a Card
                    const card = {
                        user_id: req.body.user_id,
                        card_no: req.body.card_no,
                        exp_month: req.body.exp_month,
                        exp_year: req.body.exp_year,
                        token: response.getCustomerPaymentProfileId(),
                        is_default: (req.body.is_default)?req.body.is_default:0
                    };

                    if(req.body.is_default == 1)
                        await Card.update({ is_default: 0 },{ where: { user_id: req.body.user_id } });

                    //Save User in the database
                    Card.create(card)
                        .then(data => {
                            res.json({
                                "status_code":200,
                                "message": "Card Saved successfully.",
                                "data":data
                            });
                        })
                        .catch(err => {
                            res.json({
                                "status_code":422,
                                "message": "Some error occurred while saving Card."
                            });
                        });

                }
                else
                {
                    console.log('Result Code: ' + response.getMessages().getResultCode());
                    console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
                    console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

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

        return

    });

    return

};

//  get Card list
exports.getCard = (req, res) => {
        //get User card from database
        Card.findAll({ where: {user_id: req.params.user_id } })
            .then(data => {
                res.json({
                    "status_code":200,
                    "message": "Record Found successfully.",
                    "data":data
                });
            })
            .catch(err => {
                res.json({
                    "status_code":422,
                    "message": "Some error occurred while get Card."
                });
            });
};

//  update Card
exports.updateCard = async (req, res) => {

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

    // Create a Card
    const card = {
            user_id: req.body.user_id,
            brand: req.body.brand,
            funding: req.body.funding,
            last4: req.body.last4,
            token: req.body.token,
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            is_default: (req.body.is_default)?req.body.is_default:0
        };

        if(req.body.is_default == 1)
            await Card.update({ is_default: 0 },{ where: { user_id: req.body.user_id } });

        //Save User in the database
        Card.update(card,{ where: { id:req.body.id } })
            .then(data => {
                res.json({
                    "status_code":200,
                    "message": "Card Saved successfully.",
                    "data":data
                });
            })
            .catch(err => {
                res.json({
                    "status_code":422,
                    "message": "Some error occurred while saving Card."
                });
            });
};

//  delete Card
exports.deleteCard = (req, res) => {

    Card.findOne({ where: {id: req.params.id } })
        .then(async card => {
            
            var userData = await User.findOne({where:{id: card.user_id}})

            var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
            merchantAuthenticationType.setName(constants.apiLoginKey);
            merchantAuthenticationType.setTransactionKey(constants.transactionKey);
        
            var deleteRequest = new ApiContracts.DeleteCustomerPaymentProfileRequest();
            deleteRequest.setMerchantAuthentication(merchantAuthenticationType);
            deleteRequest.setCustomerProfileId(userData.authorize_net_id);	
            deleteRequest.setCustomerPaymentProfileId(card.token);
                
            var ctrl = new ApiControllers.DeleteCustomerPaymentProfileController(deleteRequest.getJSON());
        
            ctrl.execute(function(){
        
                var apiResponse = ctrl.getResponse();
        
                var response = new ApiContracts.DeleteCustomerPaymentProfileResponse(apiResponse);
        
                //pretty print response
                //console.log(JSON.stringify(response, null, 2));
        
                if(response != null) 
                {
                    if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
                    {
                        console.log('Successfully deleted a customer payment profile with id: ' + userData.authorize_net_id);
                        
                            //delete card in the database
                            Card.destroy({ where: { id:req.params.id } })
                            .then(data => {
                                res.json({
                                    "status_code":200,
                                    "message": "Card Deleted successfully.",
                                });
                            })
                            .catch(err => {
                                res.json({
                                    "status_code":422,
                                    "message": "Some error occurred while saving Card."
                                });
                            });
        
        
                    }
                    else
                    {
                        //console.log('Result Code: ' + response.getMessages().getResultCode());
                        console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
                        console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
                    }
                }
                else
                {
                    console.log('Null response received');
                }
        
            });

        })
        .catch(err => {
            res.json({
                "status_code":422,
                "message": "Some error occurred while get Card."
            });
        });



    return



};
