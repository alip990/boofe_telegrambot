mongoose = require('mongoose')
const buyedItemSchema = new mongoose.Schema({
    name : String ,
    totalPrice : Number , 
    quantity : Number   ,
    date :  { type: Date, default: Date.now },    
})
;
const userSchema = new mongoose.Schema({
    name : String ,
    phone  : String  ,
    chatId : String , 
    buyedList :[buyedItemSchema] , 
    deptPric :  Number
    
}) 
const User = mongoose.model('User' , userSchema ) ; 
module.exports = User ;