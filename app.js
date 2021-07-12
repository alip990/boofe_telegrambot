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
const Commands = require('./models/commands.json'); 
const { CONNREFUSED } = require('dns');
mongoose.connect('mongodb://localhost/mydatabase')
        .then(()=> console.log('connected to MongoDB ..'))
        .catch(err => console.log('could not connect to database'));

const Token = "1807114273:AAEOmls4fpqmYC5dlX8gzsye97Orlh7XLss"//config.get('bot.Token') 
// const state = new State() ;

const bot = new Telegraf(Token)
bot.use(session()) ;
bot.use(async (ctx, next)=>{  // store message id 
    ctx.session ??= { counter: 0  ,messagesId  :  []   }
    const originalReply = ctx.reply.bind(ctx)
    ctx.reply = async function () {
        let x = await originalReply(...arguments)
        if (!ctx.session.messagesId.includes(x.message_id) ){
            ctx.session.messagesId.push(x.message_id) ;
            }
    }


    const update = ctx.update.message || ctx.update.callback_query.message;
    if (update.message_id)
        if (!ctx.session.messagesId.includes(update.message_id) ){
            ctx.session.messagesId.push(update.message_id) ;
            }   
    next()
})
bot.use(async (ctx, next) => 
{       
    let admin =await  Admin.findOne({chatId : ctx.chat.id })
    if(admin){
        console.log(admin)
        ctx.session.admin = admin ;
    }else{
        let user = await User.findOne({chatId : ctx.chat.id })
        if (user){
            if (user.phone){
                ctx.session.user = user  ; 
            }else if ( !ctx.message.contact){
                await ctx.reply(" شما هنوز تلفن خود را وارد نکرده اید")
                user.state = state.USER.WAITEFORPHONE
                await user.save()
                return ; 
            }
        }else {
            user = new User({
                name : ctx.chat.first_name + ctx.chat.last_name , 
                chatId : ctx.chat.id , 
                state : state.USER.WAITEFORPHONE });     
            await user.save()
            await ctx.reply('نیاز به شماره تلفن شما داریم اجازه میدهید?', keyboardSample.requestPhoneKeyboard);
            return ; 
        }
    }
    
    next(); 
  })
bot.use(async (ctx, next) => { //check admin access
    
    if(!ctx.session.admin && ctx.message){
        for(let i in Commands.Admin){
            if(Commands.Admin[i]== ctx.message.text){
                return 
            }
        }
    }
    next()
})
bot.hears('phone', async(ctx, next) => {
    await ctx.reply(ctx.chat.id, 'نیاز به شماره تلفن شما داریم اجازه میدهید?', keyboardSample.requestPhoneKeyboard);
})
bot.command('start',async (ctx) =>{ 
    let admin = await adminController.findAdmin(ctx) ;
        
    if(admin){
        ctx.reply( ' سلام خوش امدید', keyboardSample.Adminkeyboard);
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
        ctx.reply('نیاز به شماره تلفن شما داریم اجازه میدهید?', keyboardSample.requestPhoneKeyboard);
    }else{    
        ctx.reply(' سلام خوش امدید'  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;
        await userController.clearState(ctx , user)
}

})
bot.command('MakeMeAdmin',async (ctx)=>{  
        let admin = await adminController.findAdmin(ctx);
        if(!admin){
            ctx.reply('پسورد را وارد کنید')
            await  User.updateOne({chatId : ctx.chat.id , state : state.USER.MAKEMEADMIN}) ;
        }else{
            await ctx.reply(' قبلا ادمین بودید یکبار /start بزنید!');
        }
    })

bot.hears(Commands.Admin.DeleteKala,async (ctx)=>{
    kalaController.showkalasInline(ctx) ; 
    await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.DELETEKALA});
})

bot.hears(Commands.User.WeeklyReport, async (ctx)=>{         
    userController.getWeecklyReport(ctx);
})
bot.hears(Commands.User.MountlyReport, async (ctx)=>{
    userController.getMountlyReport(ctx);
})
bot.hears(Commands.Admin.WeeklyReport, async (ctx)=>{
    adminController.getweeklyReport(ctx);
});

bot.hears(Commands.Admin.MountlyReport, async (ctx)=>{
    
    adminController.getMountlyReport(ctx);
});
bot.hears(Commands.User.WeeklyReport, async (ctx)=>{
    let user  = await User.findOne({chatId : ctx.chat.id}) ;
    await userController.DeleteOrder(ctx , 0 , user) ;
    //adminController.getMountlyReport(ctx);
});

bot.hears(Commands.Admin.ChangeKala,async (ctx)=>{
   
    kalaController.showkalasInline(ctx) ; 
    await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.CHANGEDETAIL.ENTERNAME});
})

bot.hears(Commands.Admin.AddQuantity  , async (ctx)=>{
    kalaController.ShowkalasInlinewithQuantity(ctx) ; 
    await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.ADDQUNTITY.NAME});
}) 

bot.hears(Commands.User.BuyKala,async(ctx)=>{    
    await kalaController.showkalasInline(ctx); 
    await User.updateOne({chatId :ctx.chat.id} , {state :state.USER.BUYKALA })
    
})
bot.hears(Commands.Admin.Checkout,async(ctx)=>{    
    let users =await  User.find().select('name deptPrice')
    await Admin.updateOne({chatId: ctx.chat.id , state: state.ADMIN.USERCHECKOUT});
    ctx.session.users = users
    let text = ''
    let index = 0 
    for (i of users){
        text += ++index + "- "+i.name  + "  ....   " + i.deptPrice  + ' تومان \n'; 
    }
    await ctx.reply(text)
    await ctx.reply('شماره کابر را برای تسویه وارد کنید')
})
bot.hears(Commands.Admin.Stock, async (ctx)=> {
    kalaController.ShowkalasInlinewithQuantity(ctx)
    await ctx.reply('...',keyboardSample.Adminkeyboard) ;          
} )
bot.hears(Commands.Admin.AddNewKala,async (ctx)=>{
    admin = await adminController.findAdmin(ctx)
    admin.state = state.ADMIN.ADDNEWKALA.NAME
    await  admin.save()
    await ctx.reply('نام کالا را وارد کنید')

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

bot.on("contact",async (ctx)=>{
        
    user =  await User.findOne({chatId : ctx.chat.id }); 
    console.log(user.state)
    if (user.state == state.USER.WAITEFORPHONE){
        if (user.chatId != ctx.message.contact.user_id){
            ctx.reply('شماره تلفن خود را وارد کنید')
            return 
        }
        user.phone =ctx.message.contact.phone_number ;
        user.state =state.NOTHING ;
        await user.save();
        await UserController.deleteLastmessage(ctx  , ctx.message.message_id) 
        await ctx.reply(' سلام خوش امدید'  + ctx.chat.first_name, keyboardSample.Userkeyboard) ;
            
    }else {
        await ctx.reply('شماره تلفن شما رو نیاز ندارم ')
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
        }else if (user.state == state.USER.MAKEMEADMIN){
            userController.adminCheckPass(ctx) ;
        }

    }
})


bot.launch()

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))

