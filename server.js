import express from 'express';
import path from 'path';
import { routes } from './app/routes/routes.js';

const __dirname = path.resolve(path.dirname(''));
const port = 3000;

const server = express();

server.use('/static', express.static( __dirname + '/src'));
server.use('/static', express.static( __dirname + '/app/public'));
server.use(express.json()) 

server.use(routes);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});