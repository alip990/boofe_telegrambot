const  State = class  {
    constructor(){
        this.NOTHING = 'Nothing' ;
        this.ADMIN ={  
                      ADDNEWKALA:{ NAME : 'AddNewKalaName',  PRICE :'AddNewKalaPrice' ,QUANTITY :'AddNewKalaQuanntity'},
                      DELETEKALA : 'DELTEKALA',
                      CHANGEDETAIL:{ENTERNAME :'ChangeDetailEnterName' ,NAME:'ChangeDetailName', PRICE : 'ChangeDetailPrice'} ,
                      ADDQUNTITY: { NAME :"AddQuantityName" , QUANTITY:'AddQuantiryQuantity'},
                      USERCHECKOUT : 'UserCheckOut'
        }
        this.USER ={
            WAITEFORPHONE :'WaitForPhone' , 
            MAKEMEADMIN : 'MakeMeAdmin',
            BUYKALA : 'BuyKala' ,
            BUYKALAQUNTITY :'BuyKalaQuantity',
            DELETEORDER : 'DelereOrder'

        }
    }
};
module.exports = new State() ; 
