const { body } = require('express-validator');
const User = require("../models/user.model");

exports.validate = (method) => {
  	switch (method) {
    	case 'create': {
			return [ 
				body('name').exists().not().isEmpty().withMessage('Name Required'),
				body('email').exists().not().isEmpty().withMessage('Email Required')
					.isEmail().withMessage('Invalid email'),
				body('country_code').exists().not().isEmpty().withMessage('Country Code is required'),
				body('mobile').not().isEmpty().withMessage('Mobile is required').isInt().withMessage('Mobile is Number'),
				body('password').exists().not().isEmpty().withMessage('password is required')
							.isLength({min:6, max:16})
							// Custom message 
							.withMessage('Password must be between 6 to 16 characters'),
				body('password_confirmation').exists().not()
					.isEmpty()
					.withMessage('Confirm Password is required')
					
					// Custom validation 
					// Validate confirmPassword 
					.custom(async (password_confirmation, {req}) => {
						const password = req.body.password 
					
						// If password and confirm password not same 
						// don't allow to sign up and throw error 
						if(password !== password_confirmation){
							throw new Error('Passwords must be same') 
						} 
					}),
				body('is_term_accept').not().isEmpty().withMessage('Please Accept Term & conditions')
			]
		}
		case 'login': {
			return [ 
				body('email').exists().not().isEmpty().withMessage('Email Required')
					.isEmail().withMessage('Invalid email'),
				body('password').exists().not().isEmpty().withMessage('password is required'),
			]
		}
		case 'forgotPassword': {
			return [ 
				body('email').exists().notEmpty().withMessage('Email Required')
					.isEmail().withMessage('Invalid email'),
			]
		}
		case 'saveAddress': {
			return [ 
				body('user_id').exists().notEmpty().withMessage('Address is Required.'),
				body('address').exists().notEmpty().withMessage('Address is Required.'),
				body('latitude').exists().notEmpty().withMessage('Latitude is Required.'),
				body('longitude').exists().notEmpty().withMessage('Longitude is required.')
			]
		}
		case 'updateAddress': {
			return [
				body('id').exists().notEmpty().withMessage('Id is Required.'),
				body('user_id').exists().notEmpty().withMessage('User Id is Required.'),
				body('address').exists().notEmpty().withMessage('Address is Required.'),
				body('latitude').exists().notEmpty().withMessage('Latitude is Required.'),
				body('longitude').exists().notEmpty().withMessage('Longitude is required.')
			]
		}
		case 'updateProfile': {
			return [
				body('user_id').exists().withMessage('user_id is Required.').notEmpty().withMessage('User Id is Required.'),
				body('name').exists().withMessage('name is Required.').notEmpty().withMessage('Name is Required.'),
				body('country_code').exists().withMessage('country_code is Required.').notEmpty().withMessage('Country Code is Required.'),
				body('mobile').exists().withMessage('mobile is Required.').notEmpty().withMessage('Mobile is required.')
			]
		}
  	}
}

exports.response = (results) => {
    for (var key in results) {
		return results[key].msg;
    }
}