import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userSchema from '../validator/user.validator.js'; // Importa el esquema Joi que creamos
import {User} from '../models/index.js'; // Importa el modelo de usuario
import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';
import { sendRecoveryEmail } from "../utils/email.utils.js";

// Controlador de registro
const SignUp = async (req, res) => {
    // Validación de los datos de entrada con Joi
    const { error } = userSchema.validate(req.body);
    if (error) {
        return sendErrorResponse({ res, error: error.details[0].message, message: 'Invalid input data' });
    }

    const { name, surname, username, email, password, profile_pic, bannerImage,gender, descriptionProfile } = req.body;

    try {
        // Verificar si el correo ya está registrado
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return sendErrorResponse({ res, message: 'Email already registered' , statusCode: 400 });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const user = await User.create({
            name,
            surname,
            username,
            email,
            profile_pic: `https://api.dicebear.com/8.x/initials/svg?radius=50&seed=${name[0] + surname[0]}`,
            password: hashedPassword,
            gender,
            descriptionProfile
        });

        return sendSuccessResponse({ res, data: { user: {name: user.name,surname: user.surname, email: user.email, profile_pic: user.profile_pic, bannerImage: user.bannerImage, gender: user.gender, descriptionProfile: user.descriptionProfile}, refreshToken } });
    } catch (err) {
        console.error(err);
        return sendErrorResponse({ res, error: err.message, message: 'Error registering user' });
    }
};

// Función para generar tokens JWT
const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '9h' });
};

// Controlador de inicio de sesión (login)
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación de datos de entrada
        if(!email || !password) return sendErrorResponse({ res, message: 'Todos los campos son requeridos', statusCode: 400 });

        // Verificar si el usuario existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return sendErrorResponse({ res, message: 'User not found', statusCode: 400 });
        }

        // Comparar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendErrorResponse({ res, message: 'Incorrect password', statusCode: 400 });
        }

        // Generar el access token y el refresh token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Almacenar el refresh token en la base de datos o enviar como respuesta
        await user.update({ refreshToken });
        const userResponse = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email,
            profile_pic: user.profile_pic,
            bannerImage: user.bannerImage,
            gender: user.gender,
            descriptionProfile: user.descriptionProfile,
        };
        sendSuccessResponse({ 
            res, 
            data: { accessToken, refreshToken, user:userResponse }, 
            message: 'Login successful' 
        });
    } catch (err) {
        sendErrorResponse({ res, error: err, message: 'Server error' });
    }
};

const generateRecoveryCode = () => Math.floor(100000 + Math.random() * 900000);
// Controlador para forgot password
const forgotPassword = async (req, res) => {
    const { email, username } = req.body;

    if (!email && !username) {
        return sendErrorResponse({ res, message: 'Todos los campos son requeridos', statusCode: 400 });
    }
    let filter = {};
    if (email) {
        filter = { email };
    } else if (username) {
        filter = { username };
    }
    try {
        // Buscar al usuario por email
        const user = await User.findOne({ where: filter });

        if (!user) {
            return sendErrorResponse({ res, message: 'No se encontró ningún usuario con esos datos', statusCode: 404 });
        }

        // Generar y almacenar el código de recuperación
        const recoveryCode = generateRecoveryCode();
        user.recoveryCode = recoveryCode;
        await user.save();

        // Enviar el correo con el código de recuperación
        await sendRecoveryEmail(email, recoveryCode);

       return sendSuccessResponse({ res, message: 'Se envió un correo de recuperación con el código de recuperación' });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        return sendErrorResponse({ res, error, message: 'Error al enviar el correo de recuperación' });
    }
};

// Controlador para reset password
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return sendErrorResponse({ res, message: 'Todos los campos son requeridos', statusCode: 400 });
    }

    try {
        // Buscar al usuario y verificar el código de recuperación
        const user = await User.findOne({ where: { email, recoveryCode: code } });

        if (!user) {
            return sendErrorResponse({ res, message: 'No se encontró ningún usuario con esos datos', statusCode: 404 });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña y limpiar el código de recuperación
        user.password = hashedPassword;
        user.recoveryCode = null;
        await user.save();

        return sendSuccessResponse({ res, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        return sendErrorResponse({ res, error, message: 'Error al actualizar la contraseña' });
    }
};

const refreshToken = async (req, res) => {
    const { userId } = req.user;

    if (!userId) {
        return sendErrorResponse({ res, message: 'No se encontró ningún usuario con esos datos', statusCode: 404 });
    }

    try {
        const accessToken = generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);
        return sendSuccessResponse({ res, data: { token: {accessToken, refreshToken }}, message: 'Refresh token refreshed successfully' });
    } catch (err) {
        console.error('Invalid Refresh Token:', err);
        return sendErrorResponse({ res, message: 'Invalid or expired refresh token', statusCode: 403 });
    }
};

export default { SignUp, Login, resetPassword, forgotPassword, refreshToken };