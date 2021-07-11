//const config = require('config');
const { session ,Telegraf ,Markup,Context} = require('telegraf') ;
const  mongoose = require ('mongoose')
const Admin = require ('./models/admin')
const Kala = require('./models/kala')
const User = require ('./models/user')
const state  = require('./models/state') ; 
const adminController = require('./controller/AdminController');
const userController  = require('./controller/UserController');
const kalaController  = require('./controller/KalaController');
const keyboardSample = require ('./models/Keyboard');
const UserController = require('./controller/UserController');
const { createCipher } = require('crypto');
const { stat } = require('fs');
const { Session } = require('inspector');
const { createSecureContext } = require('tls');

mongoose.connect('mongodb://localhost/mydatabase')
        .then(()=> console.log('connected to MongoDB ..'))
        .catch(err => console.log('could not connect to database'));

const Token = "1807114273:AAEOmls4fpqmYC5dlX8gzsye97Orlh7XLss"//config.get('bot.Token') 
// const state = new State() ;

const bot = new Telegraf(Token)
bot.use(session()) ;
bot.use(async (ctx, next) =>

{   
    const update = ctx.update.message || ctx.update.callback_query.message;
    if (false){
      next();
      return;
    }
    ctx.session ??= { counter: 0  ,messagesId  :  []   }
    if (update.message_id)
       ctx.session.messagesId.push(update.message_id)
   
    const originalReply = ctx.reply.bind(ctx)

    ctx.reply = async function () {
        let x = await originalReply(...arguments)
        
        if (!ctx.session.messagesId.includes(x.message_id) ){
            
            ctx.session.messagesId.push(x.message_id) ;
            }

    }
    console.log(ctx.session.messagesId)
    next(); // <- and middleware chain continues there...
  })

