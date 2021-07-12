const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')
const BuyedItem = require('../models/buyeditem');
const keyboardSample = require ('../models/Keyboard');
class UserController{
    constructor(){
    }
    async  findUser(ctx){
        let user  = await User.findOne({chatId : ctx.chat.id}) ;
        console.log(user)
        if (! user ){
            await ctx.reply('هنوز وارد نشده اید از /start استفاده کنید ') ; 
            return undefined;
        }
        return user;
    }
    async buy_kala(ctx , kalaname ){
        console.log('buy kala ');
        let user = await User.findOne({chatId :ctx.chat.id}) ;
        console.log(ctx.chat.id)
        if(user.state === state.USER.BUYKALA) {
            let kala = await Kala.findOne({name :kalaname});
            if(kala.availbequantity > 0 ) {
                console.log('buy kala 2 ');
                let buyedlist = new BuyedItem()
                buyedlist.name =kala.name ; 
                buyedlist.price =kala.price ;
                buyedlist.user = user._id ;
                user.deptPrice += kala.price ; 
                user.state = state.NOTHING ;
                kala.availbequantity -- ; 
                //todo send message to admin if availbequantity= 0 ; 
                await kala.save() ;
                await buyedlist.save() ;
                this.deleteLastmessage(ctx  , ctx.update.callback_query.message.message_id) ;
                await ctx.reply( kalaname+' به لیست خرید اضافه شد  ') ; 
            }else {
               await ctx.reply( 'موجود نیست '+ kalaname ) ;
            }
            await user.save() ; 
        }

    }
    async getWeecklyReport(ctx){
       this.deleteLastmessage(ctx  , ctx.message.message_id) ;
        let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        console.log(report);
        let text =''
        let weekprice =0
        for (let i of report) {
            if (i.user){
                let d= new Date(i.date) 
                text += i.name + "   " +i.price + "   " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
                weekprice +=i.price ;}
        }
        if (text == ''){
            text = 'گزارشی نیست '  ;
            let x = await ctx.reply(text); 
            return 
        }
        text = 'گزارش هفتگی \n' + text  ; 
        text += ' : جمع کل ' + weekprice + ' \n'
        //text += 'بدهی کل : ' + report[0].user.deptPrice ;       
        await ctx.reply(text) ;      
        }
    async getMountlyReport(ctx){
        this.deleteLastmessage(ctx  , ctx.message.message_id) ;
        let rep2 = await BuyedItem.find().where('date').gt(new Date(new Date() - 30 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        let text =''
        let weekprice =0
        for (let i of rep2) {
            let d= new Date(i.date) 
            text += i.name + "   " +i.price + "   " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
            weekprice +=i.price ;
        }
        if (text == ''){
            text = 'گزارشی نیست '  ;
            await ctx.reply(text); 
            return 
        }
        text = 'گزارش ماهانه \n' + text  ; 
        text += ' جمع کل :' + weekprice + ' \n'
        //text += 'بدهی کل : ' + rep2[0].user.deptPrice ;     
        await ctx.reply(text)          
    }
    async DeleteOrder(ctx , index , user){
        if(user.state == state.USER.DELETEORDER){
            let  number=parseInt(index)
            if (!number){
                await ctx.reply('ورودی باید عدد باشد' ) ;
                return ; 
            }
            let kala =  await BuyedItem.findOneAndDelete({_id : ctx.session.map_indextoorder[index] })
            ctx.reply( ' حذف شد  ' + kala.name)
            await this.deleteLastmessage(ctx  , ctx.message.message_id) ;
            await this.clearState(ctx,user)
        }else 
            {let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
            let text =''
            let weekprice =0
            let index = 0 
            ctx.session.map_indextoorder = {} 
            for (let i of report) {
                let d= new Date(i.date) 
                text += ++index  +'- '+ i.name + "   " +i.price + "   " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
                weekprice +=i.price ;
                ctx.session.map_indextoorder[index ]  = i._id ;
            }
            if (!text ){
                text = 'گزارشی نیست '  ;
                let x = await ctx.reply(text);                   
                return 
            }
            //text = 'گزارش هفتگی \n' + text  ; 
            //text += ' : جمع کل ' + weekprice + ' \n'
            //text += 'بدهی کل : ' + report[0].user.deptPrice ; 
            await ctx.reply(text);
           // console.log(ctx.session.map_indextoorder)
            user.state = state.USER.DELETEORDER  ;
             await user.save()

        }
    }

  
    async clearState( ctx , user){
        user.state = state.NOTHING ; 
        await user.save();

    }
    async adminCheckPass(ctx){
        let pass = 'asd123' ; 
        if (ctx.message.text == pass){
            let admin = new Admin({
                name: ctx.chat.first_name+ ctx.chat.last_name ,
                chatId : ctx.chat.id , 
                username :ctx.chat.username , 
                state : state.ADMIN.MAKEMEADMIN
            }) 
            await admin.save();
            console.log(admin);
            this.deleteLastmessage(ctx,ctx.message.messagesId);
            await ctx.reply(' شما ادمین شدید ' ,keyboardSample.Adminkeyboard )    
        }
        else{
            ctx.reply('پسورد اشتباه است')
        }
    }
    
     
    async deleteLastmessage(ctx , message_id ){
        try{
            for (let i of ctx.session.messagesId){
                ctx.deleteMessage(i).catch((err)=>console.log(err))
            }
        }catch(err){
           console.log(err)
        }
        ctx.session.messagesId = []

        ctx.reply(' چه کاری هست ؟ '  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;

    }
}
module.exports = new UserController() ;