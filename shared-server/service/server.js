'use strict';

const express = require('express');
var AppServer = require('../appServer/AppServer');

// Constants
const PORT = process.env.PORT;

// App
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World..!');
});

app.use('/api/servers', AppServer);

app.listen(PORT, () =>{
  console.log(`App running on port ${PORT}`);
});
        