try{
    bot.hears('phone', async(ctx, next) => {
         ;
        await bot.telegram.sendMessage(ctx.chat.id, 'نیاز به شماره تلفن شما داریم اجازه میدهید?', keyboardSample.requestPhoneKeyboard);


    })


    bot.command('start',async (ctx) =>{ 
        let admin = await adminController.findAdmin(ctx) ;
         
        if(admin){
            bot.telegram.sendMessage(ctx.chat.id, ' سلام خوش امدید', keyboardSample.Adminkeyboard);
            adminController.clearState(ctx , admin )
            return ;         
        }
        let user = await userController.findUser(ctx); 
        if( ! user ){
        /// console.log('in singup')
            user = new User({
                            name : ctx.chat.first_name + ctx.chat.last_name , 
                            chatId : ctx.chat.id , 
                            state : state.USER.WAITEFORPHONE });     
            await user.save()
            bot.telegram.sendMessage(ctx.chat.id, 'نیاز به شماره تلفن شما داریم اجازه میدهید?', keyboardSample.requestPhoneKeyboard);
        }else{    
        bot.telegram.sendMessage(ctx.chat.id, ' سلام خوش امدید'  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;
        await userController.clearState(ctx , user)
    }

    })
    bot.command('MakeMeAdmin',async (ctx)=>{   
             
            admin = await Admin.findOne({
                chatId : ctx.chat.id
            })
            if( admin){
                admin = new Admin({
                    name: ctx.chat.first_name+ ctx.chat.last_name ,
                    chatId : ctx.chat.id , 
                    username :ctx.chat.username , 
                    state : state.ADMIN.MAKEMEADMIN
                }) 
                await admin.save();
                console.log(admin)
                let x = await ctx.reply(' شما ادمین شدید  یکبار /start بزنید')    
                UserController.deleteLastmessage(ctx,ctx.message.messagesId);
            }else{
                let x = await ctx.reply(' قبلا ادمین بودید یکبار /start بزنید!');
            }
        })

    bot.hears('حذف کالا',async (ctx)=>{
         
        kalaController.showkalasInline(ctx) ; 
        await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.DELETEKALA});
        
    })

    bot.hears('گزارش هفتگی', async (ctx)=>{
         
        userController.getWeecklyReport(ctx);
    })
    bot.hears('گزارش ماهانه', async (ctx)=>{
         
        userController.getMountlyReport(ctx);
    })
    bot.hears("گزارش حساب هفتگی", async (ctx)=>{
         
        adminController.getweeklyReport(ctx);
    });

    bot.hears("گزارش حساب ماهانه", async (ctx)=>{
         
        adminController.getMountlyReport(ctx);
    });
    bot.hears("حذف از حساب", async (ctx)=>{
         
        let user  = await User.findOne({chatId : ctx.chat.id}) ;
        await userController.DeleteOrder(ctx , 0 , user) ;

        //adminController.getMountlyReport(ctx);
    });

    bot.hears('ویرایش کالا',async (ctx)=>{
         
        kalaController.showkalasInline(ctx) ; 
        await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.CHANGEDETAIL.ENTERNAME});
    })

    bot.hears("افزودن موجودی کالا"  , async (ctx)=>{
        
        kalaController.ShowkalasInlinewithQuantity(ctx) ; 

        await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.ADDQUNTITY.NAME});
        
    }) 
 
    bot.hears('خرید کالا',async(ctx)=>{    
        await kalaController.showkalasInline(ctx); 
        await User.update({chatId :ctx.chat.id , state :state.USER.BUYKALA })
        
    })
    bot.hears('تسویه کاربر',async(ctx)=>{    
         
        let users =await  User.find().select('name deptPrice')
        await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.USERCHECKOUT});
        ctx.session.users = users
        let text = ''
        let index = 0 

        for (i of users){
            text += ++index + "- "+i.name  + "  ....   " + i.deptPrice  + ' تومان \n'; 
        }
        let x = await ctx.reply(text)
          
        ctx.session.messagesId.push(ctx.update.message.message_id)
        x =await ctx.reply('شماره کابر را برای تسویه وارد کنید')
              
    })
    bot.hears('موجودی کالا', async (ctx)=> {
         ;
        admin = await adminController.findAdmin(ctx)
        if (!admin ){
            let x = await ctx.reply('شما ادمین نیستید')
              
            ctx.session.messagesId.push(ctx.update.message.message_id)
            return
        }
        kalaController.ShowkalasInlinewithQuantity(ctx)
        let x = await ctx.reply('...',keyboardSample.Adminkeyboard) ;
          
        ctx.session.messagesId.push(ctx.update.message.message_id)
    } )
    bot.hears('اضافه کردن کالا',async (ctx)=>{
         
        admin = await adminController.findAdmin(ctx)
        if (!admin ){
            let x  = await ctx.reply('شما ادمین نیستید')
              
            ctx.session.messagesId.push(ctx.update.message.message_id)

            return
        }
        admin.state = state.ADMIN.ADDNEWKALA.NAME
        await  admin.save()
        let x = await ctx.reply('نام کالا را وارد کنید')
          
        ctx.session.messagesId.push(ctx.update.message.message_id)


    })
    bot.command('addnewkala', async(ctx) => {
         

        let admin = await adminController.findAdmin(ctx)
        if (!admin ){
            let x = await ctx.reply('شما ادمین نیستید')
              
            ctx.session.messagesId.push(ctx.update.message.message_id)

            return
        }
        admin.state = state.ADMIN.ADDNEWKALA.NAME
        await  admin.save()
        let x = await ctx.reply('نام کالا را وارد کنید')
          
        ctx.session.messagesId.push(ctx.update.message.message_id)


    })
    async function predicateFn (callbackData) {
        if (callbackData === "back")
            return true  ; 
        const kalas = await Kala.find() ;
        for(kala in kalas ){
            if (kala.name === callbackData)
                return true ;
            
        }
    }
    bot.action(predicateFn, async  (ctx) => {
         
        //await ctx.reply(ctx.update.callback_query.data);
        let admin = await adminController.findAdmin(ctx) 
        //console.log(admin)     
        //console.log("action  ")

        if (admin){
            //console.log("action admin ")
            //console.log(admin.state)
            if(admin.state == state.ADMIN.DELETEKALA){
            //  console.log("action admin  delete")
                adminController.deleteKala(ctx , kalaname=ctx.update.callback_query.data) 
            }
            else if(admin.state == state.ADMIN.CHANGEDETAIL.ENTERNAME){
            //  console.log("in entername")
                adminController.changedetailkala(ctx  , admin,kalaname=ctx.update.callback_query.data);
            }
            else if (admin.state == state.ADMIN.ADDQUNTITY.NAME){
            //   console.log("in add qunatity name ")
                adminController.addquantity(ctx, admin ,kalaname=ctx.update.callback_query.data) ;
            }
        }else
        userController.buy_kala(ctx , kalaname = ctx.update.callback_query.data);



    }) ; 

    bot.command('showkalas' , async(ctx)=>{
         

        kalaController.showkalasInline(ctx); 
        await User.update({chatId :ctx.chat.id , state :state.USER.BUYKALA })
    
    })



    bot.on("contact",async (ctx)=>{
         
        user =  await User.findOne({chatId : ctx.chat.id }); 
        console.log(user.state)
        if (user.state == state.USER.WAITEFORPHONE){
            user.phone =ctx.message.contact.phone_number ;
            user.state =state.NOTHING ;
            await user.save();
            await UserController.deleteLastmessage(ctx  , ctx.message.message_id) 
            let x  = await ctx.reply(' سلام خوش امدید'  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;
              
            ctx.session.messagesId.push(ctx.update.message.message_id)
        }else {
            let x =await ctx.reply('شماره تلفن شما رو نیاز ندارم ')
              
            ctx.session.messagesId.push(ctx.update.message.message_id)

        }
    })

    bot.on('text', async (ctx) => {
         
        console.log(' in text')
        let admin = await adminController.findAdmin(ctx) 
        if (admin){ //admin text 
            //console.log('admin text  ');
            if(admin.state == state.ADMIN.ADDNEWKALA.NAME  || admin.state == state.ADMIN.ADDNEWKALA.PRICE 
                || admin.state == state.ADMIN.ADDNEWKALA.QUANTITY  )
                        adminController.addNewKala(ctx ,admin) ; 

            else if (admin.state == state.ADMIN.CHANGEDETAIL.NAME ||  admin.state == state.ADMIN.CHANGEDETAIL.PRICE  )
                {   //console.log('in state change')
                    adminController.changedetailkala(ctx , admin ) ; 
                    
                }
            else if (admin.state == state.ADMIN.ADDQUNTITY.PRICE){
                adminController.addquantity(ctx , admin)
            }
            else if(admin.state == state.ADMIN.USERCHECKOUT){
                adminController.checkout(ctx,ctx.message.text )
            }
        }else {
            user = await User.findOne({chatId : ctx.chat.id})
            if (user.state == state.USER.DELETEORDER){
                userController.DeleteOrder(ctx , ctx.message.text , user)
            }
        }
    })


    bot.launch()

    // // Enable graceful stop
    // process.once('SIGINT', () => bot.stop('SIGINT'))
    // process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
catch(err) {
    console.log(err)
}
