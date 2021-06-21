mongoose = require('mongoose')

    const paymentSchema = new mongoose.Schema({
        price : Number , 
        userchatId : String , 
        // quantity : Number   ,
        date :  { type: Date, default: Date.now },    
    })



const BuyedItem = mongoose.model('BuyedItem' , buyedItemSchema ) ; 

module.exports = BuyedItem ;
