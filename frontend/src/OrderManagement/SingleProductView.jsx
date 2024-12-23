import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useGetProductByIdQuery, useCreateReviewMutation, useCreateInquiryMutation, useDeleteReviewMutation } from "../redux/api/productApiSlice";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from "../redux/features/cart/cartSlice";
import toast from "react-hot-toast";
import ReviewForm from '../ReviewsInquiry/ReviewForm';
import ChatBot from '../ChatBot/ChatBot'; // Correct path to import ChatBot

export default function SingleProductView() {
    const { _id: productId } = useParams();
    const { data: productData, isLoading, isError, refetch } = useGetProductByIdQuery(productId);
    const user = useSelector((state) => state.auth.userInfo);

    console.log("User : ", user);
    console.log("Product Data : ", productData);

    const [image, setImage] = useState(productData?.image);
    const [name, setName] = useState(productData?.name || '');
    const [description, setDescription] = useState(productData?.description || '');
    const [sellingPrice, setSellingPrice] = useState(productData?.sellingPrice || 0);
    const [discount, setDiscount] = useState(productData?.discount || 0);
    const [category, setCategory] = useState(productData?.category || '');
    const [quantity, setQuantity] = useState(productData?.quantity || 0);
    const [qty, setQty] = useState(1);
    //inquiry message
    const [messagee, setMessagee] = useState('');
    
    // Price formatter
    const priceFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'LKR',
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (productData) {
            setName(productData.name);
            setDescription(productData.description);
            setSellingPrice(productData.sellingPrice);
            setDiscount(productData.discount);
            setCategory(productData.category);
            setQuantity(productData.countInStock);
            setImage(productData.image);
        }
    }, [productData, dispatch, navigate]);

    const newProductPrice = (sellingPrice - (sellingPrice * discount) / 100).toFixed(2);

    const addToCartHandler = () => {
        dispatch(addToCart({ ...productData, qty }));
        navigate('/cart');
    };

    const [createReview] = useCreateReviewMutation();
    const [createInquiry] = useCreateInquiryMutation();
    const [deleteReview] = useDeleteReviewMutation();

//inquiry handler
    const submitInquiryHandler = async (e) => {
        e.preventDefault();
        if (!messagee.trim()) {
            toast.error("Please enter your inquiry message.");
            return;
        }

        try {
            await createInquiry({ productId, messagee }).unwrap();
            refetch();
            toast.success("Inquiry submitted successfully!");
            setMessagee('');
        } catch (error) {
            toast.error(error?.data || error.message);
        }
    };

//handle edit review
    const handleEditReview = (reviewId) => {
        console.log("Review ID : ", reviewId, "Product ID : ", productId);
        navigate(`/product/${productId}/${reviewId}`);
    };

// Handle delete review
    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await deleteReview({ productId, reviewId }).unwrap();//handles the response delete
                refetch(); // Refresh the product data after deletion
                toast.success("Review deleted successfully!");
            } catch (error) {
                toast.error(error?.data || error.message);
            }
        }
    };

