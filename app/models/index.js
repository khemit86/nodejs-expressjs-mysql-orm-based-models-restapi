const dbConfig = require("../config/db.config");

//create Sequelize Object
const Sequelize = require("sequelize");

// Create Database Connection Object 
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model")(sequelize, Sequelize);
db.role_user = require("./role_user.model")(sequelize, Sequelize);
db.permission_user = require("./permission_user.model")(sequelize, Sequelize);
db.password_reset = require("./password_reset.model")(sequelize, Sequelize);
db.addresses = require("./addresses.model")(sequelize, Sequelize);
db.model_role = require("./model_role.model")(sequelize, Sequelize);
db.restaurent = require("./restaurent.model")(sequelize, Sequelize);
db.master_menu = require("./master_menu.model")(sequelize, Sequelize);
db.restaurant_menu = require("./restaurant_menu.model")(sequelize, Sequelize);
db.review = require("./review.model")(sequelize, Sequelize);
db.cart = require("./carts.model")(sequelize, Sequelize);
db.language = require("./language.model")(sequelize, Sequelize);
db.coupon = require("./coupon.model")(sequelize, Sequelize);
db.order = require("./order.model")(sequelize, Sequelize);
db.order_product = require("./order_product.model")(sequelize, Sequelize);
db.order_payment = require("./order_payment.model")(sequelize, Sequelize);
db.cards = require("./card.model")(sequelize, Sequelize);
db.wallets = require("./wallet.model")(sequelize, Sequelize);


db.restaurent.hasMany(db.restaurant_menu, { as: 'Food' ,foreignKey: 'restaurant_id', targetKey: 'id'});

db.restaurent.hasMany(db.review, { as: 'review' ,foreignKey: 'restaurant_id', targetKey: 'id'});

db.restaurant_menu.belongsTo(db.master_menu,{foreignKey: 'item_id', targetKey: 'id'});

db.cart.belongsTo(db.master_menu,{ as: 'item',foreignKey: 'item_id',});

db.order.belongsTo(db.restaurent,{ as: 'restaurent', foreignKey: 'restaurant_id', targetKey: 'id' });

db.order.hasMany(db.order_product,{ as: 'products', foreignKey: 'order_id', targetKey: 'id' });

db.order.hasMany(db.order_payment,{ as: 'payment', foreignKey: 'order_id', targetKey: 'id' });

db.order_product.belongsTo(db.master_menu,{as: 'item', foreignKey: 'item_id', targetKey: 'id'});

db.review.belongsTo(db.master_menu,{as: 'item', foreignKey: 'item_id', targetKey: 'id'});

db.review.belongsTo(db.restaurent,{as: 'restaurent', foreignKey: 'restaurant_id', targetKey: 'id'});

db.review.belongsTo(db.user,{as: 'user', foreignKey: 'user_id', targetKey: 'id'});

module.exports = db;