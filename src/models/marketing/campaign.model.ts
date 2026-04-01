import mongoose from "mongoose";

export type CampaignStatus = "draft" | "sent";

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Campaign = mongoose.model("Campaign", campaignSchema, "campaigns");
