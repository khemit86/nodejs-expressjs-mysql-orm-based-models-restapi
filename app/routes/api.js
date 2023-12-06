var express = require('express');
var router = express.Router();
const userController = require("../controllers/user.controller");
const addressController = require("../controllers/address.controller");
const restaurantController = require("../controllers/restaurant.controller");
const reviewController = require("../controllers/review.controller");
const cartController = require("../controllers/cart.controller");
const generalController = require("../controllers/general.controller");
const orderController = require("../controllers/order.controller");
const cardController = require("../controllers/card.controller");
const walletController = require("../controllers/wallet.controller");

const userValidation = require("../validators/user.validation");
const cardValidation = require("../validators/card.validation");
const cartValidation = require("../validators/cart.validation");
const walletValidation = require("../validators/wallet.validation");
const generalValidation = require("../validators/general.validation");
    
    // Create a new Customer
    router.post("/register",userValidation.validate('create'), userController.create);
  
    // login 
    router.post("/login",userValidation.validate('login'), userController.login);

    // update profile 
    router.post("/profile",userValidation.validate('updateProfile'), userController.userProfile);

    // logout 
    router.post("/logout", userController.logout);
    
	// forget password
	router.post("/forget-password",userValidation.validate('forgotPassword'), userController.forgotPassword);
  
    // get User Address list 
    router.get("/addresses/:user_id", addressController.getAddress);

    // save User Address 
    router.post("/save-address",userValidation.validate('saveAddress'), addressController.addAddress);

    // update User Address 
    router.post("/update-address",userValidation.validate('updateAddress'), addressController.updateAddress);

    // Delete Address 
    router.get("/delete-address/:id",addressController.deleteAddress);
    
    // get Restaurants list 
    router.get("/get-restaurant", restaurantController.getRestaurant);
    // get Restaurants Details 
    router.get("/restaurant/:id", restaurantController.getRestaurantDetails);

    // get Ratings  list
    router.all("/get-ratings", generalValidation.validate('list'),reviewController.getReview);

    // Add Ratings
    router.all("/add-rating", generalValidation.validate('addRating'),reviewController.addReview);

    // get Restaurants Details 
    router.get("/carts/:user_id", cartController.getCartList);

    // Delete item from carts 
    router.get("/delete-cart/:id", cartController.deleteCart);

    // Empty item from carts 
    router.get("/empty-cart/:user_id", cartController.emptyCart);


    router.get("/cart-items/:user_id", cartController.cartTotalItems);
    
    // add to cart
    router.all("/add-cart",cartValidation.validate('list'), cartController.addToCart);

    // add to cart
    router.all("/update-cart",cartValidation.validate('update'), cartController.updateCart);

    // get Language list 
    router.get("/languages", generalController.getLanguage);

    // get All Coupon Code list 
    router.get("/coupons", generalController.getCoupons);

    // checkout
    router.all("/checkout",generalValidation.validate('checkout'), orderController.checkout);

    // get Order list for particular User
    router.all("/orders/:user_id", orderController.orderList);

    // get Order details for particular Order
    router.all("/order-details/:order_id", orderController.orderDeatils);


    // get User Card list 
    router.get("/cards/:user_id", cardController.getCard);

    // save User Card 
    router.post("/save-card",cardValidation.validate('saveCard'), cardController.addCard);

    // update User Card 
    router.post("/update-card",cardValidation.validate('updateCard'), cardController.updateCard);

    // Delete Card 
    router.get("/delete-card/:id",cardController.deleteCard);


    // get User Card list 
    router.get("/wallets/:user_id", walletController.getWallets);

    // save User Card 
    router.post("/add-amount",walletValidation.validate('addAmount'), walletController.addAmount);

  
module.exports = router;