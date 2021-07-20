mongoose = require('mongoose')

    const paymentSchema = new mongoose.Schema({
        price : Number , 
        user : {type :mongoose.Schema.Types.ObjectId , ref :"User" } , 
        // quantity : Number   ,
        date :  { type: Date, default: Date.now },    
    })



const Payment = mongoose.model('Payment' , paymentSchema ) ; 

module.exports = Payment ;
