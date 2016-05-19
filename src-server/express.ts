import lodash from 'lodash';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { appRoot } from './utils.ref';

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

const port = 3000;
const host = 'localhost';
app.listen(port, host);
console.log('Express server listening at http://%s:%s', host, port);
export {host, port}
