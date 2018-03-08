import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import KumuluzeeDiscovery from 'kumuluzee-nodejs-discovery';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

let targetUrl = null;

const discoverServiceProperties = {
  value: 'customer-service',
  version: '1.0.x',
  environment: 'dev',
  accessType: 'GATEWAY',
};

const initalLookup = async () => {
  await KumuluzeeDiscovery.initialize({ extension: process.env.EXTENSION });

  targetUrl = await KumuluzeeDiscovery.discoverService(discoverServiceProperties);
}

initalLookup();

router.get('/url', async (req, res) => {
  targetUrl = await KumuluzeeDiscovery.discoverService(discoverServiceProperties);

  res.status(200).json(targetUrl);
});

router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(`${targetUrl}v1/customers`);

    res.status(200).json(data);
  } catch (err) {
    res.status(404).json();
  }
});

router.post('/', async (req, res) => {
  if(req.body) {
    const { id, firstName, lastName } = req.body;
    try {
      const resp = await axios.post(`${targetUrl}/v1/customers`, { id, firstName, lastName });

      res.status(200).json();
    } catch (err) {
      res.status(404).json();
    }
  }
});

export default router;
