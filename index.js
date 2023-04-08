const express = require('express'); // express 모듈을 불러옵니다.
const mysql = require('mysql2'); // mysql 모듈을 불러옵니다.
const path = require('path'); // path 모듈을 불러옵니다.
const static = require('serve-static'); // static 모듈을 불러옵니다.
const dbconfig = require('./config/dbconfig.json'); // db정보가 적혀있는 dbconfig.json를 불러옵니다.

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
});

const app = express(); // express 객체를 생성합니다.

app.use(express.urlencoded({ extended : true }));

app.use(express.json()); // json 형식으로 받습니다.

app.use('/', static(path.join(__dirname, '/'))); // index.html을 static으로 지정합니다.

app.use('/public', static(path.join(__dirname, 'public'))); // public 폴더를 static으로 지정합니다.

app.post('/process/adduser', (req, res) => {
    console.log(req + '요청이 들어왔습니다.');
    const paramStudentNumber = req.body.student_number;
    const paramName = req.body.name;
    const paramEmail = req.body.email;
    const paramPassword = req.body.password;

    pool.getConnection((err, conn) => {
        if(err) {
            console.log('MySQL Connection Error');
            console.dir(err);
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            res.write('<h1>SQL 서버연결 실패</h1>');
            res.end();
            return;
        }

        console.log('DB Connection Success');

        const exec = conn.query('INSERT INTO students VALUES (?, ?, ?, ?)',
                            [paramStudentNumber, paramName, paramEmail, paramPassword],
            (err, rows) => {
                console.log(exec.sql); // 쿼리문 확인
                if(err) {
                    conn.release();
                    console.log('MySQL Query Error');
                    console.dir(err);
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                    res.write('<h1>SQL쿼리 실행실패</h1>');
                    res.end();
                    return;
                }

                if(rows) {
                    console.dir(rows);
                    console.log('Inserted');
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                    res.write('<h1>사용자 추가 성공</h1>');
                    res.end();
                } else {
                    console.log('Inserted Failed');
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                    res.write('<h1>사용자 추가 실패</h1>');
                    res.end();
                }
            });

    });

}); // /process/adduser 경로로 post 요청이 들어오면'

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});