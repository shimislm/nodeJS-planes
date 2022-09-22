const express= require("express");
const {auth} = require("../middleware/auth");
const {PlaneModel,validatePlane} = require("../models/plansModel")
const router = express.Router();

const perPage = Math.min(req.query.perPage,20) || 10;
const page = req.query.page || 1;
const sort = req.query.sort || "year";
const reverse = req.query.reverse == "yes" ? -1 : 1;

router.get("/" , async(req,res)=> {
  try{
    let data = await PlaneModel
    .find({})
    .limit(perPage)
    .skip((page - 1)*perPage)
    .sort({[sort]:reverse})
    res.json(data); 
  } 
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})
router.get("/year",async(req,res)=>{
  let perPage = Math.min(req.query.perPage,20)  || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;
  try{
      let min = req.query.min;
      let max = req.query.max;
      if(min && max){
        let planes = await PlaneModel.find({$and:[{year:{$gte:min}},{year:{$lte:max}}]})
        .limit(perPage)
        .skip((page-1)*perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(planes);
      }
      else if(min){
        let planes = await PlaneModel.find({year:{$gte:min}})
        .limit(perPage)
        .skip((page-1)*perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(planes);
      }
      else if(max){
        let planes = await PlaneModel.find({year:{$lte:max}})
        .limit(perPage)
        .skip((page-1)*perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(planes);
      }

  }
  catch(err){
      console.log(err);
      res.status(500).json({err:err});
  }
})

router.get("/search", async(req,res)=>{
  try{
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS,"i")
    let data = await PlaneModel.find({$or:[{name:searchReg}, {manufacturer:searchReg}]})
    .find({})
    .limit(perPage)
    .skip((page - 1)*perPage)
    .sort({[sort]:reverse})
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})
router.get("/category/:catName", async(req,res)=>{
  try{
    let cat = req.params.catName;
    let catReg = new RegExp(cat,"i")
    let data = await PlaneModel.find({category:catReg})
    .limit(perPage)
    .skip((page - 1)*perPage)
    .sort({[sort]:reverse})
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})

router.post("/",auth, async(req,res) => {
  let validBody = await validatePlane(req.body);
  if(validBody.error){
      return res.status(400).json(validBody.error.details)
  }
  try{
      let plane = new PlaneModel(req.body);
      plane.user_id = req.tokenData._id;
      await plane.save();
      res.status(201).json(plane);
  }
  catch(err){
    if (err.code == 11000) {
      return res.status(401).json({ msg: "Model is already exist...", err });
  }
  return res.status(500).json(err);
  }
})

router.delete("/:delId",auth, async(req,res) => {
  try{
    let delId = req.params.delId;
    let data;
    if(req.tokenData.role == "admin"){
      data = await PlaneModel.deleteOne({_id:delId})
    }
    else{
      data = await PlaneModel.deleteOne({_id:delId,user_id:req.tokenData._id})
    }
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg:"there error try again later",err})
  }
})


router.put("/:idEdit", auth , async(req, res)=>{
  let validateBody = validatePlane(req.body)
  if(validateBody.error){
    return res.status(400).json(validateBody.error.details)
  }
  let idEdit = req.params.idEdit
  let data;
  try{
    if(req.tokenData.role == "admin"){
      data = await PlaneModel.updateOne({_id:idEdit}, req.body)
      res.json(data);
    }
    else{
      data = await PlaneModel.updateOne({_id:idEdit, user_id:req.tokenData._id}, req.body)
      res.json(data);
    }
  }
  catch{
    res.status(500).json({msg:"err", err})
  }
})


module.exports = router;

