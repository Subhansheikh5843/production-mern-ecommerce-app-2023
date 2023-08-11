import express from "express";
import {
  loginController,
  registerController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

//register
router.post("/register", registerController);

//login
router.post("/login", loginController);

//Forgot password
router.post("/forgot-password", forgotPasswordController);

//test route
router.get("/test", requireSignIn, isAdmin, testController);

//protected user routes auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected admin routes auth
router.get("/admin-auth", requireSignIn, isAdmin,(req, res) => {
  res.status(200).send({ ok: true });
});


//update profile
router.put("/profile", requireSignIn,updateProfileController);

//order
router.get("/orders", requireSignIn, getOrdersController);

//allorder
router.get("/all-orders", requireSignIn, isAdmin,getAllOrdersController);

//order status update
router.put("/order-status/:orderId", requireSignIn, isAdmin,orderStatusController);
export default router;
