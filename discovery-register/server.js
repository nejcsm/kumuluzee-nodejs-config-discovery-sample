import express from 'express';
import KumuluzeeDiscovery from 'kumuluzee-nodejs-discovery';

import { restConfig } from './config';
import customerRoute from './src/customerRoute';

const server = express();

const register = async () => {
  await KumuluzeeDiscovery.initialize({ extension: process.env.EXTENSION });

  KumuluzeeDiscovery.registerService();
}

register()

server.use('/v1/customers', customerRoute);

server.get('/v1/config', (req, res) => {
  res.status(200).json(restConfig);
});

server.all('*', (req, res) => {
  res.status(404).json({
    message: 'This route does not exist!',
  });
});

server.listen(process.env.PORT || 8081, () => {
  console.info(`Server is listening on port ${process.env.PORT || 8081}`);
});
