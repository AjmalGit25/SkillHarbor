import express from 'express';
import {
  signup,
  login,
  logout,
  getPurchase,
  // getProfile,
  // updateProfile,
  // deleteProfile
} from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/user.mid.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
// router.get("/profile", getProfile);
// router.put("/updateProfile", updateProfile);
// router.delete("/deleteProfile", deleteProfile);

router.get("/purchases", authMiddleware, getPurchase);

export default router;