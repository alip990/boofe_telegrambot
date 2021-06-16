mongoose = require('mongoose')

const kalaSchema = new mongoose.Schema({
        name : String , 
        price : Number ,
        availbequantity : Number 
})

const  Kala = mongoose.model('Kala' , kalaSchema ) ; 

module.exports = Kala 