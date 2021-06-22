//const config = require('config');
const { Telegraf ,Markup} = require('telegraf')
const  mongoose = require ('mongoose')
const Admin = require ('./models/admin')
const Kala = require('./models/kala')
const User = require ('./models/user')
const state  = require('./models/state') ; 
const adminController = require('./controller/AdminController');
const userController  = require('./controller/UserController')
const kalaController  = require('./controller/KalaController')
const keyboardSample = require ('./models/Keyboard')
mongoose.connect('mongodb://localhost/mydatabase')
.then(()=> console.log('connected to MongoDB ..'))
.catch(err => console.log('could not connect to database'))

const Token = "1807114273:AAEOmls4fpqmYC5dlX8gzsye97Orlh7XLss"//config.get('bot.Token') 
// const state = new State() ;

const bot = new Telegraf(Token)



bot.hears('phone', async(ctx, next) => {
    await bot.telegram.sendMessage(ctx.chat.id, 'Can we get access to your phone number?', keyboardSample.requestPhoneKeyboard);


})

const startKeyBoard = {
    "reply_markup": {
        "one_time_keyboard": true ,
        "keyboard": [
            [{
                text: "لیست خوراکی ها ",
                one_time_keyboard: true , 
                callback_data : '/showkalas'
            }],
            ["Cancel"]
        ]
    }
};


bot.command('start',async (ctx) =>{ 
    let admin = await adminController.findAdmin(ctx) ;
    if(admin){
        bot.telegram.sendMessage(ctx.chat.id, 'Hello ! What can I do for you', keyboardSample.Adminkeyboard);
        return ;         
    }
    let user = await userController.findUser(ctx); 
    if( ! user ){
        console.log('in singup')
        user = new User({
                        name : ctx.chat.first_name + ctx.chat.last_name , 
                        chatId : ctx.chat.id , 
                        state : state.USER.WAITEFORPHONE });     
        user.save()
        bot.telegram.sendMessage(ctx.chat.id, 'Can we get access to your phone number?', keyboardSample.requestPhoneKeyboard);
    }else{    
    bot.telegram.sendMessage(ctx.chat.id, 'Hello What can I do for you'  + ctx.chat.first_name, keyboardSample.startKeyBoard);
    }

})
bot.command('MakeMeAdmin',async (ctx)=>{    
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
        }else{
            console.log('you were admin ')
        }
    })

bot.hears('حذف کالا',async (ctx)=>{
    kalaController.showkalasInline(ctx) ; 
    await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.DELETEKALA});
})

bot.hears('گزارش هفتگی', async (ctx)=>{
    adminController.getWeecklyReport(ctx);
})

bot.hears('ویرایش کالا',async (ctx)=>{
    kalaController.showkalasInline(ctx) ; 
    await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.CHANGEDETAIL.ENTERNAME});
})
bot.hears("افزودن موجودی کالا"  , async (ctx)=>{
    kalaController.ShowkalasInlinewithQuantity(ctx) ; 
    await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.ADDQUNTITY.NAME});
    
}) 
bot.hears('لیست خوراکی ها',async(ctx)=>{
    let editedMessage = `edited message`;
    ctx.telegram.editMessageText(ctx.chat.id, ctx.message.message_id, undefined, editedMessage,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⬅️ Voltar", callback_data: 'start' }
            ]
          ]
        },
        parse_mode: "markdown"
      })
    await kalaController.showkalasInline(ctx); 
    await User.update({chatId :ctx.chat.id , state :state.USER.BUYKALA })

 
})
bot.hears('موجودی کالا', kalaController.ShowkalasInlinewithQuantity )
bot.hears('اضافه کردن کالا',async (ctx)=>{
    admin = await adminController.findAdmin(ctx)
    if (!admin ){
        ctx.reply('your are not admin')
        return
    }
    admin.state = state.ADMIN.ADDNEWKALA.NAME
    await  admin.save()
    ctx.reply('enter new kala name')

})
bot.command('addnewkala', async(ctx) => {
    let admin = await adminController.findAdmin(ctx)
    if (!admin ){
        ctx.reply('your are not admin')
        return
    }
    admin.state = state.ADMIN.ADDNEWKALA.NAME
    await  admin.save()
    ctx.reply('enter new kala name')

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
    ctx.reply(ctx.update.callback_query.data);
    let admin = await adminController.findAdmin(ctx) 
    console.log(admin)     
    console.log("action  ")

    if (admin){
        console.log("action admin ")
        console.log(admin.state)
        if(admin.state == state.ADMIN.DELETEKALA){
            console.log("action admin  delete")
            adminController.deleteKala(ctx , kalaname=ctx.update.callback_query.data) 
        }
        else if(admin.state == state.ADMIN.CHANGEDETAIL.ENTERNAME){
            console.log("in entername")
            adminController.changedetailkala(ctx  , admin,kalaname=ctx.update.callback_query.data);
        }
        else if (admin.state = state.ADMIN.ADDQUNTITY.NAME){
            console.log("in add qunatity name ")
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
    if (user.state == state.WAITEFORPHONE){
        user.phone =ctx.message.contact.phone_number ;
        user.state =state.NOTHING ;
        await user.save()
    }else {
        ctx.reply('I dont neet your phone number ')
    }
})

bot.on('text', async (ctx) => {
    console.log(' in text')
    let admin = await adminController.findAdmin(ctx) 
    if (admin){ //admin text 
        console.log('admin text  ');
        if(admin.state == state.ADMIN.ADDNEWKALA.NAME  || admin.state == state.ADMIN.ADDNEWKALA.PRICE 
            || admin.state == state.ADMIN.ADDNEWKALA.QUANTITY  )
                     adminController.addNewKala(ctx ,admin) ; 

        else if (admin.state == state.ADMIN.CHANGEDETAIL.NAME ||  admin.state == state.ADMIN.CHANGEDETAIL.PRICE  )
            {   console.log('in state change')
                adminController.changedetailkala(ctx , admin ) ; 
                
            }
        else if (admin.state == state.ADMIN.ADDQUNTITY.PRICE){
            adminController.addquantity(ctx , admin)
        }
    }else {


    }
})


bot.launch()

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))

  
