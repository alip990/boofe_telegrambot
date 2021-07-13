mongoose = require('mongoose')

    const buyedItemSchema = new mongoose.Schema({
        name : String ,
        price : Number , 
        user : {type :mongoose.Schema.Types.ObjectId , ref :"User" } , 
        quantity : Number   ,
        date :  { type: Date, default: Date.now },    
    })



const BuyedItem = mongoose.model('BuyedItem' , buyedItemSchema ) ; 

module.exports = BuyedItem ;
