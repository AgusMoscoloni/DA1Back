import https from "https";
import fs from "fs";
import app from "./app.js";
import { sequelize } from "./config/database.js";
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno al inicio

const PORT = process.env.PORT || 8080; // Puerto HTTPS configurable

// Configuración de SSL
const sslOptions = {
    key: fs.readFileSync("./src/key.pem"), // Ruta a tu clave privada
    cert: fs.readFileSync("./src/cert.pem"), // Ruta a tu certificado público
};

async function main() {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");

        // Sincronizar modelos con la base de datos
        await sequelize.sync({ alter: false });
        console.log("Database models synchronized.");

        // Crear el servidor HTTPS
        https.createServer(sslOptions, app).listen(PORT, () => {
            console.log(`HTTPS API running on https://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the application due to error:", error);
    }
}

// Manejar señales del sistema para cerrar conexiones ordenadamente
process.on("SIGINT", async () => {
    console.log("Closing application...");
    await sequelize.close();
    console.log("Database connection closed.");
    process.exit(0);
});

main();
