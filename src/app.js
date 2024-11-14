import express from "express";
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

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api',userRoutes)
app.use('/api',postRoutes)

export default app;
