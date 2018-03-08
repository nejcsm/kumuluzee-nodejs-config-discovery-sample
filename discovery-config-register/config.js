import ConfigBundle from 'kumuluzee-nodejs-config';

const restConfig = new ConfigBundle({
  prefixKey: 'rest-config',
  type: 'object',
  fields: {
    stringProperty: {
      type: 'string',
      watch: true,
    },
    integerProperty: {
      type: 'number',
    },
    booleanProperty: {
      type: 'boolean',
    }
  }
});

restConfig.initialize({ extension: process.env.EXTENSION });

export { restConfig };



