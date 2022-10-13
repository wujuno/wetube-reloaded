//5
import bcrypt from "bcrypt";
//1
import mongoose from "mongoose";
//4
const userSchema = new mongoose.Schema({
    email: {type:String, required: true, unique: true},
    avatarUrl: String,
    socialOnly:{ type:Boolean, default:false },
    username: { type:String, required: true, unique: true},
    password: { type:String },
    name: { type:String, required: true },
    location: String,
    videos:[
        {type: mongoose.Schema.Types.ObjectId, required: true, ref: "video"}]

});
//6 this는 userController 의 User.create 을 가리킴.
userSchema.pre('save', async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 5);
    }
});
//2
const User = mongoose.model('user',userSchema);
//3
export default User;