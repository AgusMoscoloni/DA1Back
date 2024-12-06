import express from "express";
import https from "https";
import fs from "fs";
import morgan from "morgan";
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
app.use(express.json({ limit: '10mb' })); // Ajusta el límite según tus necesidades
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware para agregar headers CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // o especifica el dominio del front-end
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middlewares
app.use(morgan("dev"));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'ok' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);

// Cargar el certificado SSL
const sslOptions = {
    key: fs.readFileSync('./key.pem'), // Ruta a tu clave privada
    cert: fs.readFileSync('./cert.pem') // Ruta a tu certificado
};

// Crear el servidor HTTPS
const PORT = 443; // Puerto HTTPS (por defecto)
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});

// Opcional: Servidor HTTP para redirigir a HTTPS
const http = express();
http.get('*', (req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
});
http.listen(80, () => {
    console.log("Redirección HTTP -> HTTPS activa en el puerto 80");
});
