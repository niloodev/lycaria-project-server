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
        user: 'kieltwogz@gmail.com',
        pass: '@sn10102003'
    }
})

// Verifica se Conexão foi um sucesso.
transporter.verify((err)=>{
    if(err){ console.log(err) } 
    else console.log('Email "noreply" conectado com sucesso!');
});

module.exports = transporter;