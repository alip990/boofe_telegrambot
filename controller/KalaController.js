const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')    ;
const Admin = require ('../models/admin') ;
const Kala = require('../models/kala')    ;
const User = require ('../models/user')   ;

class KalaController{
    async showkalasInline(ctx){
        const kalas = await Kala.find () ;
        ctx.reply((kalas)) ;
        let inline_keyboard= [];

        for (var i = 0; i < kalas.length; i += 2) {
            console.log(kalas[i]);
            if(i+1<kalas.length){
                inline_keyboard.push([{text :kalas[i].name ,   callback_data: kalas[i].name} ,
                                  {text :kalas[i+1].name ,   callback_data: kalas[i+1].name}  ]);   
                }
            else {            
                inline_keyboard.push([{text :kalas[i].name ,   callback_data: kalas[i].name} ]);
            }
    
            }
        inline_keyboard.push([{text : 'back' ,callback_data :'back ' } ])
            ctx.reply( "لیست کالا ", {
                reply_markup: {inline_keyboard}})    
    }
    async ShowkalasInlinewithQuantity (ctx){
        const kalas = await Kala.find () ;
        ctx.reply((kalas)) ;
        inline_keyboard= [];

        for (var i = 0; i < kalas.length; i += 2) {
            console.log(kalas[i]);
            if(i+1<kalas.length){
                inline_keyboard.push([{text :kalas[i].name +':' + kalas[i].quantity,   callback_data: kalas[i].name} ,
                                  {text :kalas[i+1].name +':' + kalas[i+1].quantity  ,   callback_data: kalas[i+1].name}  ]);   
                }
            else {            
                inline_keyboard.push([{text :kalas[i].name ,   callback_data: kalas[i].name} ]);
            }
    
            }
        inline_keyboard.push([{text : 'back' ,callback_data :'back ' } ])

      ctx.reply(ctx.chat.id, "لیست کالا ", {
             reply_markup: {inline_keyboard}})  ;
        // bot.telegram.sendMessage(ctx.chat.id, "لیست کالا ", {
        //     reply_markup: {inline_keyboard}})    

    }
}
module.exports = new KalaController() ; 