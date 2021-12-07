const joi = require('@hapi/joi');

const scheme = {
    validateLogin: joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    }),
    validateRegister: joi.object({
        firstName: joi.string().regex(/[a-zA-Z]+/).required(),
        lastName: joi.string().regex(/[a-zA-Z]+/).required(),
        nickName: joi.string().min(3).max(13).regex(/[a-zA-Z]+/).required(),
        email: joi.string().email().required(),
        password: joi.string().min(3).required()
    }),
}

module.exports = scheme;