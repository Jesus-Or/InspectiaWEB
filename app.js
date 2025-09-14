const express = require('express');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const session = require('express-session');
const mysql = require('mysql');
const path = require('path');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Variables de entorno
dotenv.config({ path: './env/.env' });

// Archivos estáticos
app.use('/resources', express.static('public'));
app.use('/resources', express.static(path.join(__dirname, 'public')));

// Motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sesiones
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true
}));

// Middleware para compartir usuario en todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// 👉 Middleware para proteger rutas
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Conexión a base de datos con pool
const conexion = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Probar conexión
conexion.getConnection((error, connection) => {
    if (error) {
        console.log('Error al conectar BD:', error);
    } else {
        console.log("Conexión exitosa a la BD");
        connection.release();
    }
});

// ==================== RUTAS ==================== //

// Páginas públicas
app.get('/', (req, res) => res.render('home'));
app.get('/index', (req, res) => res.render('index'));
app.get('/productos', (req, res) => res.render('productos'));
app.get('/login', (req, res) => res.render('login'));
//app.get('/register', (req, res) => res.render('register')); // ✅ nueva ruta GET

// Ruta protegida
app.get('/empresa', isLoggedIn, (req, res) => {
    res.render('empresa', { user: req.session.user });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Procesar registro
app.post('/register', (req, res) => {
    const { nombre, email, contrasenia, confirmarPassword } = req.body;

    if (contrasenia !== confirmarPassword) {
        return res.send('Las contraseñas no coinciden');
    }

    const passwordHash = bcryptjs.hashSync(contrasenia, 8);

    conexion.query(
        'INSERT INTO usuarios SET ?',
        { nombre, email, password: passwordHash },
        (error) => {
            if (error) {
                console.log(error);
                res.send('Error al registrar el usuario');
            } else {
                res.redirect('/login'); // ✅ corregido
            }
        }
    );
});

// Procesar login
app.post('/login', (req, res) => {
    const { correo, contrasenia } = req.body;

    if (!correo || !contrasenia) {
        return res.send('Debes ingresar correo y contraseña');
    }

    conexion.query('SELECT * FROM usuarios WHERE email = ?', [correo], async (error, results) => {
        if (error) {
            console.log(error);
            return res.send('Error al consultar el usuario');
        }

        if (results.length === 0) {
            return res.send('Usuario no encontrado');
        }

        const validPassword = await bcryptjs.compare(contrasenia, results[0].password);

        if (!validPassword) {
            return res.send('Usuario o contraseña incorrectos');
        }

        req.session.user = results[0];
        return res.redirect('/empresa');
    });
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = conexion;
