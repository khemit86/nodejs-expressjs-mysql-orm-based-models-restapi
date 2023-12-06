const { body } = require('express-validator');

exports.validate = (method) => {
  	switch (method) {
    	case 'list': {
			return [
				body('type').exists().withMessage('type Required.').notEmpty().withMessage('Type Required.'),
			]
		}
		case 'checkout': {
			return [ 
				body('restaurant_id').exists().withMessage('restaurant_id Required.').notEmpty().withMessage('Restaurant Id Required.'),
				body('user_id').exists().withMessage('user_id Required.').notEmpty().withMessage('USer Id Required'),
				body('delivery_type').exists().withMessage('delivery_type Required.').notEmpty().withMessage('Delivery Type Required'),
				body('delivery_time').exists().withMessage('delivery_time Required.').notEmpty().withMessage('Delivery Time is required'),
				body('subtotal').notEmpty().withMessage('Sub Total is required'),
				body('total').notEmpty().withMessage('Total is required'),
				body('payment_status').notEmpty().withMessage('Total is required').isInt().withMessage('payment_status is Number'),
			]
		}
		case 'addRating': {
			return [ 
				body('restaurant_id').exists().withMessage('restaurant_id Required.').notEmpty().withMessage('Restaurant Id Required.'),
				body('user_id').exists().withMessage('user_id Required.').notEmpty().withMessage('USer Id Required'),
				body('type').exists().withMessage('type Required.').notEmpty().withMessage('Type Required'),
				body('rating').exists().withMessage('rating Required.').notEmpty().withMessage('Rating is required').isInt().withMessage('Rating must be is a Number'),
			]
		}
		
  	}
}

exports.response = (results) => {
    for (var key in results) {
		return results[key].msg;
    }
}