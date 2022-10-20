
import mongoose, { mongo } from "mongoose";



const videoSchema = new mongoose.Schema({
    title: {type:String, required: true, trim: true},
    description: {type:String, required: true, trim: true},
    fileUrl: {type:String, required: true},
    thumbUrl: {type:String, required: true},
    createdAt: {type: Date, required: true, default: Date.now},
    hashtags: [{type: String, trim: true}],
    meta: {
        views: {type:Number, default: 0, required: true},
        rating: {type:Number, default: 0, required: true},
    },
    comments: [{type:mongoose.Schema.Types.ObjectId, required:true, ref:"comment"}],
    owner: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "user"}
}); 

videoSchema.static("formatHashtags", function(hashtags){
    return hashtags.split(",").map(word => word.startsWith("#") ? word : `#${word}`)
});
 
const movieModel = mongoose.model("video",videoSchema);
export default movieModel;