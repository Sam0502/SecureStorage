const express = require('express');
const cors = require('cors');
const request = require('request');

const app = express();
app.use(cors());

app.post('/api/v0/add', (req, res) => {
    req.pipe(request('http://localhost:5001/api/v0/add')).pipe(res);
});

app.listen(3000, () => console.log('Proxy running on http://localhost:3000'));