import mongoose from "mongoose";

const videoSchmea = new mongoose.Schema({
    title: String,
    description: String,
    createdAt: Date,
    hashtags: [{type: String}],
    meta: {
        views:Number,
        rating: Number,
    }
});

const movieModel = mongoose.model("video",videoSchmea);
export default movieModel;