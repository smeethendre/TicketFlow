import Razorpay from "razorpay";
import { ApiError } from "../util/apiError.util.js";

let razorpay;

const getRazorpay = () => {
  if (razorpay) return razorpay;

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Razorpay credentials are not configured");
  }

  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  return razorpay;
};

export { getRazorpay };
