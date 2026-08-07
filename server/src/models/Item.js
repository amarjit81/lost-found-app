import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true, index: true },
    category: {
      type: String,
      enum: ["ID card", "Wallet", "Electronics", "Keys", "Books", "Clothing", "Other"],
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    location: { type: String, required: true, trim: true, maxlength: 140 },
    occurredAt: { type: Date, required: true },
    contact: { type: String, required: true, trim: true, maxlength: 120 },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resolvedAt: Date
  },
  { timestamps: true }
);

itemSchema.index({ title: "text", description: "text", location: "text" });

export default mongoose.model("Item", itemSchema);
