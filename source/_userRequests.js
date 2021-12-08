/////////////////////////////////////////////////////////////////// Módulos

// Express que cuida das solicitações (Get, Post, etc)
const express = require('express').Router();
const fs = require('fs');

// Mongoose (Banco de Dados)
const mongoose = require('mongoose');

// Tabela de Usuários
const userData = mongoose.model('user');

// Gerar códigos criptografados.
const jwt = require('jsonwebtoken');

// Criptografar senhas
const bcryptjs = require('bcryptjs');

// Função de Verificação de Estrutura de Dados
const verifyObject = require('./modules/_verifyModule');

// Colyseus
const colyseus = require('colyseus');
const matchMaker = colyseus.matchMaker;

// Email
const emailModule = require('./modules/_emailModule'); 

///////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////// Constantes e Chaves

const jwtKey = "a@@cuASIOSAx0AS389#$2isadpASdxzklcnx_cwaSdj0932109389ef09sadjfd0sif";
const jwtPassKey = "ow0294Ksocx_sowisaJca9s9iS)Xxs0adsaKX)w9123jsadmSIADpSAdasd";
const jwtCodeKey = "asjajisaf90209u2ujipdsajksd(_SD(_s-e-0e9w-qdasijdisac-09)(Wd90qwe";
const atualLocateHTML = "https://lycaria.com.br";

///////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////// Funções

// Gera um código aleatório
function generateCode(length){
    var stringHash = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321!@#$%&()*';
    var code = '';
    for(var i = 0; i < length; i++){
        code += stringHash.charAt(Math.floor(Math.random()*stringHash.length));
    }
    return code;
}

// Envia o email de confirmação de conta
async function sendConfirmationMail(toEmail, verifyToken){
    return await emailModule.sendMail({
        from: 'kieltwogz@gmail.com',
        to: toEmail,
        subject: "CONFIRME SUA CONTA - LYCARIA", 
        html: `<a href="${atualLocateHTML}/user/register/confirm/${verifyToken}">CONFIRMAR</a>`,
    }); 
}

// Envia o email de recuperação de senha
async function sendRecoveryMail(toEmail, code_){
    emailModule.sendMail({
        from: 'kieltwogz@gmail.com',
        to: toEmail,
        subject: "RECUPERAR CONTA - LYCARIA", 
        html: `<p>Seu código é ${code_}</p>`,
    }); 
}

// Retorna o objeto de clientes do saguão principal.
const returnClientsFromLobby = require('./modules/_returnClientsFromLobby');

/////////////////////////////////////////////////////////////////// 


/////////////////////////////////////////////////////////////////// Funções do Middleware

//////// Função Pura

// Checar conexão.
express.get('/check', (req,res)=>{
    return res.status(200).send('checked');
});

//////// Funções /login

// Login (Recebe um email e uma senha, autentica e retorna um token de autenticação)
express.post('/login', async(req,res)=>{
    // Verificar estrutura de dados.
    try { verifyObject.validateLogin.validate(req.body) } 
    catch(e) { return res.status(400).send('Dados inválidos.'); }

    // Pesquisar email no banco de dados de usuários.
    try {
        var users = await userData.find({email: req.body.email});
        if (users.length == 0) return res.status(400).send('O email digitado não foi encontrado.');                 
    } catch { return res.status(400).send('O email digitado não foi encontrado.') }
    
    // Checar se a senha recebida está correta.
    try {
        var compare = await bcryptjs.compare(req.body.password, users[0].password);
        if (compare == false) return res.status(400).send('A senha digitada está incorreta.');
    } catch { return res.status(400).send('A senha digitada está incorreta.'); }
    
    // Checando se a conta foi verificada.
    if (users[0].checked == false) return res.status(401).send('Essa conta não foi verificada.');
    
    // Gerando token de autenticação.
    try { var token = jwt.sign({_id: users[0]._id, email: users[0].email, pass: users[0].password}, jwtKey, {expiresIn: '30 days'}) } 
    catch { return res.status(400).send('Erro ao gerar token.') }

    // Finalizar
    return res.status(200).send(token);
});

// Requerir email de confirmação. (Envia o email de confirmação)
express.post('/login/requestMail', async(req,res)=>{
    // Procura o email recebido no banco de dados de usuário.
    try {
        var users = await userData.find({email: req.body.email});
        if(users.length == 0) return res.status(400).send('Conta inexistente.');
    } catch { return res.status(400).send('Erro ao enviar email.') }

    // Se a conta já estiver verificada, retorna um erro.
    if (users[0].checked == true) return res.status(400).send('Conta já verificada.');
    
    // Gera um token de verificação e envia ao email da conta
    try {    
        const verifyToken = jwt.sign({_id: users[0]._id, email: req.body.email}, jwtPassKey);
        await sendConfirmationMail(req.body.email, verifyToken);
    } catch { return res.status(400).send('Ocorreu um problema ao enviar o email.') }

    // Finalização
    return res.status(200).send('Email enviado com sucesso.');
});

