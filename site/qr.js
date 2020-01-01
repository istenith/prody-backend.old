var QRCode = require('qrcode')
const Email = require('email-templates');

const email = new Email();
 
QRCode.toDataURL('hello',(err,url)=>{
    email.render('user/html', {
        id: '243234',
        name: 'Parth',
        qr : url,
    })
    .then(console.log)
    .catch(console.error);
})


 

 
