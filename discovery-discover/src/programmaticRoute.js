import express from 'express';
import bodyParser from 'body-parser';
import { DiscoveryUtil } from 'kumuluzee-nodejs-discovery';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/:serviceName/:serviceVersion/:environment', async (req, res) => {
  const { serviceName, serviceVersion, environment} = req.params;

  const instances = await DiscoveryUtil.getServiceInstances(serviceName, serviceVersion, environment);
  
  res.status(200).json(instances);
});

export default router;


