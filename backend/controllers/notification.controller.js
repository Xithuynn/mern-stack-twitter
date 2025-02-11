import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";


export const getAllNotification = async ( req, res) => {
    try{
        const userId = req.user._id;

        const user = await User.findById(userId);

        if(!user) {
            return   res.status(500).json({message: "User Not Found"})

        }

        const getNoti =    await Notification.find({to: userId})
                          .sort({ createdAt: -1 })
                          .populate("to", "username")
                          .populate("from", "username")

        res.status(200).json({data: getNoti , count: getNoti.length})
    } catch (error) {
        console.log("Error in getNotificallion Controller " ,error)
        res.status(500).json({ error: "server error "})
     }
}


export const deleteNotification = async (req, res) => {
    try{
        const {id: notiId} = req.params
        const notification = await Notification.findById(notiId)
       
        if(!notification) {
            return res.status(404).json({ message: "Post Not found"})
        }
        
        if(notification.to._id.toString() !== req.user.id){
            return res.status(400).json({ message: "You have no authoriztion to delete this", notiuser: typeof(notification.to._id), user: typeof(req.user.id)})
        }
        
        await Notification.findByIdAndDelete(notification)
        res.status(200).json({ message: "You have successfully deleted this notification"})


    } catch(error){
        console.log("Error in getNotificallion Controller " ,error)
        res.status(500).json({ error: "server error "})
   
    }
}