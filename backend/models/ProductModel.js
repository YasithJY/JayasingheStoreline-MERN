import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    name : { type : String, required : true },
    rating : { type : Number, required : true },
    comment : { type : String, required : true },
    user : { type : mongoose.Schema.Types.ObjectId, required : true, ref : "User" }
} , { timestamps : true });

const ProductSchema = new mongoose.Schema({
    name : { type : String, required : true },
    image : { type : String, required : true, default : "" },
    brand : { type : String, required : true },
    category : { type : String, required : true },
    description : { type : String, required : true },
    rating : { type : Number, required : true, default : 0 },
    numReviews : { type : Number, required : true, default : 0 },
    buyingPrice : { type : Number, required : true, default : 0 },
    sellingPrice : { type : Number, required : true, default : 0 },
    discount : { type : Number, required : true, default : 0 },
    countInStock : { type : Number,  required : true, default : 0 },
    currentQty : { type : Number,  required : true, default : 0 },
    sku : { type : String,  required : true },
    barcode : { type : String,  required : true },
    reviews : [ReviewSchema]
} , { timestamps : true });

const Product = mongoose.model("Product", ProductSchema);
export default Product;

// module.exports = Product = mongoose.model("product" , ProductSchema);