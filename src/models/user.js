//5
import bcrypt from "bcrypt";
//1
import mongoose from "mongoose";
//4
const userSchema = new mongoose.Schema({
    email: {type:String, required: true, unique: true},
    username: { type:String, required: true, unique: true},
    password: { type:String, required: true },
    name: { type:String, required: true },
    location: String,

});
//6 this는 userController 의 User.create 을 가리킴.
userSchema.pre('save', async function(){
    console.log("Users password:", this.password);
    this.password = await bcrypt.hash(this.password, 5);
    console.log("Hashed password:", this.password);
});
//2
const User = mongoose.model('user',userSchema);
//3
export default User;