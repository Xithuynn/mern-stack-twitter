import Post from "../models/post.model.js"
import User from "../models/userModel.js";
import { v2 as cloudinary} from 'cloudinary'

export const createPost = async ( req, res) => {
    try{
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId)
        if(!user) return res.status(404).json({ message: "User Not Found"})

        if(!text && !img) {
            return res.status(400).json({ error: "Post must have text and img"})
        }

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text, 
            img
        })
        await newPost.save()

        res.status(200).json(newPost)


    }
    catch( error ) {
        console.log( "erorr", error.message)
        res.status(500).json({error: "create post server error"})
    }
}