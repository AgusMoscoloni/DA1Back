import app from "./app.js";
import { sequelize } from "./config/database.js";
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno al inicio

const PORT = process.env.PORT || 8080; // Usar puerto configurable

async function main() {
    try {
        // Intentar sincronizar la base de datos
        await sequelize.sync({ alter: false });
        
        // Iniciar la aplicación en el puerto especificado
        app.listen(PORT, () => {
            console.log(`API running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the application due to error:", error);
    }
}

main();