//////// Funções /register

// Cadastro (Valida as informações, e insere a nova conta no banco de dados)
express.post('/register', async(req,res)=>{
    // Validar estrutura de dados.
    try { let v_ = verifyObject.validateRegister.validate(req.body); } 
    catch { return res.status(400).send('Dados inválidos.') }

    // Buscar o email no banco de dados de usuário, se existir cancela o registro.
    try {
        var users = await userData.find({email: req.body.email});
        if (users.length != 0) return res.status(400).send('Este email já existe.');
    } catch { return res.status(400).send('Houve um problema ao validar seu email.') }

    // Busca o apelido no banco de dados de usuário, se existir cancela o registro.
    try {
        var users = await userData.find({nickName: req.body.nickName});
        if (users.length != 0) return res.status(400).send(`Oops! Alguém já se chama ${req.body.nickName}.`);
    } catch { return res.status(400).send('Houve um problema ao validar seu apelido.') }

    // Criptografa a senha digitada.
    try {
        var saltHash = await bcryptjs.genSalt();
        var signedPass = await bcryptjs.hash(req.body.password, saltHash);
    } catch { return res.status(400).send('Houve um problema ao validar sua senha.') }

    // Cadastro de dados no banco de dados de usuário.
    try {
        var newUser = await userData.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            nickName: req.body.nickName,
            email: req.body.email,
            password: signedPass,
        });
    } catch { return res.status(400).send('Houve um problema no seu cadastro.') }

    // Gera o token para verificação da conta, e envia o email.
    try {    
        const verifyToken = jwt.sign({_id: newUser._id, email: req.body.email}, jwtPassKey);
        sendConfirmationMail(req.body.email, verifyToken);
    } catch { return res.status(400).send('Houve um problema no seu cadastro.') }

    // Finalização.
    return res.status(200).send({firstName: req.body.firstName, lastName: req.body.lastName, nickName: req.body.nickName, email: req.body.email});
}); 

