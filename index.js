const express = require('express');
var student = require('./routes/student.js');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors({ origin: true }));

app.use('/students', student);

const port = 5000;

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
});

module.exports = app