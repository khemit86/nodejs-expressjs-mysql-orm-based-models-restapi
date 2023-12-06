const { body } = require('express-validator');

exports.validate = (method) => {
  	switch (method) {
		case 'addAmount': {
			return [ 
				body('user_id').exists().notEmpty().withMessage('User id is Required.'),
				body('card_id').exists().notEmpty().withMessage('CArd id is Required.'),
				body('amount').exists().notEmpty().withMessage('Amount is Required.'),
			]
		}

  	}
}

exports.response = (results) => {
    for (var key in results) {
		return results[key].msg;
    }
}