mongoose = require('mongoose')

    const buyedItemSchema = new mongoose.Schema({
        name : String ,
        totalPrice : Number , 
        quantity : Number   ,
        date :  { type: Date, default: Date.now },    
    })



const BuyedItem = mongoose.model('BuyedItem' , buyedItemSchema ) ; 

module.exports = BuyedItem ;
