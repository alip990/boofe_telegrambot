const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')    ;
const Admin = require ('../models/admin') ;
const Kala = require('../models/kala')    ;
const User = require ('../models/user')   ;

class KalaController{
    async showkalasInline(ctx){
        try {
        const kalas = await Kala.find () ;
        let inline_keyboard= [];
        for (var i = 0; i < kalas.length; i += 2) {
            if(i+1<kalas.length){
                inline_keyboard.push([{text :kalas[i].name ,   callback_data: kalas[i].name} ,
                                  {text :kalas[i+1].name ,   callback_data: kalas[i+1].name}  ]);   
                }
            else {            
                inline_keyboard.push([{text :kalas[i].name ,   callback_data: kalas[i].name} ]);
            }
            }
        //inline_keyboard.push([{text : 'back' ,callback_data :'back ' } ])
            await ctx.reply( "لیست کالا ", {
                reply_markup: {inline_keyboard
                }})  
        }catch(err){
            console.log(err)
        }              
    }
    async ShowkalasInlinewithQuantity (ctx){
        try{
        const kalas = await Kala.find () ;
        let inline_keyboard= [];
        for (var i = 0; i < kalas.length; i += 2) {
            if(i+1<kalas.length){
                inline_keyboard.push([{text :kalas[i].name +' : ' + kalas[i].availbequantity,   callback_data: kalas[i].name} ,
                                  {text :kalas[i+1].name +' : ' + kalas[i+1].availbequantity  ,   callback_data: kalas[i+1].name}  ]);   
                }
            else {            
                inline_keyboard.push([{text :kalas[i].name  +' : ' + kalas[i].availbequantity,   callback_data: kalas[i].name} ]);
            }
    
            }
        //inline_keyboard.push([{text : 'back' ,callback_data :'back ' } ])

        let x = await ctx.reply( "لیست کالا ", {
             reply_markup: {inline_keyboard}})  ;
        // bot.telegram.sendMessage(ctx.chat.id, "لیست کالا ", {
        //     reply_markup: {inline_keyboard}})    

        //  
        }catch(err){
            console.log(err)
        }
    } ; 
    async ShowkalasInlinewithPrice (ctx){
        try{
        const kalas = await Kala.find () ;
        let inline_keyboard= [];
        for (var i = 0; i < kalas.length; i += 2) {
            if(i+1<kalas.length){
                inline_keyboard.push([{text :kalas[i].name +' : ' + kalas[i].price,   callback_data: kalas[i].name} ,
                                  {text :kalas[i+1].name +' : ' + kalas[i+1].price  ,   callback_data: kalas[i+1].name}  ]);   
                }
            else {            
                inline_keyboard.push([{text :kalas[i].name  +' : ' + kalas[i].price,   callback_data: kalas[i].name} ]);
            }
    
            }
        //inline_keyboard.push([{text : 'back' ,callback_data :'back ' } ])

        let x = await ctx.reply( "لیست کالا ", {
             reply_markup: {inline_keyboard}})  ;
        // bot.telegram.sendMessage(ctx.chat.id, "لیست کالا ", {
        //     reply_markup: {inline_keyboard}})    

        //  
        }catch(err){
            console.log(err)
        }
    } ; 
    
}
module.exports = new KalaController() ; 