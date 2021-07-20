const FileMnager =require('fs/promises');

const state  = require('../models/state') ; 
const  mongoose = require ('mongoose');
const Admin = require ('../models/admin') ;
const Kala = require('../models/kala') ;
const User = require ('../models/user') ;
const BuyedItem = require('../models/buyeditem');
const Payment = require ('../models/payment');
const keyboardSample = require ('../models/Keyboard');
const { receiveMessageOnPort } = require('worker_threads');
const puppeteer = require('puppeteer')

class AdminController{
    constructor(){
        this.kala_stack =[] ;
    }
    async findAdmin(ctx){
        let admin = await Admin.findOne({chatId :ctx.chat.id })
        return admin ;
    }
    async addNewKala(ctx ,admin){
        try{
        if (admin.state == state.ADMIN.ADDNEWKALA.NAME ) {
            ctx.session.kalaname = ctx.message.text ; 
            //console.log(ctx.message.text) ; 
            admin.state = state.ADMIN.ADDNEWKALA.PRICE ; 
            await admin.save();
            await ctx.reply('قیمت ' + ctx.message.text + ' را وارد کنید');
            return
    
        }else if(admin.state == state.ADMIN.ADDNEWKALA.PRICE){
            let  pr = parseInt(ctx.message.text)
                if (pr) {
                    ctx.session.price = pr ; 
                    await ctx.reply('موجودی را وارد کنید') ; 
                    admin.state = state.ADMIN.ADDNEWKALA.QUANTITY 
                    await admin.save(); 
                }else {
                    await ctx.reply('وردی باید عدد باشد' ) ;
                    return ; 
                }   
            }    
            else if(admin.state == state.ADMIN.ADDNEWKALA.QUANTITY){
                let  qu=parseInt(ctx.message.text)
                if (qu) {
                    ctx.session.quntity = qu
                }else {
                    await ctx.reply('ورودی باید عدد باشد ' ) ;
                    return ; 
                }
                admin.state = state.NOTHING
                await admin.save();    
                let kala = new Kala();
                kala.availbequantity =ctx.session.quntity
                kala.price = ctx.session.price
                kala.name =ctx.session.kalaname
                await kala.save()
                this.deleteLastmessage(ctx , ctx.message.message_id ) ;
                await ctx.reply(kala.name+' به لیست کالا ها اضافه شد') ;                   
            } 
        }catch(err){
            console.log(err)
        }
    }
    async deleteKala(ctx , kalaname){
        try{
        let admin = await this.findAdmin(ctx) ;
        await Kala.deleteOne({name : kalaname}) ; 
        admin.state = state.NOTHING ; 
        await admin.save();
        this.deleteLastmessage(ctx  , ctx.update.callback_query.message.message_id) ;
        await ctx.reply(kalaname +' از لیست کالاها حذف شد ') ;
        }catch(err){
            console.log(err)
        }
    }
    async addquantity(ctx , admin , kalaname){
        try{
        if(admin.state == state.ADMIN.ADDQUNTITY.NAME){
            await ctx.reply(' تعداد ' + kalaname + ' وارد کنید ') ;         
            ctx.session.kalaname = kalaname ;
            admin.state = state.ADMIN.ADDQUNTITY.PRICE ; 
            admin.save();
        }else if(admin.state == state.ADMIN.ADDQUNTITY.PRICE){
            let  qu=parseInt(ctx.message.text)
                if (qu) {
                    let kala = await Kala.findOne({name : ctx.session.kalaname });
                    kala.availbequantity += qu ; 
                    kala.save();
                    this.deleteLastmessage(ctx,ctx.message.message_id ) ;
                    await ctx.reply(`موجودی ${ kala.name } =  ${kala.availbequantity}`) ;                       
                    admin.state = state.NOTHING ; 
                    admin.save()  ;
                }else {
                    await ctx.reply('ورودی باید عدد باشد' ) ;
                    return ; 
                }
        }
        }catch(err){
            console.log(err)
        }
    }   
    async changedetailkala(ctx ,admin, kalaname =''){
        try{
        if(admin.state == state.ADMIN.CHANGEDETAIL.ENTERNAME){
            await ctx.reply(' نام جدید را وارد کنید ' + kalaname) ; 
            ctx.session.kalaname =  kalaname ; 
            admin.state = state.ADMIN.CHANGEDETAIL.NAME
            admin.save();
        }
        else if (admin.state == state.ADMIN.CHANGEDETAIL.NAME){
            await ctx.reply('قیمت جدید را وارد کنید ') 
            ctx.session.newname = ctx.message.text
            admin.state = state.ADMIN.CHANGEDETAIL.PRICE ;
            await admin.save();
        }
        else if (admin.state == state.ADMIN.CHANGEDETAIL.PRICE){
            let  pr=parseInt(ctx.message.text)
                if (pr) {
                    let new_name = ctx.session.newname;
                    let old_name = ctx.session.kalaname;
                    let kala = await Kala.findOne({name:old_name}) ;
                    kala.name = new_name ; 
                    kala.price = pr ; 
                    await kala.save() ; 
                    await this.clearState(ctx , admin);
                    this.deleteLastmessage(ctx,ctx.message.message_id ) ;   
                    await ctx.reply(kala.name + " ویرایش شد ");              
                }else {
                    await ctx.reply('ورودی باید عدد باشد' ) ;                    
                    return ; 
                }    
        }
        }catch(err){
            console.log(err)
        }
    }
    async getweeklyReport(ctx){
        try {
            let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user'});
            
            let report_basedUser = {}
            for (let i of report) {
                let d= new Date(i.date) 
                if (report_basedUser[i.user.name]){
                    report_basedUser[i.user.name].list.push(i)
                    report_basedUser[i.user.name].text +=i.name + "  - " +i.price + "  - " +d.getMonth()+'/'+ d.getDay()  + " \n" ; ; 
                    report_basedUser[i.user.name].weekprice +=i.price
                }
                else {
                    report_basedUser[i.user.name]={} 
                    report_basedUser[i.user.name].list = [i] ;
                    report_basedUser[i.user.name].text = i.name + "  - " +i.price + " -  " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
                    report_basedUser[i.user.name].weekprice =i.price
                }
            }
            let html = 
            `<!DOCTYPE html>
            <html>
            <body dir=rtl>
            <h2> گزارش حساب ها هفتگی</h2>`

            for (let i in report_basedUser){
                html +=`<table style="width:100%" border="1" cellpadding="5px" >
                <h3>${report_basedUser[i].list[0].user.name}<h3>
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
                for (let j in report_basedUser[i].list)        
                {   j=report_basedUser[i].list[j]
                    if(j.user){
                        html +=`  <tr>
                        <td align ="center">${i.name}</td>
                        <td align ="center">${i.price/i.quantity}</td>
                        <td align ="center">${i.quantity}</td>
                        <td align ="center">${i.price}</td>
                        <td align ="center">${jalali(i.date , 'YYYY-M-D HH:mm:ss').locale('fa').format('YYYY/M/D')}</td>
                    </tr>
                    `
                    weekprice +=j.price ;
                    user_dept = j.user.deptPrice ;

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
                 </table>`
            }
            html+=` </body>
            </html>`;
            
        let filename =  "./images/" +Date.now() +".png"
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({
            width: 700,
            height: 700,
            deviceScaleFactor: 1,
        });            
        await page.setContent(html);
        await page.screenshot({path: filename , fullPage: true });
        await browser.close();
        ctx.replyWithDocument({ source: filename});
        setTimeout(FileMnager.rm, 10000, filename) ;
        }catch(err){
            console.log(err);
        }
          
     }
    async getMountlyReport(ctx){
        try {
            let report = await BuyedItem.find().where('date').gt(new Date(new Date() - 7 * 60 * 60 * 24 * 1000)) .populate({path:'user'});
            
            let report_basedUser = {}
            for (let i of report) {
                let d= new Date(i.date) 
                if (report_basedUser[i.user.name]){
                    report_basedUser[i.user.name].list.push(i)
                    report_basedUser[i.user.name].text +=i.name + "  - " +i.price + "  - " +d.getMonth()+'/'+ d.getDay()  + " \n" ; ; 
                    report_basedUser[i.user.name].weekprice +=i.price
                }
                else {
                    report_basedUser[i.user.name]={} 
                    report_basedUser[i.user.name].list = [i] ;
                    report_basedUser[i.user.name].text = i.name + "  - " +i.price + " -  " +d.getMonth()+'/'+ d.getDay()  + " \n" ;
                    report_basedUser[i.user.name].weekprice =i.price
                }
            }
            let html = 
                `<!DOCTYPE html>
                <html>
                <body dir=rtl>
                <h2> گزارش حساب ها هفتگی</h2>`

            for (let i in report_basedUser){
                html +=`<table style="width:100%" border="1" cellpadding="5px" >
                <h3>${report_basedUser[i].list[0].user.name}<h3>
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
                for (let j in report_basedUser[i].list)        
                {   j=report_basedUser[i].list[j]
                    if(j.user){
                        html +=`  <tr>
                        <td align ="center">${i.name}</td>
                        <td align ="center">${i.price/i.quantity}</td>
                        <td align ="center">${i.quantity}</td>
                        <td align ="center">${i.price}</td>
                        <td align ="center">${jalali(i.date , 'YYYY-M-D HH:mm:ss').locale('fa').format('YYYY/M/D')}</td>
                    </tr>
                    `
                    weekprice +=j.price ;
                    user_dept = j.user.deptPrice ;

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
                    </table>`
            }
            html+=` </body>
            </html>`;
                        
            let filename =  "./images/" +Date.now() +".png"
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport({
                width: 700,
                height: 700,
                deviceScaleFactor: 1,
            });            
            await page.setContent(html);
            await page.screenshot({path: filename,fullPage: true });
            await browser.close();
            ctx.replyWithDocument({ source: filename});
            setTimeout(FileMnager.rm, 10000, filename) ;        }catch(err){
            console.log(err);
        }
          
     }
     async checkout(ctx,index){
        try{
        let  qu=parseInt(ctx.message.text) ; 
        if(!qu) {
            await ctx.reply('ورودی باید عدد باشد دوباره وارد کنید ' ) ;
            return ; 
        }
        if (!ctx.session.users[index-1]){
            await ctx.reply(' ردیف کاربر اشتباه است دوباره وارد کنید ' ) ;
            return ;
        }
        
        let user = await User.findOne({_id : ctx.session.users[index-1]._id })
        await Payment.create({user : ctx.session.users[index-1]._id  , price:user.deptPrice})
        user.deptPrice=0;
        user.save();
        ctx.reply('حساب ' +ctx.session.users[index-1].name + " تسویه شد" )
        ctx.session.counter +=2;
        }catch(err){
            console.log(err)
        }
        await this.deleteLastmessage(ctx ,ctx.message.message_id)

    }

    async clearState( ctx , admin){
        admin.state = state.NOTHING ; 
        await admin.save();
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
        ctx.reply(' چه کاری هست ؟ '  + ctx.chat.first_name, keyboardSample.Adminkeyboard) ;
    }
}
module.exports = new AdminController()