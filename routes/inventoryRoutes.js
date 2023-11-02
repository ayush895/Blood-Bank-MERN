const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createInventoryController,
  getInventoryController,
  getDonarController,
  getHospitalController,
  getOrganisationController,
  getOrganisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
} = require("../controllers/inventoryController");

const router = express.Router();

//routes
//Add Inventory ||POST
router.post("/create-inventory", authMiddleware, createInventoryController);

//Get all blood records ||GET
router.get("/get-inventory", authMiddleware, getInventoryController);

//Get Recent blood records ||GET
router.get(
  "/get-recent-inventory",
  authMiddleware,
  getRecentInventoryController
);

//Get Hospital blood records ||POST
router.post(
  "/get-inventory-hospital",
  authMiddleware,
  getInventoryHospitalController
);

//Get Donar records ||GET
router.get("/get-donars", authMiddleware, getDonarController);

//Get Hospital Records ||GET
router.get("/get-hospital", authMiddleware, getHospitalController);

//Get Organisation Profile ||GET
router.get("/get-organisation", authMiddleware, getOrganisationController);

// Get Organisation For Hospital Profile ||GET
router.get(
  "/get-organisation-for-hospital",
  authMiddleware,
  getOrganisationForHospitalController
);

module.exports = router;
