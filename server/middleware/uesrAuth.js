import jwt from "jsonwebtoken";

export const userAuth=async(req,res,next)=>{
    const token=req.cookies.token;

    if(!token){
        return res.json({success:false,message:"unauthorized"});
    }else{
        try{
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            req.user=decoded;
            next();
        }catch(error){
            return res.json({success:false,message:"invalid token",error:error.message});
        }
    }
}
