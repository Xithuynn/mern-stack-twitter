import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCoookie } from "../lib/utils/generateTokenAndSetCookie.js"

export const signup = async (req , res ) => {
    try{
        const {fullname, username, email, password} = req.body //express.json !!!

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format "});

        }

        const takenUsername = await User.findOne({ username })
        if(takenUsername) {
            return res.status(400).json({ error: " Username is already taken "  })
        }
        const usedEmail = await User.findOne({ email })

        if(usedEmail) {
            return res.status(400).json({ error: " email is already taken "  })
        }
        if( password.length < 6) {
            return res.status(400).json({ error: " Password must be at least 6 words" })
        }
        //hash password 

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullname,
            username,
            email, 
            password: hashedPassword
        })

        if(newUser){
            generateTokenAndSetCoookie(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        } else {
            res.status(400).json({ error: "Invalid user data "})
        }


    } catch(error){
        console.log("Error in Create Product", error.message)
        res.status(500).json({success:false, message: "server Error"})
        
    }
}

export const login = async (req , res ) => {
    try{
            const { username, password } = req.body;
            
            const user = await User.findOne({ username})
            const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")
            if( !user || !isPasswordCorrect) {
                return res.status(400).json({error: "username or password is incorrect"})
            }
            generateTokenAndSetCoookie(user._id, res)
            res.status(201).json({
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg
            })

    } catch( error ) {
        console.log("auth controller error")
        res.status(500).json({ success: false, error: "Internal server failed"})
    }
}

export const logout = (req , res ) => {
    try{
        res.cookie("jwt","", { maxAge: 0})
        res.status(200).json({ message: "logout successfully" })
    }
    catch( error ) {
        console.log("auth controller error")
        res.status(500).json({ success: false, error: "Internal server failed"})
    }
}

export const getMe = async ( req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password")
       
        res.status(200).json(user)
    }
    catch(error) {
        console.log("Error in protectRoute middleware", err.message)
        res.status(500).json({ success: false, error: "Internal server failed"})
  
    }
}