const FileMnager =require('fs/promises');
const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')
const BuyedItem = require('../models/buyeditem');
const keyboardSample = require ('../models/Keyboard');
const puppeteer = require('puppeteer');
const AdminController = require('./AdminController');
const  jalali = require('jalali-moment');
class UserController{
    constructor(){
    }
    async  findUser(ctx){
        try {
        let user  = await User.findOne({chatId : ctx.chat.id}) ;
        if (! user ){
            await ctx.reply('هنوز وارد نشده اید از /start استفاده کنید ') ; 
            return undefined;
        }
        return user;
    }catch(err){
        console.log(err) ;
    }
    }
    async buy_kala(ctx , kalaname  ){
        try{
        let user = await User.findOne({chatId :ctx.chat.id}) ;
        if(user.state == state.USER.BUYKALA){
            ctx.session.kalaname =kalaname
            user.state= state.USER.BUYKALAQUNTITY
            user.save();
            ctx.reply(` تعداد  ${kalaname} را وارد کنید`)
            //this.deleteLastmessage(ctx ,  'تعداد را وارد کنید');
        }
        else if(user.state == state.USER.BUYKALAQUNTITY) {
            var qu =0
            try{
                qu=parseInt(ctx.message.text) ; 
                if(!qu) {
                    await ctx.reply('ورودی باید عدد باشد ' ) ;
                    return ; 
                }
                else if(qu <= 0){
                    await ctx.reply('ورودی باید عدد مثبت باشد ' ) ;
                    return ; 
                }
            }catch(err){
                if (kalaname){
                    ctx.session.kalaname =kalaname
                    ctx.reply(` تعداد  ${kalaname} را وارد کنید`)
                    return 
                }
            }
            let kala = await Kala.findOne({name :ctx.session.kalaname});
            if(kala.availbequantity-qu >= 0 ) {
                let buyedlist = new BuyedItem()
                buyedlist.name =kala.name ; 
                buyedlist.price =kala.price *qu ;
                buyedlist.user = user._id ;
                buyedlist.quantity = qu ;
                user.deptPrice += kala.price *qu ; 
                user.state = state.NOTHING ;
                kala.availbequantity -=qu ; 
                //todo send message to admin if availbequantity= 0 ; 
                await kala.save() ;
                await buyedlist.save() ;
                this.deleteLastmessage(ctx ) ;
                await ctx.reply( buyedlist.name+' به خریدها اضافه شد  ') ; 
            }else {
               await ctx.reply( '  موجودی کافی نیست، میتوانید کالای دیگری رو انتخاب کنید .موجودی : '+ kala.availbequantity) ;
            }
            await user.save() ; 
        }
    }catch(err){
        console.log(err)
    }

    }

    async getWeecklyReport(ctx){
        try{
        let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        ctx.session.map_index_order = {} 
        let flag_is_empty = true ;
        let html = 
`<!DOCTYPE html>
<html>
<body dir=rtl>
<h2> گزارش حساب هفتگی</h2>
<table style="width:100%" border="1" cellpadding="5px" >
<tr>
    <th>نام</th>
    <th>فی</th>
    <th>تعداد</th> 
    <th>قیمت</th>  
 
    <th>تاریخ</th>
  </tr>
`       
        let     weekprice =0
        let user_dept=0
        let index = 1 ;
        for (let i of report){
            if(i.user){
                flag_is_empty = false  ;
                html +=`  <tr>
                <td align ="center"> ${index}- ${i.name}</td>
                <td align ="center">${i.price/i.quantity}</td>
                <td align ="center">${i.quantity}</td>
                <td align ="center">${i.price}</td>
                <td align ="center">${jalali(i.date , 'YYYY-M-D HH:mm:ss').locale('fa').format('YYYY/M/D')}</td>
            </tr>
            `
            ctx.session.map_index_order[index ]  = i._id ;

            index ++;
            weekprice +=i.price ;
            user_dept = i.user.deptPrice ;
        }
        }
        html += `</table>
        <table border ="5" style  = "width:100%"  cellpadding="5px" > 
	<tr>
    	<td margin-right= "10px"  >  مجموع : </td>
        <td> ${weekprice} </td>
        
    </tr>
    <tr>
    	<td> مقدار بدهی : </td>
        <td> ${user_dept} </td>
        
    </tr>
</table>
        </body>
        </html>`;
        if (flag_is_empty){
            ctx.reply('گزارشی نیست. ') 
            return {not_send : true}
        }
        let filename =  "./images/" +Date.now() +".png"
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({
            width: 700,
            height: 700,
            deviceScaleFactor: 1,
        });            
        await page.setContent(html);
        await page.screenshot({path:filename , fullPage: true });
        await browser.close();
        this.deleteLastmessage(ctx  , ctx.message.message_id) ;
        ctx.replyWithDocument({ source: filename});
        setTimeout(FileMnager.rm, 10000, filename) ;
        await this.clearState(ctx)
    }catch(err){
            console.log(err)
        }
    }
    
