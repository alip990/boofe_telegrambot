const  State = class  {
    constructor(){
        this.NOTHING = 'Nothing' ;
        this.ADMIN ={ MAKEMEADMIN : 'MakeMeAdmin' , 
                      ADDNEWKALA:{ NAME : 'AddNewKalaName',  PRICE :'AddNewKalaPrice' ,QUANTITY :'AddNewKalaQuanntity'},
                      DELETEKALA : 'DELTEKALA'
        }
        this.USER ={
            WAITEFORPHONE :'WaitForPhone' , 
            BUYKALA : 'BuyKala'

        }
    }
};
module.exports = new State() ; 
