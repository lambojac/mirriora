import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email?: string;
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
    email: { 
      type: String, 
      sparse: true, // Allows multiple null values but ensures uniqueness when not null
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    phoneNumber: { 
      type: String, 
      sparse: true, // Allows multiple null values but ensures uniqueness when not null
      unique: true, 
      trim: true 
    },
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

// Ensure at least one of email or phoneNumber is provided
userSchema.pre('validate', function() {
  if (!this.email && !this.phoneNumber) {
    this.invalidate('contact', 'Either email or phone number must be provided');
  }
});

export default mongoose.model<IUser>("User", userSchema);