import type { Request, Response } from "express";
import * as newsletterService from "../../../services/admin/marketing/newsletter.service";
import type {
  ResponseDetailSuccess,
  ResponseFailure,
  ResponseListSuccess,
} from "../../../utils/types/ResponseTypes";

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const result = await newsletterService.getSubscribers({
      keyword: req.query.keyword as string,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    });

    const response: ResponseListSuccess<typeof result.hits> = {
      code: 200,
      message: "Lấy danh sách subscriber thành công",
      data: {
        hits: result.hits,
        pagination: result.pagination,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Lỗi khi lấy danh sách subscriber",
      errors: [],
    };

    res.status(500).json(response);
  }
};

export const updateSubscriberStatus = async (req: Request, res: Response) => {
  try {
    if (typeof req.body?.isActive !== "boolean") {
      const badRequest: ResponseFailure = {
        code: 400,
        timestamp: new Date().toISOString(),
        path: req.path,
        message: "isActive phải là boolean",
        errors: [],
      };
      res.status(400).json(badRequest);
      return;
    }

    const updated = await newsletterService.updateSubscriberStatus(
      req.params.id,
      req.body.isActive,
    );

    const response: ResponseDetailSuccess<typeof updated> = {
      code: 200,
      message: "Cập nhật subscriber thành công",
      data: updated,
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Lỗi khi cập nhật subscriber",
      errors: [],
    };

    res.status(400).json(response);
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await newsletterService.createCampaign(req.body);

    const response: ResponseDetailSuccess<typeof campaign> = {
      code: 201,
      message: "Tạo campaign thành công",
      data: campaign,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Tạo campaign thất bại",
      errors: [],
    };

    res.status(400).json(response);
  }
};

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const result = await newsletterService.getCampaigns({
      keyword: req.query.keyword as string,
      status: req.query.status as "draft" | "sent",
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    });

    const response: ResponseListSuccess<typeof result.hits> = {
      code: 200,
      message: "Lấy danh sách campaign thành công",
      data: {
        hits: result.hits,
        pagination: result.pagination,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Lỗi khi lấy danh sách campaign",
      errors: [],
    };

    res.status(500).json(response);
  }
};

export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const result = await newsletterService.sendCampaign(req.params.id);

    const response: ResponseDetailSuccess<typeof result> = {
      code: 200,
      message: "Gửi campaign thành công",
      data: result,
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Gửi campaign thất bại",
      errors: [],
    };

    res.status(400).json(response);
  }
};
