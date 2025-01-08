import User from "../models/userModel.js";


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

        if( id === req.user._id) {
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
            res.status(200).json({ message: "User UnFollowed successfully" })

       
        }


    } catch( error) {
        console.log("Error in followUnfollowerUser: " , error.message)
        res.status(500).json({ error: error.message})
    }
}