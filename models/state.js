const  State = class  {
    constructor(){
        this.NOTHING = 'Nothing' ;
        this.ADMIN ={  
                      ADDNEWKALA:{ NAME : 'AddNewKalaName',  PRICE :'AddNewKalaPrice' ,QUANTITY :'AddNewKalaQuanntity'},
                      DELETEKALA : 'DELTEKALA',
                      CHANGEDETAIL:{ENTERNAME :'ChangeDetailEnterName' ,NAME:'ChangeDetailName', PRICE : 'ChangeDetailPrice'} ,
                      ADDQUNTITY: { NAME :"AddQuantityName" , QUANTITY:'AddQuantiryQuantity'},
                      USERCHECKOUT : {'SELECTUSER':'UserCheckOut1' ,'ENTERPRICE':'UserCheckOut2'}

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
