import express from 'express';
import { routes, __dirname } from './app/routes/routes.js';

const port = 3000;

const server = express();

server.use('/static', express.static( __dirname + '/src'));
server.use('/static', express.static( __dirname + '/app/public'));
server.use(express.json()) 

server.use(routes);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});