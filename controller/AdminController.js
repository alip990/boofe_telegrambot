const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')

class AdminController{
    constructor(){
        this.kala_stack =[] ; 

    }
    async addNewKala(ctx , admin ){

        if (admin.state == state.ADMIN.ADDNEWKALA.NAME ){
           this.kala_stack.push(ctx.message.text) ;
            console.log(ctx.message.text) ; 
            admin.state = state.ADMIN.ADDNEWKALA.PRICE ; 
            await admin.save();
            ctx.reply('enter price of ' + ctx.message.text);
            return
    
            }else if(admin.state == state.ADMIN.ADDNEWKALA.PRICE){
                try {
                   this.kala_stack.push(parseInt(ctx.message.text)) ; 
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
                   this.kala_stack.push(parseInt(ctx.message.text)) ; 
                }catch(err) {
                    ctx.reply('you should enter number not text ' ) ;
                    return ; 
                    
                }
                admin.state = state.NOTHING
                await admin.save();    
                let kala = new Kala();
                kala.availbequantity =this.kala_stack.pop();
                kala.price =this.kala_stack.pop();
                kala.name =this.kala_stack.pop();
                await kala.save()
                ctx.reply('kala added succesfully') ; 
            } 
    }
    async deleteKala(ctx , admin){
        

    }
    async addquantity(ctx , admin){

    }
    async changedailkala(){
        
    }
}
module.exports = new AdminController()