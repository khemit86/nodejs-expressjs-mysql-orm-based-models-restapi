const { body } = require('express-validator');

exports.validate = (method) => {
  	switch (method) {
		case 'saveCard': {
			return [ 
				body('user_id').exists().notEmpty().withMessage('User id is Required.'),
				body('card_no').exists().notEmpty().withMessage('Card number is Required.'),
				body('exp_month').exists().notEmpty().withMessage('Exp Month is required.'),
				body('exp_year').exists().notEmpty().withMessage('Exp Year is required.')
			]
		}
		case 'updateCard': {
			return [ 
				body('user_id').exists().notEmpty().withMessage('User id is Required.'),
				body('card_no').exists().notEmpty().withMessage('Card number is Required.'),
				body('exp_month').exists().notEmpty().withMessage('Exp Month is required.'),
				body('exp_year').exists().notEmpty().withMessage('Exp Year is required.')
			]
		}
  	}
}

exports.response = (results) => {
    for (var key in results) {
		return results[key].msg;
    }
}