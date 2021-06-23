const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')
const BuyedItem = require('../models/buyeditem');

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
    async getWeecklyReport(ctx){
        //let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) ;
        //console.log(report) ;
       // let rep =   await User.findOne({chatId : ctx.chat.id}).populate('buyeditems') ; 
        let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        let text =''
        let weekprice =0
        for (let i of report) {
            let d= new Date(i.date) 
            text += i.name + "   " +i.price + "   " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
            weekprice +=i.price ;
        }
        text += ' : جمع کل ' + weekprice
        ctx.reply(text)
     

    }
    async getMountlyReport(ctx){
        let rep =   await User.findOne({chatId : ctx.chat.id}).populate('buyeditems') ; 
        let rep2 = await BuyedItem.find().where('date').gt(new Date(new Date() - 30 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        let text =''
        let weekprice =0
        for (let i of rep2) {
            let d= new Date(i.date) 
            text += i.name + "   " +i.price + "   " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
            weekprice +=i.price ;
        }
        text += ' : جمع کل ' + weekprice
        ctx.reply(text)
     

    }
}
module.exports = new UserController() ;