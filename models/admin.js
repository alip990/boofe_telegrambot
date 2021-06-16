const mongoose  = require('mongoose')
const adminSchema = new mongoose.Schema({
    name : String , 
    chatId : String ,
    pass : {type :String  , defualt : 'asd123'} , 
    state : String 

})
const Admin = mongoose.model('Admin' , adminSchema ) ; 

module.exports= Admin ; 