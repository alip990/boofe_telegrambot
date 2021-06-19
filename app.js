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

mongoose.connect('mongodb://localhost/mydatabase')
.then(()=> console.log('connected to MongoDB ..'))
.catch(err => console.log('could not connect to database'))

const Token = "1807114273:AAEOmls4fpqmYC5dlX8gzsye97Orlh7XLss"//config.get('bot.Token') 
// const state = new State() ;

const bot = new Telegraf(Token)

const requestPhoneKeyboard = {
    "reply_markup": {
        "one_time_keyboard": true,
        "keyboard": [
            [{
                text: "My phone number",
                request_contact: true,
                one_time_keyboard: true
            }],
            ["Cancel"]
        ]
    }
};


bot.hears('phone', async(ctx, next) => {
    await bot.telegram.sendMessage(ctx.chat.id, 'Can we get access to your phone number?', requestPhoneKeyboard);


})

const startKeyBoard = {
    "reply_markup": {
        "one_time_keyboard": true,
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
    var user = await User.findOne({chatId : ctx.chat.id}) ; 
    if( ! user ){
        user = new User({
                        name : ctx.chat.first_name + ctx.chat.last_name , 
                        chatId : ctx.chat.id , 
                        state : state.USER.WAITEFORPHONE });     
        user.save()
        bot.telegram.sendMessage(ctx.chat.id, 'Can we get access to your phone number?', requestPhoneKeyboard);
    }else{    

    bot.telegram.sendMessage(ctx.chat.id, 'Hello What can I do for you', startKeyBoard);
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
bot.command('addnewkala', async(ctx) => {
    admin = await Admin.find({
        chatId :ctx.chat.id
    })
    if (admin.length == 0 ){
        ctx.reply('your are not admin')
        return
    }
    admin[0].state = state.ADMIN.ADDNEWKALA.NAME
    await  admin[0].save()
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
bot.action(predicateFn,  (ctx) => {
    ctx.reply(ctx.update.callback_query.data);
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
    }else {
        ctx.reply('I dont neet your phone number ')
    }
})


bot.on('text', async (ctx) => {
    admin = await Admin.findOne({chatId :ctx.chat.id })
    console.log(admin)
    if (admin ){ //add new kala 
        adminController.addNewKala(ctx , admin) ; 
    }else {


    }
})


bot.launch()

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))

  
