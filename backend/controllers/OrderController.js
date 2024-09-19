import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";

// add new Order
export const addOrder = async (req, res) => {
    
    try {
        const { itemsPrice, deliveryPrice, discount, totalPrice, status, orderItems } = req.fields;
        
        switch(true) {
            case !itemsPrice:
                return res.json( { error: "itemsPrice is required" } );
            case !deliveryPrice:
                return res.json( { error: "deliveryPrice is required" } );
            case !discount:
                return res.json( { error: "discount is required" } );
            case !totalPrice:
                return res.json( { error: "totalprice is required" } );
            case !status:
                return res.json( { error: "status is required" } );
        }
        
        const order = new Order({...req.fields});
        await order.save();

        const items = JSON.parse(orderItems);
        for ( const item of items ) {
            try {
                const product = await Product.findById(item._id);
                if(!product) {
                    return res.status(404).json( { error : `Product with ID ${item._id} not found` } );
                }
                if(product.currentQty <= 0) {
                    product.currentQty = product.countInStock;
                }
                product.currentQty -= item.qty;
                await product.save();
                
            } catch (error) {
                res.status(400).json( { error : `current qty not changed : `, error } )
            }
            
        }

        res.status(201).json( { msg : "Order Added Successfully", items } );        

    } catch (error) {
        res.status(400).json( { msg : "Order Adding Failed ", error } );
    }
}

// fetch all orders
export const fetchOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(400).json( { msg : "No Order Found", error } );
    }
}


// fetch a product by id
export const fetchOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) {
            return res.status(404).json( { msg : "Product Not Found" } );
        }
        res.json(order);
    } catch (error) {
        res.status(404).json( { msg : "Cannot find this product", error } );
    }
}

// update product
export const updateOrder = async (req, res) => {
    try {
        const { itemsPrice, deliveryPrice, discount, totalPrice, status } = req.fields;
        
        switch(true) {
            case !itemsPrice:
                return res.json( { error: "itemsPrice is required" } );
            case !deliveryPrice:
                return res.json( { error: "deliveryPrice is required" } );
            case !discount:
                return res.json( { error: "discount is required" } );
            case !totalPrice:
                return res.json( { error: "totalPrice is required" } );
            case !status:
                return res.json( { error: "status is required" } );
           
        }
        
        const order = await Order.findByIdAndUpdate(req.params.id, {...req.fields}, { new : true });
        if(!order) {
            return res.status(400).json( { msg : "Product not found" } )
        }
        await order.save();
        res.json( { msg : "Update Successful ", order } );
    } catch (error) {
        res.status(400).json( { msg : "Update Failed ", error } );
    }
}

// delete product
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if(!order) {
            return res.status(400).json( { msg : "Order not found" } )
        }
        res.json( { msg : "Order Deleted Successfully" } )
    } catch (error) {
        res.status(400).json( { msg : "Order Cannot Delete ", error } );
    }
}