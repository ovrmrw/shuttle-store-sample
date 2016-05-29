import 'babel-polyfill';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import levelup from 'levelup';
import { appRoot } from './utils.ref';

const LEVELDB_KEY = 'ovrmrw-leveldb-store';

const app = express();
app.set('views', appRoot + '/views');
app.set('view engine', 'jade');
app.use(express.static(appRoot)); // ExpressとElectronが両立する書き方。

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS on Express (http://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
  next();
});

app.get('/', (req, res) => {
  res.redirect('/views');
});

app.get('/views', (req, res) => {
  res.render('index', { title: 'ExpressApp' });
});

// LevelDBからデータを取得してクライアントに返す。JSON文字列が返る。
app.get('/leveldb', (req, res) => {
  (async function () {
    try {
      const db = levelup('./leveldb');
      const result = await new Promise((resolve, reject) => {
        db.get(LEVELDB_KEY, (err, value) => {
          resolve(value);
        });
      });
      db.close();
      res.json(result);
    } catch (err) {
      console.error(err);
    }
  })();
});

// クライアントから送られてきたbodyのデータを回収してLevelDBにJSON文字列として保存する。
app.post('/leveldb', (req, res) => {
  const states = JSON.stringify(req.body) as string;
  // console.log(states);
  if (states) {
    (async function () {
      try {
        const db = levelup('./leveldb');
        const ops = [
          { type: 'del', key: LEVELDB_KEY },
          { type: 'put', key: LEVELDB_KEY, value: states }
        ];
        const result = await new Promise((resolve, reject) => {
          // db.put(LEVELDB_KEY, states, (err) => {
          //   resolve('LevelDB put proccess is done.');
          // });
          db.batch(ops, (err) => {
            resolve('LevelDB put proccess is done.');
          });
        });
        db.close();
        res.json(result);
      } catch (err) {
        console.error(err);
        res.json(err);
      }
    })();
  }
});

const port = 3000;
const host = 'localhost';
app.listen(port, host);
console.log('Express server listening at http://%s:%s', host, port);
export {host, port}


//////////////////////////////////////////////////////////////////////
// LevelDBを初期化する。これをしておかないとdb.get()でエラーになる。
levelup('./leveldb', (err, db) => {
  db.get(LEVELDB_KEY, (err, value) => {
    if (err && err.notFound) {
      db.put(LEVELDB_KEY, JSON.stringify([]), (err) => {
        db.get(LEVELDB_KEY, (err, value) => {
          console.log('LevelDB Data: ' + value);
          db.close();
        });
      });
    }
    console.log('LevelDB Data: ' + value);
    db.close();
  });
});