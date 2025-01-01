import User from "../models/userModel.js"
import bcrypt from "bcryptjs"


export const signup = async (req , res ) => {
    try{
        const {username, fullname, email, password} = req.body

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

    }
}

export const login = (req , res ) => {
    res.json({
        data: "you hit the login endpoint"
    })
}

export const logout = (req , res ) => {
    res.json({
        data: "you hit the logout endpoint"
    })
}