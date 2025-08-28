import jwt from "jsonwebtoken";

const genToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
  };
  

export default genToken;
