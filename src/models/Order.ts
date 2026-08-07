import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    selectedColor: String,
    selectedSize: String,
    imageUrl: String,
  },
  { _id: false },
);

const ShippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false },
);

const StatusHistorySchema = new mongoose.Schema(
  {
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: String,
    note: String,
  },
  { _id: false },
);

const CancellationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "cancelled"],
      default: "none",
    },
    requestedBy: { type: String, enum: ["user", "admin"] },
    reason: String,
    note: String,
    adminNote: String,
    requestedAt: Date,
    resolvedAt: Date,
    refundStatus: {
      type: String,
      enum: [
        "not_applicable",
        "pending",
        "initiated",
        "completed",
        "failed",
      ],
      default: "not_applicable",
    },
    refundAmount: Number,
    refundId: String,
    refundInitiatedAt: Date,
    refundCompletedAt: Date,
  },
  { _id: false },
);

const EmailLogSchema = new mongoose.Schema(
  {
    confirmationSentAt: Date,
    lastResentAt: Date,
    resendCount: { type: Number, default: 0 },
    lastError: String,
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    codFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    amountPaise: Number,
    pricing: {
      itemsTotal: Number,
      shipping: Number,
      codCharge: Number,
      gstAmount: Number,
      grandTotal: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    status: {
      type: String,
      default: "pending",
    },
    orderStatus: {
      type: String,
      default: "pending_payment",
    },
    shipping: { type: ShippingSchema, required: true },
    notes: String,
    razorpayOrderId: { type: String, sparse: true, unique: true },
    razorpayPaymentId: { type: String, sparse: true, unique: true },
    razorpaySignature: String,
    stockDecremented: { type: Boolean, default: false },
    payment: {
      method: { type: String, enum: ["razorpay", "cod"] },
      orderId: String,
      paymentId: String,
      signature: String,
      status: {
        type: String,
        enum: ["pending", "paid", "cod", "cancelled"],
      },
    },
    emailLog: { type: EmailLogSchema, default: () => ({}) },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    cancellation: { type: CancellationSchema, default: () => ({ status: "none" }) },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
