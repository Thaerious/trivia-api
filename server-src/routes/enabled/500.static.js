import express from "express";

const router = express.Router();

router.use(express.static(`www`));
router.use(express.static(`emails`));

export default router;