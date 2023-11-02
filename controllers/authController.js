const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');

const registerController=async(req,res)=>{
    try {
        const existingUser=await userModel.findOne({email:req.body.email})
        //validation
        if(existingUser)
        {
         return res.status(200).send({
            message:'User exists already',
            success:false,
         })   
        }
        //hash the password
        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(req.body.password,salt);
        req.body.password=hashedPassword;
        //rest data
        const user=new userModel(req.body);
        await user.save();
        return res.status(201).send({
            success:true,
            message: "User registered successfuly",
            user,
        }); 

    } 
    catch (error) {
        console.log(error)
        res.status(500).send({
            message:'Error in register API',
            success:false,
            error
        })
    }
};

//Login call back
const loginController= async(req,res)=>{
    try {
        const user= await userModel.findOne({email:req.body.email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Invalid Credentials'
            });
        }
        //check role
        if(user.role !== req.body.role)
        {
            return res.status(500).send({
                success:false,
                message:"role doesn't match",
            })
        }
        //compare password
        const comparePassword= await bcrypt.compare(req.body.password,user.password);
        if(!comparePassword)
        {
            return res.status(500).send({
                success:false,
                message:'Invalid Credentials',
            })
        }
        const token=jwt.sign({userId:user._id},process.env.jwt_secret,{expiresIn:"1d"});
        return res.status(200).send({
            success:true,
            message:'Login Successfully',
            token,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in Login API',
            error
        })
    }
};

// GET Current-user
const currentController=async(req,res)=>{
    try {
       const user = await userModel.findOne({_id:req.body.userId});
       return res.status(200).send({
        success:true,
        message:'user fetched successfully',
        user
       })
         
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success:false,
            message:'unable to get current user',
            error
        });
    };
}

module.exports = {registerController,loginController,currentController};