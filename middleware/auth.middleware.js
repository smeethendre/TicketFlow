import User from "../model/user.model.js";

const verifyUser = async(User) => {
    const user = await User.findById(this._id);

    if(!user){
        
    }
}