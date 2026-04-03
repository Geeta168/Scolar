import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const register=async(req,res)=>{
    const {username,email,password}=req.body;

    if(!username || !email || !password){
        return res.json({success:false,message:"enter the all information"});
    }

    try{
        const [existsuser]=await pool.query(
            "SELECT * FROM users WHERE email=?",
            [email]
        );

        if(existsuser.length>0){
            return res.json({success:false, message:"user already exists"});
        }

        const hashpassword=await bcrypt.hash(password,10);

        const [result]= await pool.query(
            "INSERT INTO users(username, email,password) VALUES(?,?,?)",
            [username,email,hashpassword]
        );

        const userId=result.insertId;

       const token=jwt.sign(
        {userId:userId},
        process.env.JWT_SECRET,
        {expiresIn:"1h"}
       )
       
       res.cookie("token",token,{
        httpOnly:true,secure:process.env.NODE_ENV==="production",
        sameSite:process.env.NODE_ENV==="production"?"none":"strict",
        maxAge:2*24*60*60*1000,
       })

       return res.json({success:true,message:"user registered successfully",token:token,userId:userId})

    }catch(error){
        return res.json({success:false,message:"server error",error:error.message});
    }

}

export const login=async(req,res)=>{
      const {email,password}=req.body;

      if(!email || !password){
        return res.json({success:false,message:"enter the all information"});
      }

      try{
         const [user]=await pool.query(
            "SELECT * FROM users WHERE email=?",[email]
         );

         
         if(user.length===0){
            return res.json({success:false,message:"user not found"});
         }

         const ispassword=await bcrypt.compare(password,user[0].password);
         
         if(!ispassword){
            return res.json({success:false,message:"invalid password"});
         }

         const token=jwt.sign(
            {userId:user[0].id},
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
         );

         res.cookie("token",token,{
            httpOnly:true,secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
            maxAge:2*24*60*60*1000,
         })

            return res.json({success:true,message:"login successfully",token:token,userId:user[0].id})

      }catch(error){
        return res.json({success:false,message:"server error",error:error.message});
      }
}

export const logout=async(req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,secure:process.env.NODE_ENV==="production",
        sameSite:process.env.NODE_ENV==="production"?"none":"strict",
    })

    return res.json({success:true,message:"logout successfully"});
}
