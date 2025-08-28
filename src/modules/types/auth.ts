

export interface RegisterBody {
    fullName: string;
    email: string;
    password: string;
    phoneNumber:string
  }
  
  export interface LoginBody {
    email: string;
    password: string;
    phoneNumber:number
  }
export interface IUser extends Document {  
deactivatedAt:Date,
createdAt:Date,
  resetTokenVerified?: boolean;
  email: string
  password: string;
  confirm_password?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  resetTokenExpires?: Date;
  fullName?: string;
  phoneNumber?: string;
  otp: string;
  
}


export interface AuthenticatedRequest extends Request {
  user?: IUser; 
}
