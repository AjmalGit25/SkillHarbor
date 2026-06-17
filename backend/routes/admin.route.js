import express from 'express';
import {
  signup,
  login,
  logout,
  // getProfile,
  // updateProfile,
  // deleteProfile
} from '../controllers/admin.controller.js';
import adminMiddleware from '../middlewares/admin.mid.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
// router.get("/profile", getProfile);
// router.put("/updateProfile", updateProfile);
// router.delete("/deleteProfile", deleteProfile);

export default router;