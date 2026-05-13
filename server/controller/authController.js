import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const register=async(req,res)=>{
    const {username,email,password}=req.body;

    if(!username || !email || !password){
        return res.json({success:false,message:"enter the all information"});
    }

    try{
       const [existingUser] = await pool.query(
    "SELECT * FROM users WHERE email=? OR username=?",
    [email, username]
);

if (existingUser.length > 0) {
    if (existingUser[0].email === email) {
        return res.json({ success: false, message: "Email already exists" });
    }
    if (existingUser[0].username === username) {
        return res.json({ success: false, message: "Username already taken" });
    }
}

        const hashpassword=await bcrypt.hash(password,10);

        const [result]= await pool.query(
            "INSERT INTO users(username, email,password) VALUES(?,?,?)",
            [username,email,hashpassword]
        );

        const userId=result.insertId;

       const token=jwt.sign(
       { userId: userId },  
        process.env.JWT_SECRET,
        {expiresIn:"1h"}
       )
       
       res.cookie("token",token,{
        httpOnly:true,secure:process.env.NODE_ENV==="production",
        sameSite:process.env.NODE_ENV==="production"?"none":"lax",
        maxAge:2*24*60*60*1000,
       })

       return res.json({success:true,message:"user registered successfully",token:token,user:{user_id:userId,username,email}})

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
            {userId:user[0].user_id},
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
         );

         res.cookie("token",token,{
            httpOnly:true,secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"lax",
            maxAge:2*24*60*60*1000,
         })

            return res.json({success:true,message:"login successfully",token:token,user:user[0]})

      }catch(error){
        return res.json({success:false,message:"server error",error:error.message});
      }
}

export const logout=async(req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:process.env.NODE_ENV==="production"?"none":"lax",
        path: "/",
    });

    return res.json({success:true,message:"logout successfully"});
}

export const getUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const [user] = await pool.query(
            "SELECT user_id, username, email FROM users WHERE user_id = ?",
            [userId]
        );

        if (user.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, user: user[0] });
    } catch (err) {
        console.error("GET USER ERROR:", err);
        return res.json({ success: false, message: "Server error" });
    }
};
