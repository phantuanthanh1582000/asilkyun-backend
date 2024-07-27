const express = require('express')
const routes = require('./routes/api')
const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'asilkyun.yaml');
const yaml = require('yaml');
const file = fs.readFileSync(filePath, 'utf8')
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = yaml.parse(file)
const cors = require('cors');



const app = express()
const port = 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//     console.log(req.body);
//     next();
//   });

app.use('/api', routes)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})