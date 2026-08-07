import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    matchedItem: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    reasons: [String],
    read: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, item: 1, matchedItem: 1 }, { unique: true });

export default mongoose.model("Notification", notificationSchema);
