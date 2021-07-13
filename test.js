
 let report = [
    {
      _id: "60ec0c746a99ab61be071328",
      date: "2021-07-12T09:33:40.214Z",
      name: 'کافی میکس',
      price: 3200,
      user: {
        deptPrice: 4000,
        _id: "60ec0c7b6a99ab61be071329",
        name: 'علیرضاعالمی',
        chatId: '232442981',
        state: 'Nothing',
        __v: 0,
        phone: '+989018122949'
      },
      __v: 0
    },
    {
      _id: "60ec0c836a99ab61be07132a",
      date: "2021-07-12T09:33:55.561Z",
      name: 'پفک موتوری',
      price: 4000,
      user: {
        deptPrice: 4000,
        _id: "60ec0c7b6a99ab61be071329",
        name: 'علیرضاعالمی',
        chatId: '232442981',
        state: 'Nothing',
        __v: 0,
        phone: '+989018122949'
      },
      __v: 0
    }
  ]

let html = 
`<!DOCTYPE html>
<html>
<body dir=rtl>
<h2>گزارش حساب</h2>
<table style="width:100%" border="1" cellpadding="5px" >
<tr>
    <th>نام</th>
    <th>تعداد</th>
    <th>قیمت</th>  
    <th>تاریخ</th>
  </tr>
`

for (let i of report){
    html +=`  <tr>
    <td align ="center">${i.name}</td>
    <td align ="center">${i.price}</td>
    <td align ="center">1</td>
    <td align ="center">${i.date.substring(0,10) +' ' + i.date.substring(12,16)}</td>
  </tr>
  `
}
html += `</table>

</body>
</html>`;
console.log(html)

const puppeteer = require('puppeteer')
let timestmp =  Date.now()
const html2img = async  (html)=>{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 700,
        height: 760,
        deviceScaleFactor: 1,
    });            
    await page.setContent(html);
    await page.screenshot({path: "./images/" +timestmp +".png" });
    await browser.close();
}
html2img(html)