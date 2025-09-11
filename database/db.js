const mysql = require('mysql');
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    root: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

const conexion =require ('./database/db')
conexion.connect(error => {
    if (error) {
        console.log(`Error al Conectar la base de datos ${error}`);

        return;

    }
    console.log("Conexión exitosa")



});

module.exports = conexion;