// Confirmar token de validação de conta (Pega o token e valida a conta)
express.get('/register/confirm/:tok', async(req,res)=>{
    // Coloca o token recebido dentro de uma variável.
    var token_ = req.params.tok;
    
    // Verifica e descodifica o token recebido. Retorna uma página HTML caso haja um erro.
    try { var unToken_ = jwt.verify(token_, jwtPassKey) } 
    catch {
        return res.send(`
        <html>   
            <head>        
                <meta name="viewport" content="width=device-width">        
                <meta charset="utf-8">        
                <title>Confirmação de Conta - Lycaria</title>                
                <style>             
                    body{                
                        font-family: Arial;                
                        padding: 0px;                
                        margin: 0px;                
                        background: #2a2a2a;                
                        display: flex; 
                        justify-content: center; 
                        align-items: center;            
                    }            
                    .card{                
                        background: #1f1f1f;                
                        box-shadow: 0px 0px 20px black;                
                        padding-top: 29px;                
                        padding-bottom: 29px;                
                        padding-left: 25px;                
                        padding-right: 25px;                              
                        max-width: 345px;                                
                        color: white;                               
                        font-size: 18px;            
                    }            
                    .title{                
                        text-align: center;                
                        width: 100%;                
                        padding-top: 15px;                
                        padding-bottom: 15px;                
                        color: white;                
                        font-weight: bold;                
                        text-shadow: 0px 0px 20px black;                
                        font-size: 25px;                
                        font-weight: bold;                
                        letter-spacing: 3.5px;            
                    }        
                </style>    
            </head>    
            <body>        
                <div class="card">            
                    <div class="title">Lycaria</div>            
                    <p style="text-align: center;">Oops! Tivemos um problema.</p>            
                    <p style="text-align: center;">Houve um erro na validação do seu token.</p>       
                </div>    
            </body>
        </html> ` 
        );
    }
    
    // Procura o usuário no banco de dados. Retorna uma página HTML caso nenhum usuário for encontrado.
    var user_ = await userData.find({email: unToken_.email});
    if (user_.length == 0){
        return res.send(`
        <html>    
            <head>        
                <meta name="viewport" content="width=device-width">        
                <meta charset="utf-8">        
                <title>Confirmação de Conta - Lycaria</title>                
                <style>             
                    body{                
                        font-family: Arial;                
                        padding: 0px;                
                        margin: 0px;                
                        background: #2a2a2a;                
                        display: flex; 
                        justify-content: center; 
                        align-items: center;            
                    }            
                    .card{                
                        background: #1f1f1f;                
                        box-shadow: 0px 0px 20px black;                
                        padding-top: 29px;                
                        padding-bottom: 29px;                
                        padding-left: 25px;                
                        padding-right: 25px;                                
                        max-width: 345px;                                
                        color: white;                               
                        font-size: 18px;            
                    }            
                    .title{                
                        text-align: center;                
                        width: 100%;                
                        padding-top: 15px;                
                        padding-bottom: 15px;                
                        color: white;                
                        font-weight: bold;                
                        text-shadow: 0px 0px 20px black;                
                        font-size: 25px;                
                        font-weight: bold;                
                        letter-spacing: 3.5px;            
                    }        
                </style>    
            </head>    
            <body>        
                <div class="card">            
                    <div class="title">Lycaria</div>            
                    <p style="text-align: center;">Oops! Tivemos um problema.</p>            
                    <p style="text-align: center;">Não encontramos o dono dessa conta.</p>        
                </div>    
            </body>
        </html>`
        );
    }
    
    // Se o usuário já estiver confirmado sua conta. Retorna uma página HTML caso o usuário já tiver verificado sua conta.
    if (user_[0].checked == true){
        return res.send(`
        <html>    
            <head>        
                <meta name="viewport" content="width=device-width">        
                <meta charset="utf-8">        
                <title>Confirmação de Conta - Lycaria</title>                
                <style>             
                    body{                
                        font-family: Arial;                
                        padding: 0px;                
                        margin: 0px;                
                        background: #2a2a2a;                
                        display: flex; 
                        justify-content: 
                        center; 
                        align-items: center;            
                    }            
                    .card{                
                        background: #1f1f1f;                
                        box-shadow: 0px 0px 20px black;                
                        padding-top: 29px;                
                        padding-bottom: 29px;                
                        padding-left: 25px;                
                        padding-right: 25px;                                
                        max-width: 345px;                                
                        color: white;                               
                        font-size: 18px;            
                    }            
                    .title{                
                        text-align: center;                
                        width: 100%;                
                        padding-top: 15px;                
                        padding-bottom: 15px;                
                        color: white;                
                        font-weight: bold;                
                        text-shadow: 0px 0px 20px black;               
                        font-size: 25px;                
                        font-weight: bold;                
                        letter-spacing: 3.5px;            
                    }        
                </style>    
            </head>    
            <body>        
                <div class="card">            
                    <div class="title">Lycaria</div>            
                    <p style="text-align: center;">Oops! Houve um problema.</p>            
                    <p style="text-align: center;">Sua conta já foi confirmada.</p>        
                </div>    
            </body>
        </html>`
        );
    }
    
    // Atualiza o estado de verificação do usuário no banco de dados. Retorna uma página HTML caso ocorra algum erro.
    try { await userData.updateOne({_id: user_[0]._id}, {$set: {checked: true}}) } 
    catch {
        return res.send(`
        <html>    
            <head>        
                <meta name="viewport" content="width=device-width">        
                <meta charset="utf-8">        
                <title>Confirmação de Conta - Lycaria</title>                
                <style>             
                    body {                
                        font-family: Arial;                
                        padding: 0px;                
                        margin: 0px;                
                        background: #2a2a2a;                
                        display: flex; 
                        justify-content: center; 
                        align-items: center;            
                    }            
                    .card{                
                        background: #1f1f1f;                
                        box-shadow: 0px 0px 20px black;                
                        padding-top: 29px;                
                        padding-bottom: 29px;                
                        padding-left: 25px;                
                        padding-right: 25px;                                
                        max-width: 345px;                                
                        color: white;                               
                        font-size: 18px;            
                    }            
                    .title{                
                        text-align: center;                
                        width: 100%;                
                        padding-top: 15px;                
                        padding-bottom: 15px;                
                        color: white;                
                        font-weight: bold;                
                        text-shadow: 0px 0px 20px black;                
                        font-size: 25px;                
                        font-weight: bold;                
                        letter-spacing: 3.5px;            
                    }        
                </style>    
            </head>    
            <body>        
                <div class="card">            
                    <div class="title">Lycaria</div>            
                    <p style="text-align: center;">Oops! Tivemso um problema.</p>            
                    <p style="text-align: center;">Não conseguimos confirmar sua conta.</p>        
                </div>    
            </body>
        </html>`
        );
    }
    
    return res.send(`
    <html> 
        <head> 
            <meta name="viewport" content="width=device-width"> 
            <meta charset="utf-8"> <title>Confirmação de Conta - Lycaria</title> 
            <style> 
                body { 
                    font-family: Arial; 
                    padding: 0px; 
                    margin: 0px; 
                    background: #2a2a2a; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                } 
                .card{ 
                    background: #1f1f1f; 
                    box-shadow: 0px 0px 20px black; 
                    padding-top: 29px;
                    padding-bottom: 29px; 
                    padding-left: 25px; 
                    padding-right: 25px; 
                    max-width: 345px; 
                    color: white; 
                    font-size: 18px; 
                } 
                .title{ 
                    text-align: center; 
                    width: 100%; 
                    padding-top: 15px; 
                    padding-bottom: 15px; 
                    color: white; 
                    font-weight: bold; 
                    text-shadow: 0px 0px 20px black; 
                    font-size: 25px; 
                    font-weight: bold; 
                    letter-spacing: 3.5px; 
                } 
            </style> 
        </head> 
        <body> 
            <div class="card"> 
                <div class="title">Lycaria</div> 
                <p style="text-align: center;">Seja bem vindo(a), ${user_[0].firstName}</p> 
                <p style="text-align: center;">Você acabou de confirmar sua conta, agora você pode entrar e jogar!</p> 
            </div> 
        </body> 
    </html>`
    );
});

