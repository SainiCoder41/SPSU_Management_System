import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class StaffController {
  static async getStaff(req: Request, res: Response) {
    try {
      const staffList = await StaffService.getStaff();
      return sendSuccess({ res, message: 'Staff list', data: staffList });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch staff');
    }
  }

  static async getStaffById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const staff = await StaffService.getStaffById(id);
      return sendSuccess({ res, message: 'Staff detail', data: staff });
    } catch (error: any) {
      return sendError(res, 404, error.message || 'Staff not found');
    }
  }

  static async createStaff(req: Request, res: Response) {
    try {
      const staff = await StaffService.createStaff(req.body);
      return sendSuccess({ res, statusCode: 201, message: 'Staff member created successfully', data: staff });
    } catch (error: any) {
      return sendError(res, 400, error.message || 'Failed to create staff');
    }
  }
}
