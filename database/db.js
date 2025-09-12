import mysql from 'mysql2/promise';

const conexion = mysql.createPool({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  port:process.env.DB_PORT || 3306
});

export default conexion;

const conexion =require ('./database/db')
conexion.connect(error => {
    if (error) {
        console.log(`Error al Conectar la base de datos ${error}`);

        return;

    }
    console.log("Conexión exitosa")



});

module.exports = conexion;