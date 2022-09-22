const express = require("express");
const { UserModel, validateUser, validateLoginUser, createToken } = require("../models/userModel");
const {auth, authAdmin} = require("../middleware/auth")
const router = express.Router();
const bycrpt = require('bcrypt')


router.get("/userList",authAdmin, async (req, res) => {
    let perPage = Math.min(req.query.perPage, 20) || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try {
        let users = await UserModel
            .find({}, {password:0 })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ [sort]: reverse })
        res.json(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ err: err });
    }
})

router.get('/info', auth ,  async(req, res) => {
    try {
         let user = await UserModel.findOne({_id:req.tokenData._id}, {password:0})
        res.json(user);
    } 
    catch (err) {
        console.log(err);
        return res.status(401).json({msg:"Token not valid or expired"})
    }
})

router.post('/login', async(req, res) => {
    let validate = validateLoginUser(req.body);
    if (validate.error) {
        return res.status(403).json(validate.error)
    }
    try {
        let user = await UserModel.findOne({ email: req.body.email })
        if (!user) {
            return res.status(401).json({ msg: "Password or email worng!!!" })
        }
        let password = await bycrpt.compare(req.body.password, user.password);
        if (!password) {
            return res.status(403).json({ msg: "Password or email worng!!!" })
        }
        // return res.json({ msg: "You Logged in !!!" })
        let newToken= createToken(user._id, user.role);
        res.json({token:newToken});
    } catch (err) {
        return res.status(500).json(err);
    }
})

router.post('/', async(req, res) => {
    let validate = validateUser(req.body);
    if (validate.error) {
        return res.status(400).json(validate.error);
    }
    try {
        let user = new UserModel(req.body);
        user.password = await bycrpt.hash(user.password, 10);
        await user.save();

        user.password = "********";
        return res.status(201).json(user);

    } catch (err) {
        if (err.code == 11000) {
            return res.status(401).json({ msg: "Email is already exist...", err });
        }
        return res.status(500).json(err);
    }
})


router.delete("/:idDel", auth, async (req, res) => {
    try {
        let idDel = req.params.idDel;
        let data = await UserModel.deleteOne({_id:idDel, user_id:req.tokenData._id})
        res.status(200).json({ msg: data})
    }
    catch(err) {
        res.status(500).json({msg:"err", err})
    }
})

module.exports = router;