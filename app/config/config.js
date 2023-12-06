module.exports = {
    proxyURL: 'http://url:port',
    TWITTER: {
        consumerkey: 'yourconsumerkey',
        consumerSecrete: 'yourconsumersecrete'
    },
    GOOGLE: {
        consumerkey: 'yourconsumerkey',
        consumerSecrete: 'yourconsumersecrete'
    },
    FACEBOOK: {
        consumerkey: 'yourconsumerkey',
        consumerSecrete: 'yourconsumersecrete'
    },    
	site_url:'http://localhost:4200/',
	admin_mail:'dinesh@mailinator.com',
	site_name:'dddsadaaaaa',
	senderHost :'smtp.gmail.com',
	senderPort :'587',
	senderUsername :'test@gmail.com',
	senderPassword :'test@123',
    senderFrom :'testst<test@gmail.com>',
    orderNumber :1000,
    status : {
        Active: '1',
        Deactive: '0'
    },
    rating : {
        Restaurant: '1',
        Food: '2'
    },
    DeliveryType : {
        Now: '1',
        Later: '2'
    },
    orderStatus : { 
        Pending: '0',
        Processing: '1',
        Delivered:'2',
        Cancelled:'3'
    },
    paymentStatus : {
        Pending: '0',
        Paid: '1',
        Failed: '2',
        Refund:'3'
    },
    ImageDefaultPath:"D:/xampp/htdocs/sardichicken/storage/app/public/upload/",
    ImageDefaultURl:"http://192.168.1.103/sardichicken/public/storage/upload/",
    ImageRestaurant:"restaurant/",
    ImageMenuItem:"menuitems/",
    ImageCoupon:"coupon/",
    ImageProfile:"profile/"
	
}