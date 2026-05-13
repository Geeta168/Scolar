import jwt from "jsonwebtoken";

export const userAuth=async(req,res,next)=>{
    const token=req.cookies.token;

    if(!token){
        // Silently return unauthorized to allow frontend to handle unauthenticated state gracefully.
        return res.json({success:false,message:"unauthorized"});
    }else{
        try{
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            console.log("Token decoded successfully, user ID:", decoded.userId);
            req.user=decoded;
            next();
        }catch(error){
            console.error("Token verification failed:", error.message);
            return res.json({success:false,message:"invalid token",error:error.message});
        }
    }
}
