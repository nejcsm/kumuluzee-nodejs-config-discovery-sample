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
