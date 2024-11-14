export const sendSuccessResponse = ({ res, data, message = 'Request successful', statusCode = 200 }) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data
    });
};

export const sendErrorResponse = ({ res, error = "", message = 'An error occurred', statusCode = 500 }) => {
    console.error(error);
    return res.status(statusCode).json({
        status: 'error',
        message,
        error: error.message || error
    });
};