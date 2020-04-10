const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.all('/*', function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    //res.header('Access-Control-Allow-Headers','X-Requested-With');
    next();
});

const datasource = fs.readFileSync('./database.json');
const conf = JSON.parse(datasource);
const mysql = require('mysql');

const multer = require('multer');
const upload = multer({dest: './upload'});

app.use('/image', express.static('./upload'));

const conn = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.pwd,
    port: conf.port,
    database: conf.database
});

conn.connect();

app.get('/api/customers', (req, res) => {
    sleep(2000);
    console.log('customers called');
    conn.query(
        "SELECT * FROM CUSTOMER where isDeleted != 'Y'",
        (err, rows, fields) => {
            /*console.log('err:' + err);
            console.log('rows:' + rows);
            console.log('fields:' + fields);*/
            res.send(rows)
        }
    )
});

app.post('/api/customers', upload.single('image'), (req, res) => {
    let sql = "INSERT INTO CUSTOMER VALUES (null, ?, ?, ?, ?, ?, now(), 'N')";
    let image = '/image/' + req.file.filename;
    let name = req.body.name;
    let birthday = req.body.birthday;
    let gender = req.body.gender;
    let job = req.body.job;
    let params = [image, name, birthday, gender, job];

    conn.query(sql, params, (err, rows, fields) => {
        res.send(rows);
    })
});

app.delete('/api/customers/:id', (req, res) => {
    console.log('customers delete called id=[' + req.params.id + ']');
    let sql = "update CUSTOMER set isDeleted = 'Y' where id = ?";
    let params = [req.params.id];
    conn.query(sql, params, (err, rows, fields) => {
        res.send(rows);
    })
});

app.get('/api/hello', (req, res) => {
    res.send({message: 'Hello Express!'});
});

app.listen(port, () => console.log(`Listening on port ${port}`));

function sleep (delay) {
    let start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}