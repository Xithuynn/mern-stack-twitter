import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { v2 as cloudinary} from "cloudinary"
import bcrypt from "bcryptjs"

export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try{
        const user = await User.findOne({username}).select("-password")
        if(!user) {
            return res.status(404).json({ message: "User Not Found "})
        }
        res.status(200).json(user)
    }
    catch( error) {
        console.log("Error in getUserProeile", error.message)
        res.status(500).json({ error: error.message })
    }
}


export const followUnfollowUser = async (req, res) => {
    try{
        const { id } = req.params //toBeFollowed ID

        const userToModify = await User.findById(id); //UsertobeFollowed
        const currentUser = await User.findById(req.user._id) //Doer

        if( id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow yourself"})
        }

        if(!userToModify || !currentUser) {
            return res.status(400).json({ error: "User Not Found" })
        }

        const isFollowing = currentUser.following.includes(id)
        // click follow/unfollow btn
        if(isFollowing) {
            await User.findByIdAndUpdate(id,{$pull: { followers: req.user._id }} )
            await User.findByIdAndUpdate(req.user._id,{ $pull: { following: id }} )
            res.status(200).json({ message: "User UnFollowed successfully" })
        }
        else {
            await User.findByIdAndUpdate(id,{$push: { followers: req.user._id }} )
            await User.findByIdAndUpdate(req.user._id,{ $push: { following: id }} )

            const getNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "follow"
            })

            await getNotification.save();

            res.status(200).json({ message: "User Followed successfully" })

       
        }


    } catch( error) {
        console.log("Error in followUnfollowerUser: " , error.message)
        res.status(500).json({ error: error.message})
    }
}

export const getSuggestedUsers = async (req, res) => {
    try{
        const userId = req.user._id;
            
        const userFollowByMe = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId}
                },
            },
            {
                $sample: {
                    size: 10
                }
            }
        ])

        const filteredUsers = users.filter((user) => (!userFollowByMe.following.includes(user._id)))
        const suggestUsers = filteredUsers.slice(0,4)

        suggestUsers.forEach((user) => (user.password = null))

        res.status(200).json(suggestUsers)


    } catch( error ){
        console.log(" Error in getSuggestedUsers: ", error.message)
        res.status(500).json({ error: error.message})
    }
}

export const updateUserProfile = async (req, res) => {
    const { fullname, email, username, currentPassword, newPassword, bio, link} = req.body
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    try{
        let user = await User.findById(userId); //let changeable const unchangeable
        if(!user) return res.status(404).json({ message: "User not found"})
        
        if((!currentPassword && newPassword) || (!newPassword && currentPassword)){
            return res.status(400).json({ error: "Please Provide both password"})
        }

        if( currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({message: "Current Password is incorrect"})

            }
            if(newPassword.length < 6 ) {
                return res.status(400).json({ error: "Password must be atleast 6 words"})
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt)
        }


        if( profileImg) {
            if(user.profileImg) {
                

                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg) {

            if(user.coverImg) {
                

                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        
        user.password = null ; //password should be null in response

        return res.status(200).json(user);
    }
    catch( error){
        console.log(" Error in updateUserProfile: ", error.message)
        res.status(500).json({ error: error.message})
    
    }
}