
class KeyboardSample{
    constructor(){
        this.requestPhoneKeyboard = {
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
        this.Adminkeyboard={
            "reply_markup": {
                "one_time_keyboard": true,
                "keyboard": [
                    [{  
                        text: "اضافه کردن کالا",
                        one_time_keyboard: true
                    },{
                        text: "حذف کالا",
                        one_time_keyboard: true
                    },
                    {
                        text: "ویرایش کالا",
                        one_time_keyboard: true  
                    },
                ],
                    [ {
                        text: "موجودی کالا",
                        one_time_keyboard: true  
                    },
                    {
                        text: "گزارش ماهانه",
                        one_time_keyboard: true  
                    },
                    {
                        text: "گزارش هفتگی",
                        one_time_keyboard: true  
                    }],[{
                        text: "تسویه کاربر",
                        one_time_keyboard: true  
                    }],[{
                        text: "افزودن موجودی کالا",
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
                        text: "خرید کالا ",
                        one_time_keyboard: true
                    },{  
                        text: "حذف از حساب",
                        one_time_keyboard: true
                    }],[{  
                        text: "گزارش ماهانه",
                        one_time_keyboard: true
                    },{  
                        text: "گزارش هفتگی",
                        one_time_keyboard: true
                    },{  
                        text: "گزارش پرداخت ها",
                        one_time_keyboard: true
                    }],
                    ["گزارش کلی"]
                ]
            }
        };
        this.startKeyBoard = {
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
    }
}




module.exports = new KeyboardSample();