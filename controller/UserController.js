const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')
const Buyeditem = require('../models/buyeditem') ; 
class UserController{
    constructor(){
     ; 
    }
    async  findUser(ctx){
        let user  = await User.findOne({chatId : ctx.chat.id}) ;
        if (! user ){
            ctx.reply('you have not singup try /start') ; 
            return undefined;
        }
        return user;
    }
    async buy_kala(ctx , kalaname ){

        console.log('buy kala ');
        let user = await this.findUser(ctx) ;
        if(user.state === state.USER.BUYKALA) {
            let kala = await Kala.findOne({name :kalaname});


            if(kala.availbequantity > 0 ) {
                console.log('buy kala 2 ');
                let buyedlist = new Buyeditem()
                buyedlist.name =kala.name ; 
                buyedlist.price =kala.price ;
                buyedlist.user = user._id ;
                user.deptPrice += kala.price ; 
                user.state = state.NOTHING ;
                kala.availbequantity -- ; 
                //todo send message to admin if availbequantity= 0 ; 
                await kala.save() ;
                await buyedlist.save() ;
                ctx.reply( kalaname+' added succesfully') ; 
            }else {
                ctx.reply('موجود نیست ') ;
                
            }
            await user.save() ; 

        }

    }
}
module.exports = new UserController() ;