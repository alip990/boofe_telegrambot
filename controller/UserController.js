const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')
const BuyedItem = require('../models/buyeditem');
const keyboardSample = require ('../models/Keyboard');

class UserController{
    constructor(){
     ; 
    }
    async  findUser(ctx){
        let user  = await User.findOne({chatId : ctx.chat.id}) ;
        if (! user ){
            let x = await ctx.reply('هنوز وارد نشده اید از /start استفاده کنید ') ; 
              
              

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
                let x = await ctx.reply( kalaname+' به لیست کالا اضافه شد  ') ; 
                  
                   
                this.deleteLastmessage(ctx  , ctx.update.callback_query.message.message_id) ;


            }else {
               let x =  await ctx.reply( 'موجود نیست '+ kalaname ) ;
            }
            await user.save() ; 

        }

    }
    async getWeecklyReport(ctx){
        //let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) ;
        //console.log(report) ;
       // let rep =   await User.findOne({chatId : ctx.chat.id}).populate('buyeditems') ; 
       this.deleteLastmessage(ctx  , ctx.message.message_id) ;
 
        let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        let text =''
        let weekprice =0
        for (let i of report) {
            let d= new Date(i.date) 
            text += i.name + "   " +i.price + "   " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
            weekprice +=i.price ;
        }
        if (text == ''){
            text = 'گزارشی نیست '  ;
            let x = await ctx.reply(text); 
              
               ; 
            return 
        }
        text = 'گزارش هفتگی \n' + text  ; 
        text += ' : جمع کل ' + weekprice + ' \n'
        text += 'بدهی کل : ' + report[0].user.deptPrice ;       
        let x = await ctx.reply(text) ;      
        }
    async getMountlyReport(ctx){
        this.deleteLastmessage(ctx  , ctx.message.message_id) ;
        //let rep =   await User.findOne({chatId : ctx.chat.id}).populate('buyeditems') ; 
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
            let x = await ctx.reply(text); 
              
               ; 
            return 
        }
        text = 'گزارش ماهانه \n' + text  ; 
        text += ' جمع کل :' + weekprice + ' \n'
        text += 'بدهی کل : ' + rep2[0].user.deptPrice ;     
        let x = await ctx.reply(text)          
    }
    async DeleteOrder(ctx , index , user){

        if(user.state == state.USER.DELETEORDER){
            let  number=parseInt(index)
            if (!number){
                let x = await ctx.reply('ورودی باید عدد باشد' ) ;
                return ; 
            }
            
            let kala =  await BuyedItem.findOneAndDelete({_id : ctx.session.map_indextoorder[index] })
           //console.log('index is '+ index  ); 
           //console.log(ctx.session.map_indextoorder[index] ); 
            let x = ctx.reply( ' حذف شد  ' + kala.name)
              
              
            await this.clearState(ctx,user)
            await this.deleteLastmessage(ctx  , ctx.message.message_id) ;

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
            if (text == ''){
                text = 'گزارشی نیست '  ;
                let x = await ctx.reply(text);                   
                return 
            }
            //text = 'گزارش هفتگی \n' + text  ; 
            //text += ' : جمع کل ' + weekprice + ' \n'
            //text += 'بدهی کل : ' + report[0].user.deptPrice ; 
            let x = await ctx.reply(text);
           // console.log(ctx.session.map_indextoorder)
            user.state = state.USER.DELETEORDER  ;
             await user.save()

        }
    }

  
    async clearState( ctx , user){
        user.state = state.NOTHING ; 
        await user.save();

    }
    async deleteLastmessage(ctx , message_id ){
        try 
        {
            for(let i = 0  ; i<ctx.session.counter-1 ; i++){
                  await ctx.deleteMessage(message_id - i ) ;}
             
                  //await ctx.deleteMessage(message_id - ctx.session.counter-1 )
        }catch(err) {
            console.log(err);
        };
    
        
    
    let x = await ctx.reply( ' چه کاری هست ؟ '  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;
      
   //   
    }async deleteLastmessage(ctx , message_id ){
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