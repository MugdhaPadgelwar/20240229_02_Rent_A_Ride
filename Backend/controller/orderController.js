// Import middleware
const { authenticateUser, isAdmin } = require("../middleware/auth");

//Import Model
const Order = require("../models/Order");

require("dotenv").config();
const {
  userIdValidation,
  carIdValidation,
  locationIdValidation,
  totalPriceValidation,
  paymentValidation,
  bookingDateAndTimeValidation,
  cancellationReasonValidation,
  cancellationDateAndTimeValidation,
} = require("../validators/orderValidators.js"); // Adjust the path as necessary

const placedOrder = async (req, res) => {
  try {
    // Destructure details from the request body
    const {
      userId, // Add userId to the request body
      carId,
      locationId,
      totalPrice,
      payment,
      bookingDateAndTime,
      cancellationReason,
      cancellationDateAndTime,
    } = req.body;

    // Validation
    userIdValidation(userId); // Validate userId
    carIdValidation(carId);
    locationIdValidation(locationId);
    totalPriceValidation(totalPrice);
    paymentValidation(payment);
    bookingDateAndTimeValidation(bookingDateAndTime);
    cancellationReasonValidation(cancellationReason);
    cancellationDateAndTimeValidation(cancellationDateAndTime);

    // Create a new order instance
    const newOrder = new Order({
      userId,
      carId,
      locationId,
      totalPrice,
      payment,
      bookingDateAndTime,
      cancellationReason,
      cancellationDateAndTime,
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Respond with the created order
    res
      .status(201)
      .json({ message: "Order created successfully", order: savedOrder });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const orderById = async (req, res) => {
  try {
    // Get the orderId from query parameters
    const orderId = req.query.orderId;

    // Validate orderId existence
    if (!orderId) {
      return res
        .status(400)
        .json({ message: "orderId is required in the query parameters" });
    }

    // Find the order in the database using the provided orderId
    const order = await Order.findOne({ _id: orderId })
      .populate("carId")
      .populate("userId")
      .populate("locationId");

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Respond with the order details
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const allorders = async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const cancleOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;

    // Check if orderId is provided
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  placedOrder,
  orderById,
  allorders,
  cancleOrder,
};
