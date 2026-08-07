import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    avatarUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function () {
  return { id: this.id, name: this.name, email: this.email, role: this.role, avatarUrl: this.avatarUrl };
};

export default mongoose.model("User", userSchema);
