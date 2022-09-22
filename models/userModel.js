const mongoose = require('mongoose');
const Joi = require('joi')
const jwt = require("jsonwebtoken");
const { config } = require('../config/config');

const userSchema = new mongoose.Schema({
    fullName: {
        firstName: String,
        lastName: String
    },
    email: String,
    password: String,
    date_created: {
        type: Date,
        default: Date.now()
    }, 
    role:{
        type:String,
        default: "user"
    }
})

exports.UserModel = mongoose.model('users', userSchema);

exports.createToken = (_id, role) =>{
    let token = jwt.sign({_id,role}, config.tokenSecret,{expiresIn:"60mins"})
    return token;
}

exports.validateUser = (bodyData) => {
    let joiSchema = Joi.object({
        fullName: {
            firstName: Joi.string().required().min(2).max(20),
            lastName: Joi.string().required().min(2).max(20)
        },
        email: Joi.string().required().email(),
        password: Joi.string().required().min(3).max(20),
    })

    return joiSchema.validate(bodyData)
}
exports.validateLoginUser = (bodyData) => {
    let joiSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(3).max(20)
    })

    return joiSchema.validate(bodyData)
}