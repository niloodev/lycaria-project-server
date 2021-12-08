const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     host: 'smtp.umbler.com',
//     port: 587, 
//     secure: false,
//     auth: {
//         user: 'noreply@lycaria.com.br',
//         pass: 'A4d62af8'
//     },
// });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kielnevaeh@gmail.com',
        pass: '@Sn10102003'
    }
})

// nodemailer.createTestAccount((err, account)=>{
//     if(err){
//         console.log(err);
//         return;
//     }

//     let transporter = nodemailer.createTransport({
//         host: account.smtp.host,
//         port: account.smtp.port,
//         secure: account.smtp.secure,
//         auth: {
//             user: account.user,
//             pass: account.pass
//         }
//     });     
// });

// Verifica se Conexão foi um sucesso.
transporter.verify((err)=>{
    if(err){ console.log(err) } 
    else console.log('Email "noreply" conectado com sucesso!');
});

module.exports = transporter;

