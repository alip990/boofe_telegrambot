const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')
const BuyedItem = require('../models/buyeditem');
const keyboardSample = require ('../models/Keyboard');
const puppeteer = require('puppeteer')

class UserController{
    constructor(){
    }
    async  findUser(ctx){
        try {
        let user  = await User.findOne({chatId : ctx.chat.id}) ;
        console.log(user)
        if (! user ){
            await ctx.reply('هنوز وارد نشده اید از /start استفاده کنید ') ; 
            return undefined;
        }
        return user;
    }catch(err){
        console.log(err) ;
    }
    }
    async buy_kala(ctx , kalaname ){
        try{
        let user = await User.findOne({chatId :ctx.chat.id}) ;
        if(user.state === state.USER.BUYKALA) {
            let kala = await Kala.findOne({name :kalaname});
            if(kala.availbequantity > 0 ) {
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
    }catch(err){
        console.log(err)
    }

    }
    // async getWeecklyReport(ctx){
    //     this.deleteLastmessage(ctx  , ctx.message.message_id) ;
    //     let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
    //     console.log(report);
    //     let text =''
    //     let weekprice =0
    //     for (let i of report) {
    //         if (i.user){
    //         let d= new Date(i.date) 
    //         text += i.name + "   " +i.price + "   " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
    //         weekprice +=i.price ;}
    //     }
    //     if (text == ''){
    //         text = 'گزارشی نیست '  ;
    //         let x = await ctx.reply(text); 
    //         return 
    //     }
    //     text = 'گزارش هفتگی \n' + text  ; 
    //     text += ' : جمع کل ' + weekprice + ' \n'
    //     //text += 'بدهی کل : ' + report[0].user.deptPrice ;       
    //     await ctx.reply(text) ;      
    //     }
    async getWeecklyReport(ctx){
        try{
        let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
            

        let html = 
`<!DOCTYPE html>
<html>
<body dir=rtl>
<h2> گزارش حساب هفتگی</h2>
<table style="width:100%" border="1" cellpadding="5px" >
<tr>
    <th>نام</th>
    <th>تعداد</th>
    <th>قیمت</th>  
    <th>تاریخ</th>
  </tr>
`       
        let     weekprice =0
        let user_dept=0
        for (let i of report){
            console.log(i)
            if(i.user){
                html +=`  <tr>
                <td align ="center">${i.name}</td>
                <td align ="center">${i.price}</td>
                <td align ="center">1</td>
                <td align ="center">${i.date.toDateString()}</td>
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
        console.log(html)

        let timestmp =  Date.now()
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({
            width: 700,
            height: 700,
            deviceScaleFactor: 1,
        });            
        await page.setContent(html);
        await page.screenshot({path: "./images/" +timestmp +".png" });
        await browser.close();
        this.deleteLastmessage(ctx  , ctx.message.message_id) ;
        ctx.replyWithPhoto({ source: './images/'+timestmp+".png"});
        }catch(err){
            console.log(err)
        }
    }
    
    async getMountlyReport(ctx){
        this.deleteLastmessage(ctx  , ctx.message.message_id) ;
        try{
        let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 30 * 60 * 60 * 24 * 1000)) .populate({path:'user' , match: { chatId: { $eq: ctx.chat.id } }, });
        
        let html = 
`<!DOCTYPE html>
<html>
<body dir=rtl>
<h2> گزارش حساب ماهانه</h2>
<table style="width:100%" border="1" cellpadding="5px" >
<tr>
    <th>نام</th>
    <th>تعداد</th>
    <th>قیمت</th>  
    <th>تاریخ</th>
  </tr>
`       
        let     weekprice =0
        let user_dept=0
        for (let i of report){
            console.log(i)
            if(i.user){
                html +=`  <tr>
                <td align ="center">${i.name}</td>
                <td align ="center">${i.price}</td>
                <td align ="center">1</td>
                <td align ="center">${i.date.toDateString()}</td>
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
        console.log(html)

        let timestmp =  Date.now()
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({
            width: 700,
            height: 700,
            deviceScaleFactor: 1,
        });            
        await page.setContent(html);
        await page.screenshot({path: "./images/" +timestmp +".png" });
        await browser.close();
        ctx.replyWithPhoto({ source: './images/'+timestmp+".png"});
        }catch(err){
            console.log(err)
        }
    }

  
    async clearState( ctx , user){
        user.state = state.NOTHING ; 
        await user.save();

    }
    async adminCheckPass(ctx){
        try{
        let pass = 'asd123' ; 
        if (ctx.message.text == pass){
            let admin = new Admin({
                name: ctx.chat.first_name+ ctx.chat.last_name ,
                chatId : ctx.chat.id , 
                username :ctx.chat.username , 
                state : state.NOTHING
            }) 
            await admin.save();
            await  User.updateOne({chatId : ctx.chat.id }, {state : state.NOTHING}) ;
            this.deleteLastmessage(ctx,ctx.message.messagesId);
            await ctx.reply(' شما ادمین شدید ' ,keyboardSample.Adminkeyboard )    
        }
        else{
            ctx.reply('پسورد اشتباه است')
        }
        }catch(err){
            console.log(err)
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