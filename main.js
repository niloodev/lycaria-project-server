/////////////////////////////////////////////////////////////////// Módulos

// Servidor HTTP
const http = require('http'); 
const https = require('https');
const fs = require('fs');

// Express APP.
const express = require('express'); 

// Cors para controlar acesso. 
const cors = require('cors'); 

// Banco de dados NoSQL.
const mongoose = require('mongoose'); 

// Colyseus, manuseio de partida.
const colyseus = require('colyseus'); 
const monitor = require("@colyseus/monitor").monitor; 

// Função para carregar diversos scripts.
const requireDir = require('require-dir');

// Converter Req.Body para JSON. 
const bodyParser = require('body-parser'); 

// Chave de acesso para requests.
const accessKey = 'aXmsaKsoaPw9192_CClsoKWmLx,lSkWPeo´qpLSOjpOMXpoaJspoJXpasmOPWempaSOdmPSOd__dsapiPWO())';

// Propriedades do manuseio de partida.
const matchMaker = colyseus.matchMaker;

///////////////////////////////////////////////////////////////////

// Iniciar APP.
const app = express(); 

// Porta
const port = 21238;

// Conectar ao NoSql
const mongooseHost = 'lowmanadatabase-7ki9x.gcp.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect('mongodb+srv://lowdev:a4d62af8@'+mongooseHost, {useUnifiedTopology: true, useNewUrlParser: true}, (err, db)=>{
  if(!err) console.log('Conectado ao Banco de Dados...');
  else console.log('Ocorreu um erro na conexão ao Banco de Dados.');
}); 
requireDir('./source/schemes'); // Importar 'Schemas'.

// Middlewares.
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use("/colyseus", monitor());
app.use((req, res, next)=>{
  if(req.method != 'GET'){
    var header_ = req.body.accessKey;
    if (header_ != accessKey){
      return res.status(400).send('N/A');
    } else next();
  } else {
    next();
  }
});
app.use("/user", require('./source/_userRequests'));
app.use("/source/gameSource", express.static('source/gameSource'));

// Criar Servidor HTTP.
//const server = http.createServer(app);
const server = https.createServer({
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
}, app);

// Criar Servidor inGame.
const gameServer = new colyseus.Server({ 
    server: server,
    pingMaxRetries: 5,
    pingInterval: 7000,
});

/////////////////////////////////////////////////////////////////// Definir salas do servidor do jogo.

// Definindo GameLobby
gameServer.define('GameLobby', require('./source/_gameLobbyModel').GameRoom);
gameServer.define('GameMatch', require('./source/gameData/_matchRoom'));
gameServer.define('Game', require('./source/gameData/_gameRoom'));
matchMaker.createRoom('GameLobby');

// Finalizar
gameServer.listen(port);
console.log(`Servidor 'inGame' ouvindo na porta: ${port}.`);
