const mongoose = require("mongoose");
const Joi = require("joi")

const planeSchema = new mongoose.Schema({
    name: String,
    manufacturer:String,
    info: String,
    year: Number,
    category: String,
    img_url: String,
    date_created: {
        type: Date,
        default: Date.now()
    },
    user_id:String,
})

exports.PlaneModel = mongoose.model("planes", planeSchema);

exports.validatePlane = (_reqBody) =>{
    let year = new Date().getFullYear()
    let schemaJoi = Joi.object({
        name: Joi.string().min(2).max(25).required(),
        manufacturer: Joi.string().min(2).max(50).required(),
        info: Joi.string().min(5).max(1000).required(),
        year: Joi.number().min(1903).max(year).required(),
        category: Joi.string().min(1).max(50).required(),
        img_url: Joi.string().allow(null, "").max(500)
    })
    return schemaJoi.validate(_reqBody);
}