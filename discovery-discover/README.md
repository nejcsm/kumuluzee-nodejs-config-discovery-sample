# KumuluzEE Node.js Config and Discovery — discover service
The objective of this sample is to show how to discover service, registered with Consul and etcd using KumuluzEE Node.js Discovery library.

## Requirements

Node version >= 8.0.0
```
$ node --version
```
Note: if you are running service on Debian operating system, you will need to install `nodejs-legacy`:

```
$ sudo apt-get install nodejs-legacy
```


## Prerequisites



**Running Consul**

First you should check if you have installed Consul, by typing following command:
```
$ consul version
```

Note that such setup with Consul running in development mode is not viable for production environments, but only for developing purposes. Here is an example on how to quickly run a local Consul agent in development mode:
```
 $ consul agent -dev -ui
```

**Running etcd**

Note that such setup with only one etcd node is not viable for production environments, but only for developing purposes. Here is an example on how to quickly run an etcd instance with docker:
```
 $ docker run -d -p 2379:2379 \
     --name etcd \
     --volume=/tmp/etcd-data:/etcd-data \
     quay.io/coreos/etcd:latest \
     /usr/local/bin/etcd \
     --name my-etcd-1 \
     --data-dir /etcd-data \
     --listen-client-urls http://0.0.0.0:2379 \
     --advertise-client-urls http://0.0.0.0:2379 \
     --listen-peer-urls http://0.0.0.0:2380 \
     --initial-advertise-peer-urls http://0.0.0.0:2380 \
     --initial-cluster my-etcd-1=http://0.0.0.0:2380 \
     --initial-cluster-token my-etcd-token \
     --initial-cluster-state new \
     --auto-compaction-retention 1 \
     -cors="*"
```


You will also need a registered service instance. You can use the [discovery-register](http://github.com/nejcsm/kumuluzee-nodejs-discovery-sample/discovery-register) sample.

## Tutorial

This tutorial will guide you through the steps required to create a service, which uses KumuluzEE Discovery extension. We will develop a simple REST service with the following resources:

*   GET  [http://localhost:8080/v1/discover/url](http://localhost:8080/v1/discover/url)  \- discovered service's url,
*   GET  [http://localhost:8080/v1/discover](http://localhost:8080/v1/discover)  \- list of all customers from discovered service + discovered service's url,
*   POST  [http://localhost:8080/v1/discover](http://localhost:8080/v1/discover)  \- add a customer to discovered service,
*   GET  [http://localhost:8080/v1/programmatic/{serviceName}/{serviceVersion}/{environment}](http://localhost:8080/v1/programmatic/%7BserviceName%7D/%7BserviceVersion%7D/%7Benvironment%7D)  \- discovered service's url.

First install dependencies using npm:

```
$ npm install
```
### Implement the service

Before making first service discovery you have to `initialize` KumuluzeeDiscovery client in order to connect to desired extension. After that you can discover service using `discoverService` function.

```javascript
const router = express.Router();

// ...

let targetUrl = null;

const discoverServiceProperties = {
  value: 'customer-service',
  version: '1.0.x',
  environment: 'dev',
  accessType: 'GATEWAY',
};

const initalLookup = async () => {
  await KumuluzeeDiscovery.initialize({ extension: process.env.EXTENSION }); // 'consul or 'etcd'

  targetUrl = await KumuluzeeDiscovery.discoverService(discoverServiceProperties);
}

initalLookup();

// Get and save discovered service url
router.get('/url', async (req, res) => {
  targetUrl = await KumuluzeeDiscovery.discoverService(discoverServiceProperties);

  res.status(200).json(targetUrl);
});

// Get proxied customers
router.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(`${targetUrl}/v1/customers`);

    res.status(200).json(data);
  } catch (err) {
    res.status(404).json();
  }
});

// Add new customer
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
```
In the example above, we save discovered service when the service is created.
KumuluzEE Node.js Discovery extension uses NPM-like versioning, so by specifying version `'1.0.x'`, we always get the latest patch of 1.0.x version microservice, registered with discovery source.

You can also use programmatic service discovery using `DiscoveryUtil`.

```javascript
import { DiscoveryUtil } from 'kumuluzee-nodejs-discovery';

const router = express.Router();

// ...

router.get('/:serviceName/:serviceVersion/:environment', async (req, res) => {
  const { serviceName, serviceVersion, environment} = req.params;

  const instances = await DiscoveryUtil.getServiceInstances(serviceName, serviceVersion, environment);
  
  res.status(200).json(instances);
});

export default router;
```
In the example above, we use path parameters to discover the desired registered instance by calling `getInstances(serviceName, serviceVersion, environment)`.

Note: If you only use programmatic access to discovery source then you first have to connect to desired extension using `DiscoveryUtil.initialize({ extension }` function.

Finally we include our routers and setup service.

```javascript
import express from 'express';
import discoverRoute from './src/discoverRoute';
import programmaticRoute from './src/programmaticRoute';

const server = express();

server.use('/v1/discover', discoverRoute);
server.use('/v1/programmatic', programmaticRoute);

server.all('*', (req, res) => {
  res.status(404).json({
    message: 'This route does not exist!',
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.info(`Server is listening on port ${process.env.PORT || 8080}`);
});

```

### Add required configuration for the service discovery

You can add configuration using any KumuluzEE configuration source.

For example, you can use config.yml file:

```yaml
kumuluzee:
  discovery:
    etcd:
      hosts: http://localhost:2379
```
Note: when connecting to Consul, property `kumuluzee.config.etcd.hosts` is ignored, meaning  that for this simple example, config.yml is not needed.


### Run microservice

Before you run the sample you should set environmental variables `EXTENSION` and `PORT`:
* EXTENSION: sets configuration source, possible values: `consul` and `etcd`,
* PORT: sets the value of server port, default `8080`.

In the end simply run this command to start microservice:
```
$ npm run start
```
