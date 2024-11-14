import Joi from 'joi';

const userSchema = Joi.object({
    id: Joi.string()
        .guid({ version: 'uuidv4' })
        .optional(),

    name: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.empty': 'Name is required.',
        }),

    surname: Joi.string()
        .min(1)
        .required()
        .messages({
            'string.empty': 'Surname is required.',
        }),

    username: Joi.string()
        .optional(),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Email must be valid.',
            'string.empty': 'Email is required.',
        }),

    password: Joi.string()
        .min(8)
        .pattern(/[A-Z]/, 'uppercase letter')
        .pattern(/[!@#$%^&*(),.?":{}|<>]/, 'special character')
        .required()
        .messages({
            'string.min': 'Password should be at least 8 characters.',
            'string.pattern.name': 'Password should contain at least one {#name}.',
            'string.empty': 'Please provide a password.',
        }),

    profile_pic: Joi.string()
        .uri()
        .required()
        .messages({
            'string.empty': 'Profile picture URL is required.',
            'string.uri': 'Profile picture must be a valid URL.',
        }).optional(),
    bannerImage: Joi.string()
        .uri()
        .required()
        .messages({
            'string.empty': 'bannerImage is required.',
            'string.uri': 'bannerImage must be a valid URL.',
        }).optional(),

    gender: Joi.string()
        .valid('M', 'F', 'X', '-')
        .required()
        .messages({
            'any.only': 'Gender must be one of M, F, X, or -.',
            'string.empty': 'Gender is required.',
        }),

    descriptionProfile: Joi.string()
        .optional(),

    commentCounts: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({
            'number.base': 'Comment count must be a number.',
            'number.integer': 'Comment count must be an integer.',
            'number.min': 'Comment count cannot be negative.',
    }).optional(),

    followersCounts: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({
            'number.base': 'Followers count must be a number.',
            'number.integer': 'Followers count must be an integer.',
            'number.min': 'Followers count cannot be negative.',
        }).optional(),

    followingCounts: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({
            'number.base': 'Following count must be a number.',
            'number.integer': 'Following count must be an integer.',
            'number.min': 'Following count cannot be negative.',
        }).optional()
});

export default userSchema;
