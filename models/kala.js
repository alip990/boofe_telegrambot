mongoose = require('mongoose')

const kalaSchema = new mongoose.Schema({
        name : {type :String,
        minlenght  : 2 ,
        maxlenght : 100 ,
} , 
        price : Number ,
        availbequantity : Number 
})

const  Kala = mongoose.model('Kala' , kalaSchema ) ; 

module.exports = Kala 