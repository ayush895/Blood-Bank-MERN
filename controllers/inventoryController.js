const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

//create Inventory
const createInventoryController = async (req, res) => {
  try {
    const { email } = req.body;
    //validation
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    // if (inventoryType === "in" && user.role !== "donar") {
    //   throw new Error("Not a donar account");
    // }
    // if (inventoryType === "out" && user.role !== "hospital") {
    //   throw new Error("Not a hospital");
    // }

    if (req.body.inventoryType == "out") {
      const requestedBloodGroup = req.body.bloodGroup;
      const requestedQuantityOfBlood = req.body.quantity;
      const organisation = new mongoose.Types.ObjectId(req.body.userId);
      // Calculate IN Blood Quantity
      const totalInOfRequestedBlood = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: { _id: "$bloodGroup", total: { $sum: "$quantity" } },
        },
      ]);
      // console.log("Total In", totalInOfRequestedBlood);
      const totalIn = totalInOfRequestedBlood[0]?.total || 0;

      // Calculate OUT Blood Quantity
      const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

      // IN & OUT calc.
      const availableQuantityOfBloodGroup = totalIn - totalOut;
      //Quantity Validation
      if (availableQuantityOfBloodGroup < requestedQuantityOfBlood) {
        return res.status(500).send({
          success: false,
          message: `Only ${availableQuantityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
        });
      }
      req.body.hospital = user?._id;
    } else {
      req.body.donar = user?._id;
    }
    //save record
    const inventory = new inventoryModel(req.body);
    await inventory.save();
    return res.status(201).send({
      success: true,
      message: "New blood record added",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create Inventory API",
      error,
    });
  }
};

//GET all blood records
const getInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({
        organisation: req.body.userId,
      })
      .populate("donar")
      .populate("hospital")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "get all records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get all Inventory",
      error,
    });
  }
};

//GET Hospital blood records
const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find(req.body.filters)
      .populate("donar")
      .populate("hospital")
      .populate("organisation")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "get hospital consumer records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Get consumer Inventory",
      error,
    });
  }
};

//Get Blood Record Of 3
const getRecentInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({
        organisation: req.body.userId,
      })
      .limit(3)
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "recent Inventory Data",
      inventory,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Recent Inventory API",
      error,
    });
  }
};
// Get Donar Records
const getDonarController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    //find Donars
    const donarId = await inventoryModel.distinct("donar", {
      organisation,
    });
    // console.log(donarId);
    const donars = await userModel.find({ _id: { $in: donarId } });
    return res.status(200).send({
      success: true,
      message: "Donar Record Fetched Successfully",
      donars,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donar Records",
      error,
    });
  }
};

// Get Hospital Records
const getHospitalController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    //Get Hospital ID
    const hospitalId = await inventoryModel.distinct("hospital", {
      organisation,
    });
    //FIND hospital
    const hospitals = await userModel.find({ _id: { $in: hospitalId } });
    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in get Hospital API",
      error,
    });
  }
};

//Get ORG Profiles
const getOrganisationController = async (req, res) => {
  try {
    const donar = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { donar });
    //find ORG
    const organisations = await userModel.find({
      _id: { $in: orgId },
    });
    return res.status(200).send({
      success: true,
      message: "ORG Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in ORG API",
      error,
    });
  }
};

// Get ORG for Hospital Profiles
const getOrganisationForHospitalController = async (req, res) => {
  try {
    const hospital = req.body.userId;
    const orgId = await inventoryModel.distinct("organisation", { hospital });
    //find ORG
    const organisations = await userModel.find({
      _id: { $in: orgId },
    });
    return res.status(200).send({
      success: true,
      message: "Hospital ORG Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Hospital ORG API",
      error,
    });
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getDonarController,
  getHospitalController,
  getOrganisationController,
  getOrganisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
};
