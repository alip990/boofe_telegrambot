//const config = require('config');
const { Telegraf } = require('telegraf')
const  mongoose = require ('mongoose')
const Admin = require ('./models/admin')
const Kala = require('./models/kala')
const User = require ('./models/user')
let State = class  {
    constructor(){
        this.NOTHING = 'Nothing' ;
        this.ADMIN ={ MAKEMEADMIN : 'MakeMeAdmin' , 
                      ADDNEWKALA:{ NAME : 'AddNewKalaName',  PRICE :'AddNewKalaPrice' ,QUANTITY :'AddNewKalaQuanntity'}
        }
    }
};

mongoose.connect('mongodb://localhost/mydatabase')
.then(()=> console.log('connected to MongoDB ..'))
.catch(err => console.log('could not connect to database'))



const Token = "1807114273:AAEOmls4fpqmYC5dlX8gzsye97Orlh7XLss"//config.get('bot.Token') 
async function checkDBconnection(){
    return
}

async function createAdmin(){

}

async function addnewkala(x){


    const kala =  await new Kala (x) ; 
    await kala.save()
    console.log(kala)
    return kala 
}
const state = new State() ;


const bot = new Telegraf(Token)
bot.command('start', (ctx) => ctx.reply(' hi '))
bot.command('MakeMeAdmin',async (ctx)=>{    
        admin = await Admin.find({
            chatId : ctx.chat.id
        })
        if( admin.length  == 0){
            admin = new Admin({
                name: ctx.chat.first_name+ ctx.chat.last_name ,
                chatId : ctx.chat.id , 
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
    console.log(admin[0])
    if (admin.length == 0 ){
        ctx.reply('your are not admin')
        return
    }
    admin[0].state = state.ADMIN.ADDNEWKALA.NAME
    await  admin[0].save()
    ctx.reply('enter new kala name')

})
bot.command('showkalas' , async(ctx)=>{
    const kalas = await Kala.find () ;
    ctx.reply((kalas)) ; 

    bot.telegram.sendMessage(ctx.chat.id, "salam", {
        reply_markup: {
            inline_keyboard: [
                [{
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                    {
                        text: "پفک نمکی چی توز",
                        callback_data: 'cat'
                    },
                ],[{
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                    {
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                ],[{
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                    {
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                ],[{
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                    {
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                ],[ {
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },
                    {
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    },{
                        text: "چیپس سرکه چیتوز",
                        callback_data: 'dog'
                    }
                ],

            ]
        }
    })
})


var   kala_stack =[] ; 

bot.on('text', async (ctx) => {
    admin = await Admin.findOne({
        chatId :ctx.chat.id
    })
    console.log(admin)
    if (admin ){ 
        if (admin.state == state.ADMIN.ADDNEWKALA.NAME ){
        kala_stack.push(ctx.message.text) ;
        console.log(ctx.message.text) ; 
        admin.state = state.ADMIN.ADDNEWKALA.PRICE ; 
        await admin.save();
        ctx.reply('enter price of ' + ctx.message.text);
        return

        }else if(admin.state == state.ADMIN.ADDNEWKALA.PRICE){
            try {
                kala_stack.push(parseInt(ctx.message.text)) ; 
            }catch(err) {
                ctx.reply('you should enter number not text ' ) ;
                return ; 
                
            }
            ctx.reply('enter quntity ') ; 
            admin.state = state.ADMIN.ADDNEWKALA.QUANTITY 
            await admin.save();    
        }    
        else if(admin.state == state.ADMIN.ADDNEWKALA.QUANTITY){
            try {
                kala_stack.push(parseInt(ctx.message.text)) ; 
            }catch(err) {
                ctx.reply('you should enter number not text ' ) ;
                return ; 
                
            }
            admin.state = state.NOTHING
            await admin.save();    
            kala = new Kala();
            kala.availbequantity = kala_stack.pop();
            kala.price = kala_stack.pop();
            kala.name = kala_stack.pop();
            await kala.save()
            ctx.reply('kala added succesfully') ; 
        }   
    }
})


bot.launch()

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))

  
async function getCourses(){

    const courses = await Course
    //.find({author :''})
    //.find({price : {$gt : 10 } })
    .find({author : /^Mosh/})
   // .find({price {$in : [10,15, 20]}})
    console.log(courses)
    
}
