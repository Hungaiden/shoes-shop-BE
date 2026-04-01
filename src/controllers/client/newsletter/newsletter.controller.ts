import type { Request, Response } from "express";
import * as newsletterService from "../../../services/admin/marketing/newsletter.service";
import type {
  ResponseDetailSuccess,
  ResponseFailure,
} from "../../../utils/types/ResponseTypes";

export const subscribe = async (req: Request, res: Response) => {
  try {
    const result = await newsletterService.subscribe(req.body?.email);

    const message = result.isNew
      ? "Đăng ký nhận bản tin thành công"
      : result.reactivated
        ? "Đăng ký nhận bản tin thành công (đã kích hoạt lại)"
        : "Email này đã đăng ký nhận bản tin";

    const response: ResponseDetailSuccess<typeof result.subscriber> = {
      code: 200,
      message,
      data: result.subscriber,
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ResponseFailure = {
      code: 400,
      timestamp: new Date().toISOString(),
      path: req.path,
      message: error.message || "Đăng ký nhận bản tin thất bại",
      errors: [],
    };

    res.status(400).json(response);
  }
};
