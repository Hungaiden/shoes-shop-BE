import type { Request, Response } from "express";
import * as dashboardService from "../../../services/admin/dashboard/dashboard.service";
import type {
    ResponseDetailSuccess,
    ResponseFailure,
} from "../../../utils/types/ResponseTypes";

export const getDashboardSummary = async (req: Request, res: Response) => {
    console.log("getDashboardSummary called");
    try {
        const summary = await dashboardService.getDashboardSummary();
        const response: ResponseDetailSuccess<typeof summary> = {
            code: 200,
            message: "Lấy thông tin dashboard thành công",
            data: summary,
        };
        res.status(200).json(response);
    } catch (error: any) {
        const response: ResponseFailure = {
            code: 500,
            timestamp: new Date().toISOString(),
            path: req.path,
            message: error.message,
            errors: [],
        };
        res.status(500).json(response);
    }
};
