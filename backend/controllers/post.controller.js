import Post from "../models/post.model.js"
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { v2 as cloudinary} from 'cloudinary'
import { updateUserProfile } from "./user.controller.js";

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

export const deletePost = async (req, res) => {
   try{
    const post = await Post.findById(req.params.id)

    if(!post) return res.status(404).json({message: "Post not Found"})
    if(post.user.toString() !==   req.user.id ) {
        
        const data = [typeof(post.user.toString()),typeof(req.user.id)]
        return res.status(401).json({message: "User Authentication invalid", data: data})}

    if ( post.img) {
        const imgId = post.img.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(imgId)
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({message: "Post deleted successfully"})
   }
   catch(error) {
    console.log("Error in deletePost controller: ", error)
    res.status(500).json({ error: "Internal server error"})
   }
    
}

export const commentPost = async (req, res) => {
    try{
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId)
        if(!post) res.status(404).json({ message: "Post Not Found"})
        
        const comment = { 
            user: userId,
            text
        }
        post.comments.push(comment);
        await post.save();
        res.status(200).json({data: post , message: "Commented Successfully"})

    } catch(error) {
        console.log("Error in comment post controller " , error)
        res.status(400).json({ error: "comment post server error"})
    }
}

export const likeUnlikePost = async (req, res) => {
    try{
        const { id: postId } = req.params;
        const userId = req.user._id
        const post = await Post.findById(postId) //findByIdAndUpdate alternative
        if(!post) {
           return res.status(404).json({message: "Post Not Found"})
        }
        const isLiking =  post.likes.includes(userId) 
        if(isLiking) {
            const UpdatedPost = await Post.findByIdAndUpdate(
                    postId,
                    { $pull : { likes: userId }},
                    { new : true}) // UpdateOne can be used as post is (findById).
            
            await User.findByIdAndUpdate(userId,
                { $pull: {likedPosts: postId }},
                { new:  true})  
            return   res.status(200).json({message: "Unlike Successfully" , data: UpdatedPost})

        } else {
           const UpdatedPost =  post.likes.push(userId);
           await User.findByIdAndUpdate(userId,
            { $push: { likedPosts: postId }},
            { new: true})
            await post.save()

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })

            await notification.save()
            return res.status(200).json({message: "Like Successfully", data: UpdatedPost})
         
        }

    } catch( error ) {
        console.log("Error in likeUnLike Controller " ,error)
        res.status(500).json({ error: "server error "})
    }
}

export const getAllPosts = async (req, res) => {
    try{
        const posts = await Post.find()
        .sort({ createdAt: -1})
        .populate({
           path: 'user',
           select: "username"
        })
        .populate({
            path: 'comments.user',
            select: "username"
        })
        res.status(200).json(posts)
    } catch(error) {
        console.log("getAllpost controller error", error)
        res.status(500).json({ error: error})
    }
}

export const getLikedPost = async ( req, res ) => {
    const userId = req.params.id
        
    try{
        const user = await User.findById(userId) 
        if(!user) {
            return   res.status(404).json({message: "User Not Found"})
        }

        const likedPosts = await Post.find({_id: {$in : user.likedPosts}})
        .populate({
            path: "user",
            select: "username"
        })
        .populate({
            path: "comments.user",
            select: "username"
        })
        res.status(200).json(likedPosts)
        

    } catch(error) {
        console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}

export const getNewsFeed = async ( req , res ) => {
    try{
        const userId = req.user._id;

        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({message: "user Not Found"})
        }
        const following = user.following
        const feedPosts = await Post.find({user: {$in: following}})
                                    .sort({ createdAt : -1})
                                    .populate("user", "username")
                                    .populate("comments.user", "username")
                                    .populate("likes", "username")
        res.status(200).json(feedPosts)
    } 
    catch ( error ) {
        console.log("Error in newsfeed controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}

export const getUserPosts = async (req, res) => {
    try{
        const { username } = req.params;

        const user = await User.findOne({username})

        if (!user) {
            return res.status(404).json({ message: "User Not Found"})
        }
        const userPosts = await Post.find({ user: user._id})
                                    .sort( { createdAt : -1 })
                                    .populate("user", "username")
                                    .populate("comments.user", "username")
                                    .populate("likes", "username")

        res.status(200).json(userPosts)
    } catch( error ){
        console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
    }
}