    async getMountlyReport(ctx){
        this.deleteLastmessage(ctx  , ctx.message.message_id) ;
        try{
        let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 30 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        let flag_is_empty = true
        let html = 
`<!DOCTYPE html>
<html>
<body dir=rtl>
<h2> گزارش حساب ماهانه</h2>
<table style="width:100%" border="1" cellpadding="5px" >
<tr>
                    <th>نام</th>
                    <th>فی</th>
                    <th>تعداد</th> 
                    <th>قیمت</th>  
                    <th>تاریخ</th>
              </tr>
`       
        let weekprice =0
        let user_dept=0
        for (let i of report){
            if(i.user){
                flag_is_empty =false
                html +=`  <tr>
                <td align ="center">${i.name}</td>
                <td align ="center">${i.price/i.quantity}</td>
                <td align ="center">${i.quantity}</td>
                <td align ="center">${i.price}</td>
                <td align ="center">${jalali(i.date , 'YYYY-M-D HH:mm:ss').locale('fa').format('YYYY/M/D')}</td>
            </tr>
            `
            weekprice +=i.price ;
            user_dept = i.user.deptPrice ;
        }
        }
        html += `</table>
        <table border ="5" style  = "width:100%"  cellpadding="5px" > 
	<tr>
    	<td margin-right= "10px"  >  مجموع : </td>
        <td> ${weekprice} </td>
        
    </tr>
    <tr>
    	<td> مقدار بدهی : </td>
        <td> ${user_dept} </td>
        
    </tr>
</table>
        </body>
        </html>`;

        if (flag_is_empty){
            ctx.reply('گزارشی نیست. ') 
            return {not_send : true}
        }

        let filename =  "./images/" +Date.now() +".png"
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({
            width: 700,
            height: 700,
            deviceScaleFactor: 1,
        });            
        await page.setContent(html);
        await page.screenshot({path:filename , fullPage: true });
        await browser.close();
        ctx.replyWithDocument({ source: filename});
        setTimeout(FileMnager.rm, 10000, filename) ;
        await this.clearState(ctx,user)

            }catch(err){
            console.log(err)
        }
    }
    async DeleteOrder(ctx , index , user){

        if(user.state == state.USER.DELETEORDER){
            let  index=parseInt(ctx.message.text) ; 
            if(!index) {
                await ctx.reply('ورودی باید عدد باشد دوباره وارد کنید ' ) ;
                return ; 
            }
            if (!ctx.session.map_index_order[index]){
                await ctx.reply(' ردیف کاربر اشتباه است دوباره وارد کنید ' ) ;
                return ;
            }
            let buyeditem =  await BuyedItem.findOneAndDelete({_id : ctx.session.map_index_order[index] })
            user.deptPrice -= buyeditem.price ;
            await user.save()
            let kala = await Kala.findOne({name : buyeditem.name});
            kala.availbequantity += buyeditem.quantity ; 
            await kala.save();
           //console.log('index is '+ index  ); 
           //console.log(ctx.session.map_indextoorder[index] ); 
            ctx.reply( kala.name+' حذف شد  ' )

            await this.clearState(ctx,user)
            await this.deleteLastmessage(ctx  , ctx.message.message_id) ;


        }else 
            {
                let flag = await this.getWeecklyReport(ctx) || {not_send :false}
                if(flag.not_send){
                    ctx.reply('هنوز کالایی را ثبت نکردید ! ')
                    return 
                }
                ctx.reply("عکس بالا رو ببینید و ردیفی رو که میخواهید حذف کنید وارد کنید")
            user.state = state.USER.DELETEORDER  ;
             await user.save()

        }
    }

  
    async clearState( ctx , user){
        if(user){
            user.state = state.NOTHING ; 
            await user.save();
        }else {
            User.updateOne({chatId :ctx.chat.id,},{state :state.NOTHING})
        }

    }
    async adminCheckPass(ctx){
        try{
        let pass = process.env.ADMINPASSWORD ; 
        if (ctx.message.text == pass){
            let admin = new Admin({
                name: ctx.chat.first_name+ ctx.chat.last_name ,
                chatId : ctx.chat.id , 
                username :ctx.chat.username , 
                state : state.NOTHING
            }) 
            await admin.save();
            await  User.updateOne({chatId : ctx.chat.id }, {state : state.NOTHING}) ;
            await this.deleteLastmessage(ctx,ctx.message.messagesId);
            await ctx.reply(' شما ادمین شدید ' ,keyboardSample.Adminkeyboard )    
        }
        else{
            ctx.reply('پسورد اشتباه است')
        }
        }catch(err){
            console.log(err)
        }
    }
    
     
    async deleteLastmessage(ctx , message_id=0  ,text){
        try{
            for (let i of ctx.session.messagesId){
                ctx.deleteMessage(i).catch((err)=>console.log(err))
            }
        }catch(err){
           console.log(err)
        }
        ctx.session.messagesId = []
        await ctx.reply(' چه کاری هست ؟ '  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;

    }
}
module.exports = new UserController() ;