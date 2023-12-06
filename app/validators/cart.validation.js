const { body } = require('express-validator');

exports.validate = (method) => {
  	switch (method) {
    	case 'list': {
			return [ 
				body('restaurant_id').exists().withMessage('restaurant_id Required.').notEmpty().withMessage('Restaurant Id Required.'),
				body('user_id').exists().withMessage('user_id Required.').notEmpty().withMessage('User Id Required'),
				body('item_id').exists().withMessage('item_id Required.').notEmpty().withMessage('Item Id Required'),
				body('quantity').exists().withMessage('quantity Required.').notEmpty().withMessage('Quantity Required').isInt().withMessage('Quantity is Number'),
				body('price').exists().notEmpty().withMessage('Price Required'),
			]
		}
		case 'update': {
			return [ 
				body('id').exists().withMessage('id Required.').notEmpty().withMessage('Cart Id Required'),
				body('user_id').exists().withMessage('user_id Required.').notEmpty().withMessage('User Id Required'),
				body('item_id').exists().withMessage('item_id Required.').notEmpty().withMessage('Item Id Required'),
				body('quantity').exists().withMessage('quantity Required.').notEmpty().withMessage('Quantity Required').isInt().withMessage('Quantity is Number'),
			]
		}
  	}
}

exports.response = (results) => {
    for (var key in results) {
		return results[key].msg;
    }
}