
const Commands = require('./commands.json'); 
class KeyboardSample{
    constructor(){
        this.requestPhoneKeyboard = {
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [
                    [{  
                        text: "بله",
                        request_contact: true,
                        one_time_keyboard: true
                    }],
                    ["خیر"]
                ]
            }
        };
        this.Adminkeyboard={
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [
                    [{  
                        text: Commands.Admin.AddNewKala,
                        one_time_keyboard: true
                    },{
                        text: Commands.Admin.DeleteKala,
                        one_time_keyboard: true
                    },
                    {
                        text: Commands.Admin.ChangeKala,
                        one_time_keyboard: true  
                    },
                ],
                    [ {
                        text: Commands.Admin.Stock,
                        one_time_keyboard: true  
                    },
                    {
                        text: Commands.Admin.MountlyReport,
                        one_time_keyboard: true  
                    },
                    {
                        text: Commands.Admin.WeeklyReport,
                        one_time_keyboard: true  
                    }],[{
                        text: Commands.Admin.Checkout,
                        one_time_keyboard: true  
                    }],[{
                        text: Commands.Admin.AddQuantity,
                        one_time_keyboard: true  
                    }] 
                ]
                
            }
        };
        this.Userkeyboard = {
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [
                    [{  
                        text: Commands.User.BuyKala,
                        one_time_keyboard: true
                    },{  
                        text: Commands.User.DeleteOrder,
                        one_time_keyboard: true
                    }],[{  
                        text: Commands.User.MountlyReport,
                        one_time_keyboard: true
                    },{  
                        text: Commands.User.WeeklyReport,
                        one_time_keyboard: true
                    }],
                ]
            }
        };
        
    }
}




module.exports = new KeyboardSample();