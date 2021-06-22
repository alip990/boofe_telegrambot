mongoose = require('mongoose')
const buyedItemSchema = new mongoose.Schema({
    name : String ,
    price : {type :Number , default : 0} , 
    //quantity : Number   ,
    date :  { type: Date, default: Date.now },    
})
;
const userSchema = new mongoose.Schema({
    name : String ,
    phone  : String  ,
    chatId : String , 
    username :String , 
    deptPrice :  {type :Number , default : 0  },
    state : String 
    
}) 
const User = mongoose.model('User' , userSchema ) ; 
module.exports = User ;