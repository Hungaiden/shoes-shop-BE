import { Campaign } from "../../../models/marketing/campaign.model";
import { Subscriber } from "../../../models/marketing/subscriber.model";
import { sendNewsletterCampaignEmails } from "../../../providers/sendMail";

type PaginationParams = {
  offset?: number;
  limit?: number;
};

type SubscriberQuery = PaginationParams & {
  keyword?: string;
  isActive?: boolean;
};

type CampaignQuery = PaginationParams & {
  keyword?: string;
  status?: "draft" | "sent";
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const subscribe = async (emailRaw: string) => {
  const email = normalizeEmail(emailRaw);

  if (!email || !EMAIL_REGEX.test(email)) {
    throw new Error("Email không hợp lệ");
  }

  const existing = await Subscriber.findOne({ email });

  if (existing) {
    if (existing.isActive) {
      return {
        subscriber: existing,
        isNew: false,
        reactivated: false,
      };
    }

    existing.isActive = true;
    await existing.save();

    return {
      subscriber: existing,
      isNew: false,
      reactivated: true,
    };
  }

  const subscriber = await Subscriber.create({ email, isActive: true });

  return {
    subscriber,
    isNew: true,
    reactivated: false,
  };
};

export const getSubscribers = async ({
  offset = 0,
  limit = 20,
  keyword,
  isActive,
}: SubscriberQuery) => {
  const query: Record<string, unknown> = {};

  if (keyword?.trim()) {
    query.email = { $regex: keyword.trim(), $options: "i" };
  }

  if (typeof isActive === "boolean") {
    query.isActive = isActive;
  }

  const totalRows = await Subscriber.countDocuments(query);
  const safeOffset = offset > totalRows ? 0 : offset;

  const hits = await Subscriber.find(query)
    .sort({ createdAt: -1 })
    .skip(safeOffset)
    .limit(limit)
    .lean();

  return {
    hits,
    pagination: {
      totalRows,
      totalPages: Math.ceil(totalRows / limit),
    },
  };
};

export const updateSubscriberStatus = async (id: string, isActive: boolean) => {
  const updated = await Subscriber.findByIdAndUpdate(
    id,
    { isActive },
    { new: true },
  ).lean();

  if (!updated) {
    throw new Error("Không tìm thấy subscriber");
  }

  return updated;
};

export const createCampaign = async (payload: {
  title: string;
  subject: string;
  content: string;
}) => {
  const title = String(payload.title || "").trim();
  const subject = String(payload.subject || "").trim();
  const content = String(payload.content || "").trim();

  if (!title || !subject || !content) {
    throw new Error("Thiếu thông tin campaign");
  }

  const campaign = await Campaign.create({
    title,
    subject,
    content,
    status: "draft",
    sentAt: null,
  });

  return campaign;
};

export const getCampaigns = async ({
  offset = 0,
  limit = 20,
  keyword,
  status,
}: CampaignQuery) => {
  const query: Record<string, unknown> = {};

  if (keyword?.trim()) {
    query.$or = [
      { title: { $regex: keyword.trim(), $options: "i" } },
      { subject: { $regex: keyword.trim(), $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  const totalRows = await Campaign.countDocuments(query);
  const safeOffset = offset > totalRows ? 0 : offset;

  const hits = await Campaign.find(query)
    .sort({ createdAt: -1 })
    .skip(safeOffset)
    .limit(limit)
    .lean();

  return {
    hits,
    pagination: {
      totalRows,
      totalPages: Math.ceil(totalRows / limit),
    },
  };
};

export const sendCampaign = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    throw new Error("Không tìm thấy campaign");
  }

  if (campaign.status === "sent") {
    throw new Error("Campaign đã được gửi trước đó");
  }

  const subscribers = await Subscriber.find({ isActive: true })
    .select("email")
    .lean();

  const emails = subscribers
    .map((item) => item.email)
    .filter((email): email is string => Boolean(email));

  if (emails.length === 0) {
    throw new Error("Không có subscriber đang hoạt động để gửi mail");
  }

  const sentCount = await sendNewsletterCampaignEmails({
    emails,
    subject: campaign.subject,
    title: campaign.title,
    content: campaign.content,
  });

  campaign.status = "sent";
  campaign.sentAt = new Date();
  await campaign.save();

  return {
    campaign,
    sentCount,
  };
};
