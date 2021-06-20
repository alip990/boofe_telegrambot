const state  = require('../models/state') ; 
const  mongoose = require ('mongoose')
const Admin = require ('../models/admin')
const Kala = require('../models/kala')
const User = require ('../models/user')
class AdminController{
    constructor(){
        this.kala_stack =[] ;

    }
    async findAdmin(ctx){
        let admin = await Admin.findOne({chatId :ctx.chat.id })
        return admin ;
    }
    async addNewKala(ctx ,admin){
        console.log(admin.state)
        if (admin.state == state.ADMIN.ADDNEWKALA.NAME ) {
           this.kala_stack.push(ctx.message.text) ;
            console.log(ctx.message.text) ; 
            admin.state = state.ADMIN.ADDNEWKALA.PRICE ; 
            await admin.save();
            ctx.reply('enter price of ' + ctx.message.text);
            return
    
        }else if(admin.state == state.ADMIN.ADDNEWKALA.PRICE){
            let  pr=parseInt(ctx.message.text)
                if (pr) {
                    this.kala_stack.push(pr) ; 
                    ctx.reply('enter quntity ') ; 
                    admin.state = state.ADMIN.ADDNEWKALA.QUANTITY 
                    await admin.save(); 
                }else {
                    ctx.reply('you should enter number not text ' ) ;
                    return ; 
                }
                   
            }    
            else if(admin.state == state.ADMIN.ADDNEWKALA.QUANTITY){
                let  qu=parseInt(ctx.message.text)
                if (qu) {
                   this.kala_stack.push(qu) ; 
                }else {
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
                ctx.reply(kala.name+' added succesfully') ; 
            } 
    }
    async deleteKala(ctx , kalaname){
        let admin = await this.findAdmin(ctx) ;
        await Kala.deleteOne({name : kalaname}) ; 
        admin.state = state.NOTHING ; 
        await admin.save();
        ctx.reply(kalaname +' deleted sucsesfully ') ; 

    }
    async addquantity(ctx , admin){
        if(admin.state == state.ADMIN.ADDQUNTITY.NAME){
            ctx.reply('enter quantity for ' + kalaname) ; 
            this.kala_stack.push(kalaname) ;
            admin.state = state.ADMIN.ADDQUNTITY.PRICE ; 
            admin.save();
        }else if(admin.state == state.ADMIN.ADDQUNTITY.PRICE){
            let  qu=parseInt(ctx.message.text)
                if (qu) {
                    let kala = await Kala.findOne({name : this.kala_stack  });
                    kala.availbequantity += qu ; 
                    kala.save();
                    ctx.reply(`quantity of ${ kala.name } now is ${kala.availbequantity}`) ; 
                    admin.state = state.NOTHING ; 
                }else {
                    ctx.reply('you should enter number not text ' ) ;
                    return ; 
                }

        }
    }
    async changedetailkala(ctx ,admin, kalaname =''){
        console.log(" in change detail function ")
        if(admin.state == state.ADMIN.CHANGEDETAIL.ENTERNAME){
            ctx.reply('enter new name for ' + kalaname) ; 
            this.kala_stack.push(kalaname) ;
            admin.state = state.ADMIN.CHANGEDETAIL.NAME
            admin.save();
        }
        else if (admin.state == state.ADMIN.CHANGEDETAIL.NAME){
            ctx.reply('enter new price ')
            this.kala_stack.push(ctx.message.text)
            admin.state = state.ADMIN.CHANGEDETAIL.PRICE ;
            await admin.save();
        }
        else if (admin.state == state.ADMIN.CHANGEDETAIL.PRICE){
            console.log("in change price ")
            let  pr=parseInt(ctx.message.text)
                if (pr) {
                    let new_name = this.kala_stack.pop() ;
                    let old_name = this.kala_stack.pop();
                    kala = await Kala.findOne({name:old_name}) ;
                    kala.name = new_name ; 
                    kala.price = pr ; 
                    await kala.save() ; 
                    await this.clearState();
                    ctx.reply(kala.name+ " changed successfully")
                }else {
                    ctx.reply('you should enter number not text ' ) ;
                    return ; 
                }
         
            
        }
    }async getWeecklyReport(){
        
    }
    async clearState(ctx , admin){
        this.kala_stack =[] ;
        admin.state = state.NOTHING ; 
        await admin.save();
    }
}
module.exports = new AdminController()