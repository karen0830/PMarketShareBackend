import app from '../src/app.js';
import connectFirebase from './firebase.js';
import connectDB from './db.js';
import { connectDBMysql } from './dbMysql.js';
connectDBMysql();
connectDB();
connectFirebase()

const port = 4000;
app.listen(port, () => {
  console.log("Servidor en el puerto", port);
});

