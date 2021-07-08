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

mongoose.connect('mongodb://localhost/mydatabase')
        .then(()=> console.log('connected to MongoDB ..'))
        .catch(err => console.log('could not connect to database'));

const Token = "1807114273:AAEOmls4fpqmYC5dlX8gzsye97Orlh7XLss"//config.get('bot.Token') 
// const state = new State() ;

const bot = new Telegraf(Token)
bot.use(session()) ;


function check_session (ctx){
    ctx.session ??= { counter: 0  }
}
try{
    bot.hears('phone', async(ctx, next) => {
        await bot.telegram.sendMessage(ctx.chat.id, 'نیاز به شماره تلفن شما داریم اجازه میدهید?', keyboardSample.requestPhoneKeyboard);


    })


    bot.command('start',async (ctx) =>{ 
        let admin = await adminController.findAdmin(ctx) ;
        check_session(ctx)
        ctx.session.counter = 0 ;
        if(admin){
            bot.telegram.sendMessage(ctx.chat.id, ' سلام خوش امدید', keyboardSample.Adminkeyboard);
            ctx.session.counter +=2 ;
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
            ctx.session.counter +=2 ;
        }else{    
        bot.telegram.sendMessage(ctx.chat.id, ' سلام خوش امدید'  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;
        ctx.session.counter +=2 ;
        await userController.clearState(ctx , user)
    }

    })
    bot.command('MakeMeAdmin',async (ctx)=>{   
            check_session(ctx)
            admin = await Admin.find({
                chatId : ctx.chat.id
            })
            if( admin.length  == 0){
                admin = new Admin({
                    name: ctx.chat.first_name+ ctx.chat.last_name ,
                    chatId : ctx.chat.id , 
                    username :ctx.chat.username , 
                    state : state.ADMIN.MAKEMEADMIN
                }) 
                await admin.save();
                console.log(admin)
                await ctx.reply('شما ادمین شدید ')
                ctx.session.counter +=2 ;
            }else{
                await ctx.reply(' قبلا ادمین بودید یکبار /start بزنید!')
                ctx.session.counter +=2 ;

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
        check_session(ctx);
        kalaController.ShowkalasInlinewithQuantity(ctx) ; 
        ctx.session.counter +=4 ;

        await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.ADDQUNTITY.NAME});
        
    }) 
 
    bot.hears('خرید کالا',async(ctx)=>{    

        await kalaController.showkalasInline(ctx); 
        await User.update({chatId :ctx.chat.id , state :state.USER.BUYKALA })
        
    })
    bot.hears('تسویه کاربر',async(ctx)=>{    
        check_session(ctx)
        let users =await  User.find().select('name deptPrice')
        await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.USERCHECKOUT});
        ctx.session.users = users
        let text = ''
        let index = 0 

        for (i of users){
            text += ++index + "- "+i.name  + "  ....   " + i.deptPrice  + ' تومان \n'; 
        }
        ctx.reply(text)
        ctx.reply('شماره کابر را برای تسویه وارد کنید')
        ctx.session.counter +=3 ; 
    
    })
    bot.hears('موجودی کالا', async (ctx)=> {
        check_session(ctx) ;
        admin = await adminController.findAdmin(ctx)
        if (!admin ){
            await ctx.reply('شما ادمین نیستید')
            ctx.session.counter +3 ;
            return
        }
        kalaController.ShowkalasInlinewithQuantity(ctx)
        ctx.reply('...',keyboardSample.Adminkeyboard) ;
        ctx.session.counter +=4 ;
    } )
    bot.hears('اضافه کردن کالا',async (ctx)=>{
        check_session(ctx)
        admin = await adminController.findAdmin(ctx)
        if (!admin ){
            await ctx.reply('شما ادمین نیستید')
            ctx.session.counter +3 ;

            return
        }
        admin.state = state.ADMIN.ADDNEWKALA.NAME
        await  admin.save()
        await ctx.reply('نام کالا را وارد کنید')
        ctx.session.counter +=3;


    })
    bot.command('addnewkala', async(ctx) => {
        check_session(ctx)

        let admin = await adminController.findAdmin(ctx)
        if (!admin ){
            await ctx.reply('شما ادمین نیستید')
            ctx.session.counter +3 ;

            return
        }
        admin.state = state.ADMIN.ADDNEWKALA.NAME
        await  admin.save()
        await ctx.reply('نام کالا را وارد کنید')
        ctx.session.counter +3 ;


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
        check_session(ctx)
        //await ctx.reply(ctx.update.callback_query.data);
        ctx.session.counter += 1 ;
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
        check_session(ctx)

        kalaController.showkalasInline(ctx); 
        await User.update({chatId :ctx.chat.id , state :state.USER.BUYKALA })
    
    })



    bot.on("contact",async (ctx)=>{
        check_session(ctx)
        user =  await User.findOne({chatId : ctx.chat.id }); 
        console.log(user.state)
        if (user.state == state.USER.WAITEFORPHONE){
            user.phone =ctx.message.contact.phone_number ;
            user.state =state.NOTHING ;
            await user.save();
            await UserController.deleteLastmessage(ctx  , ctx.message.message_id) 
            ctx.reply(' سلام خوش امدید'  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;
            ctx.session.counter +3 ;
        }else {
            await ctx.reply('شماره تلفن شما رو نیاز ندارم ')
            ctx.session.counter +2 ;

        }
    })

    bot.on('text', async (ctx) => {
        check_session(ctx)
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
