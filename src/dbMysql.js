import mysql from "mysql2";
import path, { dirname, join } from "path";
import fs from 'fs';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const caCertPath = join(__dirname, 'ssl', 'DigiCertGlobalRootCA.crt.pem');
// const connection = mysql.createConnection({
//     host: 'mydatamysql.mysql.database.azure.com',
//     user: 'rooter',
//     password: '#K12345678',
//     port: 3306,
//     database: 'MarketShare',
//     ssl: {
//         ca: fs.readFileSync(caCertPath)
//     }
// });


// const connection = mysql.createConnection({
//     host: 'bkotinfuaeft3kozxpjy-mysql.services.clever-cloud.com',
//     user: 'uwzl1jw2ikcl4cvn',
//     password: 'oTDqfYQYi0PCIkKTWvUi',
//     database: 'bkotinfuaeft3kozxpjy'
// });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'MarketShare'
});


// Establecer la conexión
// Establecer la conexión
export const connectDBMysql= () => {
    connection.connect((err) => {
        if (err) {
            console.error('Error de conexión:', err);
            return;
        }
        // connection.query('USE Marketshare', function(err) {
        //     if (err) throw err;
            console.log('Conexión establecida y base de datos seleccionada');
        // });
    });
}


// Intenta conectar al inicio
connectDBMysql();

// Ejecutar consultas u operaciones en la base de datos aquí
export default connection;

// Cerrar la conexión cuando hayas terminado
// connection.end();