// Average Rating function
    const averageRating = productData?.reviews?.length//safely access length property
        ? (productData.reviews.reduce((acc, review) => acc + review.rating, 0) / productData.reviews.length).toFixed(1)
        : 0;// reduce is use to sum

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating); // Full stars.rounds to nearest whole
        const halfStar = rating - fullStars >= 0.5; // Half star
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Empty stars

        return (
            <>
                {Array(fullStars).fill('★').map((star, index) => (
                    <span key={index} className="text-yellow-400">{star}</span>
                ))}
                {halfStar && <span className="text-yellow-400">½</span>}
                {Array(emptyStars).fill('☆').map((star, index) => (
                    <span key={index + fullStars} className="text-gray-300">{star}</span>
                ))}
            </>
        );
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="flex justify-center">
                    <img
                        src={image}
                        alt="Product"
                        className="w-full h-full object-cover rounded-lg shadow-lg transition-transform transform hover:scale-105"
                    />
                </div>

                {/* Product Details */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">{name}</h1>
                    <p className="text-lg text-gray-600 mb-2">Category: <span className="font-semibold text-gray-700">{category}</span></p>
                    
                    <div className="mt-4">
                        <p className="text-3xl font-semibold text-gray-900">{priceFormatter.format(newProductPrice)}</p>
                        <p className="mt-2 text-lg text-gray-500 line-through">{priceFormatter.format(sellingPrice)}</p>
                        <p className="mt-1 text-md text-green-600">Discount: {discount}% Off</p>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700">Description</h2>
                        <p className="mt-2 text-gray-600 leading-relaxed">
                            {description || "No description available for this product."}
                        </p>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700">Product Specifications</h2>
                        <ul className="mt-2 text-gray-600 list-disc list-inside">
                            <li>Processor: Intel Core i7 11th Gen</li>
                            <li>RAM: 16GB DDR4</li>
                            <li>Storage: 512GB SSD</li>
                        </ul>
                    </div>


                    <div className="mt-6 flex items-center space-x-4">
                        <input
                            type="number"
                            min="1"
                            max={quantity}
                            className="w-16 p-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                        <button 
                            onClick={addToCartHandler}
                            disabled={quantity === 0}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            Add to Cart
                        </button>
                    </div>

                    {quantity === 0 && (
                        <p className="mt-4 text-red-500">This product is currently out of stock.</p>
                    )}

                {/* Average Rating Display */}
                <div className="mt-6"> 
                    <h2 className="text-xl font-semibold text-gray-700">Average Rating</h2> 
                    <div className="flex items-center mt-2"> 
                        <div className="text-3xl"> 
                            {renderStars(averageRating)}
                        </div>
                        <span className="ml-3 text-gray-600 text-xl"> 
                            {averageRating} / 5.0 {/*out of 5*/}
                        </span>
                    </div>
                </div>

                    
                </div>
            </div>

 {/* Reviews Display */}
<div className="mt-10">
    <h2 className="text-2xl font-bold text-gray-800">Product Reviews</h2>

    {/* Check if there are reviews */}
    {productData?.reviews && productData.reviews.length > 0 ? (
        productData.reviews.map((review) => (
            <div 
                key={review._id} 
                className="mt-4 p-6 border rounded-lg shadow-md bg-white">

                {/* User Name and Date */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <p className="text-lg font-semibold">{review.name}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Star Rating and Comment */}
                <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center text-yellow-400">
                        {/* Display filled and empty stars dynamically */}
                        {Array(5).fill().map((_, i) => (
                            <span key={i} className="text-xl">
                                {i < review.rating ? '★' : '☆'}
                            </span>
                        ))}
                    </div>
                    <p className="text-gray-700 text-md">{review.comment}</p>
                </div>

                {/* Display Email if provided */}
                {review.email && (
                    <p className="mt-2 text-gray-600 text-sm">Email: {review.email}</p>
                )}

                {/* Uploaded Image (if any) */}
                {review.image && (
                    <div className="mt-3">
                        <img
                            src={review.image} 
                            alt={`Review image uploaded by ${review.name}`} 
                            className="w-40 h-auto rounded-lg shadow-md"
                            onError={(e) => { // Handle image loading error
                                e.target.onerror = null; // Prevents looping
                                e.target.src = '/uploads/reviewRatings/image.png'; 
                            }}
                        />
                    </div>
                )}

                {/* Edit and Delete Buttons for the Author */}
                {user && user._id === review.user && (
                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={() => handleEditReview(review._id)}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        ))
    ) : (
        <p className="mt-4 text-gray-500">No reviews yet.</p>
    )}
</div>


            {/* Review Form */}
            <div className="mt-10">
                <ReviewForm productId={productId} refetch={refetch} />
            </div>

            {/* Inquiry Form */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-800">Product Inquiry</h2>
                <form onSubmit={submitInquiryHandler} className="mt-4">
                    <div className="mb-4">
                        <label htmlFor="messagee" className="block text-lg font-medium text-gray-700">
                            Message
                        </label>
                        <textarea
                            id="messagee"
                            value={messagee}
                            onChange={(e) => setMessagee(e.target.value)}//catch user input
                            rows="4"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Write your inquiry here..."
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        Submit Inquiry
                    </button>
                </form>
            </div>

{/* Display Inquiries */}
<div className="mt-10">
    <h2 className="text-2xl font-bold text-gray-800">Customer Inquiries</h2>
    {productData?.inquiries && productData.inquiries.length > 0 ? (
        productData.inquiries.map((inquiry) => (
            <div key={inquiry._id} className="mt-4 p-4 border rounded-lg shadow-sm bg-gray-50">
                <div className="flex items-center">
                    <p className="text-lg font-semibold">{inquiry.name}</p>
                    <p className="ml-4 text-sm text-gray-500">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-2 text-gray-700">
                    <p>{inquiry.messagee}</p>
                </div>

                {/* Display replies for the inquiry */}
                <div className="mt-4">
                    <h3 className="text-md font-semibold text-gray-700">Replies:</h3>
                    {inquiry.replies && inquiry.replies.length > 0 ? (
                        inquiry.replies.map((reply, index) => (
                            <div key={index} className="mt-2 p-2 border rounded-md bg-gray-100">
                                <p className="text-gray-700">{reply.message}</p>
                                <p className="text-sm text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="mt-2 text-gray-500">No replies yet.</p>
                    )}
                </div>

            </div>
        ))
    ) : (
        <p className="mt-4 text-gray-500">No inquiries yet.</p>
    )}
</div>
<ChatBot /> {/* ChatBot component is embedded here */}
        </div>
    );
}