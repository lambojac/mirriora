import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  userName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  resetTokenVerified?: boolean;
  otp?: string;
  isDeactivated?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true },
    password: { type: String, required: true, select: false },

    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationExpires: { type: Date, select: false },

    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    resetTokenVerified: { type: Boolean, default: false },

    otp: { type: String, select: false },
    isDeactivated: { type: Boolean, default: false },


  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