//////// Funções /recovery

// Pedir recuperação de senha.
express.post('/recovery/request', async(req,res)=>{
    // Guarda o email e gera um código de 6 digitos aleatório.
    var email_ = req.body.email;
    var code_ = generateCode(6);

    // Procura um usuário com o email fornecido.
    try {
        var user_ = await userData.find({email: email_});
        if (user_.length == 0) return res.status(400).send('Não existem contas com esse email.');
    } catch { return res.status(400).send('Não existem contas com esse email.') }

    // Verifica se o usuário já verificou sua conta.
    if (user_[0].checked == false) { return res.status(401).send('Conta não verificada.') }
    
    // Coloca o código em um token, e guarda o token no banco de dados.
    try {
        var decodedCode = jwt.sign({code: code_}, jwtCodeKey, {expiresIn: 1000*60*60}); // Código de recuperação que expira em uma hora.
        await userData.updateOne({_id: user_[0]._id}, {$set: {passCode: decodedCode}});
    } catch { return res.status(400).send('Erro ao tentar gerar código.') }

    // Envia o email.
    sendRecoveryMail(email_, code_);

    // Finalização.
    return res.status(200).send('Código enviado.');
});

// Confirmar e validar código enviado ao e-mail.
express.post('/recovery/confirm', async(req,res)=>{
    // Guardar informações em variaveis.
    var code_ = req.body.code;
    var email_ = req.body.email;
    var newPass_ = req.body.newPass;

    // Procurar email no banco de dados de usuário.
    try {
        var user_ = await userData.find({email: email_});
        if (user_.length == 0) return res.status(400).send('Não existem contas com esse email.');
    } catch { return res.status(400).send('Não existem contas com esse email.') }

    // Decodifica o código no banco de dados.
    try { var decodedPassCode = jwt.verify(user_[0].passCode, jwtCodeKey) } 
    catch { return res.status(400).send('Código inválido ou expirado.') }
    
    // Verifica se o código enviado é o mesmo do banco de dados.
    if (decodedPassCode.code != code_){ return res.status(400).send('Código incorreto.') }
    
    // Se a senha for especificada na requisição 
    if (newPass_ != undefined){
        // Criptografar nova senha
        var genSalt = await bcryptjs.genSalt();
        var decodedPass = await bcryptjs.hash(newPass_, genSalt);

        try { await userData.updateOne({_id: user_[0]._id}, {$set: {password: decodedPass}}) } 
        catch { return res.status(400).send('Houve um erro ao trocar sua senha.') }

        // Desconectar sessão se já estiver conectado
        var clients_ = await returnClientsFromLobby();
        if(clients_.length > 0){
            var l_ = clients_.find(el => {return (el._id).toString() == (user_[0]._id).toString()});
            if (l_ != undefined) l_.close(1008);
        }

        // Sucesso na redefinição
        return res.status(200).send('Senha redefinida com sucesso.');
    }

    // Finalização
    return res.status(200).send('Código validado.');
});

////////

//////// Checar versão do cliente
express.get('/checkVersion', (req, res)=>{
    var version = fs.readFileSync(__dirname+'/gameSource/clientVersion.lycaria').toString();
    return res.status(200).send(version);
});

// Erro 404
express.get('*', (req,res)=>{
    return res.status(200).send('404');
})

///////////////////////////////////////////////////////////////////

// Exportar módulo, para usar require();
module.exports = express;