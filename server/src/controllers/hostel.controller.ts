import { Request, Response } from 'express';
import { HostelService } from '../services/hostel.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class HostelController {
  static async getHostels(req: Request, res: Response) {
    try {
      const hostels = await HostelService.getAllHostels();
      return sendSuccess({ res, message: 'Hostel list', data: hostels });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch hostels');
    }
  }

  static async getHostelById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hostel = await HostelService.getHostelById(id);
      return sendSuccess({ res, message: 'Hostel details', data: hostel });
    } catch (error: any) {
      return sendError(res, 404, error.message || 'Hostel not found');
    }
  }

  static async assignWarden(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { wardenId } = req.body;
      const hostel = await HostelService.assignWarden(id, wardenId);
      return sendSuccess({ res, message: 'Warden assigned to hostel successfully', data: hostel });
    } catch (error: any) {
      return sendError(res, 400, error.message || 'Failed to assign warden');
    }
  }

  static async getHostelStudents(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const students = await HostelService.getHostelStudents(id);
      return sendSuccess({ res, message: 'Hostel residents', data: students });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch hostel residents');
    }
  }
}
