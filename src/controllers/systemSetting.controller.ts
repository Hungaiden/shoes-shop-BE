import { Request, Response } from "express";
import { SystemSetting } from "../models/settings/systemSetting";

export const getSystemSetting = async (req: Request, res: Response) => {
  try {
    const setting = await SystemSetting.findOne();
    if (!setting) {
      res.status(404).json({
        success: false,
        message: "System setting not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateSystemSetting = async (req: Request, res: Response) => {
  try {
    const {
      websiteName,
      contactEmail,
      phoneNumber,
      address,
      currency,
      timeZone,
      logoUrl,
    } = req.body;

    let setting = await SystemSetting.findOne();

    if (!setting) {
      setting = new SystemSetting({
        websiteName,
        contactEmail,
        phoneNumber,
        address,
        currency,
        timeZone,
        logoUrl,
      });
    } else {
      setting.websiteName = websiteName || setting.websiteName;
      setting.contactEmail = contactEmail || setting.contactEmail;
      setting.phoneNumber = phoneNumber || setting.phoneNumber;
      setting.address = address || setting.address;
      setting.currency = currency || setting.currency;
      setting.timeZone = timeZone || setting.timeZone;
      setting.logoUrl = logoUrl || setting.logoUrl;
    }

    await setting.save();

    res.status(200).json({
      success: true,
      data: setting,
      message: "System setting updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createSystemSetting = async (req: Request, res: Response) => {
  try {
    const {
      websiteName,
      contactEmail,
      phoneNumber,
      address,
      currency,
      timeZone,
      logoUrl,
    } = req.body;

    const existingSetting = await SystemSetting.findOne();
    if (existingSetting) {
      res.status(400).json({
        success: false,
        message: "System setting already exists. Please use update instead.",
      });
      return;
    }

    const setting = new SystemSetting({
      websiteName,
      contactEmail,
      phoneNumber,
      address,
      currency,
      timeZone,
      logoUrl,
    });

    await setting.save();

    res.status(201).json({
      success: true,
      data: setting,
      message: "System setting created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
