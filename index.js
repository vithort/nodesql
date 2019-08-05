/*
Tutorial Node.js com MS SQL Server
https://www.luiztools.com.br/post/tutorial-node-js-com-ms-sql-server/
*/

const express = require('express');
const app = express();         
const bodyParser = require('body-parser');
const port = 3000; //porta padrão
const sql = require('mssql');
const connStr = "Server=X.X.X.X;Database=XXX;User Id=XX;Password=XX;";

//fazendo a conexão global
sql.connect(connStr)
   .then(conn => global.conn = conn)
   .catch(err => console.log(err));

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);


//inicia o servidor
app.listen(port);
console.log('API funcionando!');

function execSQLQuery(sqlQry, res){
    GLOBAL.conn.request()
               .query(sqlQry)
               .then(result => res.json(result.recordset))
               .catch(err => res.json(err));
}
//


//Parte 4: Criando a listagem de clientes
router.get('/clientes', (req, res) =>{
    execSQLQuery('SELECT * FROM Clientes', res);
})


//Parte 5: Criando a pesquisa de um cliente
router.get('/clientes/:id?', (req, res) =>{
    let filter = '';
    if(req.params.id) filter = ' WHERE ID=' + parseInt(req.params.id);
    execSQLQuery('SELECT * FROM Clientes' + filter, res);
})


//Parte 6: Excluindo um cliente
router.delete('/clientes/:id', (req, res) =>{
    execSQLQuery('DELETE Clientes WHERE ID=' + parseInt(req.params.id), res);
})
//> curl -X DELETE http://localhost:3000/clientes/1


//Parte 7: Adicionando um cliente
router.post('/clientes', (req, res) =>{
    const id = parseInt(req.body.id);
    const nome = req.body.nome.substring(0,150);
    const cpf = req.body.cpf.substring(0,11);
    execSQLQuery(`INSERT INTO Clientes(ID, Nome, CPF) VALUES(${id},'${nome}','${cpf}')`, res);
})
//> curl -X POST -d "id=1&nome=luiz&cpf=12345678901" http://localhost:3000/clientes


//Parte 8: Atualizando um cliente
router.patch('/clientes/:id', (req, res) =>{
    const id = parseInt(req.params.id);
    const nome = req.body.nome.substring(0,150);
    const cpf = req.body.cpf.substring(0,11);
    execSQLQuery(`UPDATE Clientes SET Nome='${nome}', CPF='${cpf}' WHERE ID=${id}`, res);
})
//> cURL -X PATCH -d "nome=fernando&cpf=12345678901" http://localhost:3000/clientes/4


//Bônus 1: Executando muitas operações SQL
function execute(items, i, conn){
    if(!items[i]) return console.log("terminou");

    conn.request()
        .query(`DELETE Usuario WHERE email='${items[i]}'`)
        .then(result => {
            console.log(result)
            execute(items, ++i, conn)//faz o próximo
        })
        .catch(err => console.log(err));
}

