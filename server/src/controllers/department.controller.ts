import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class DepartmentController {
  static async getDepartments(req: Request, res: Response) {
    try {
      const departments = await DepartmentService.getAllDepartments();
      return sendSuccess({ res, message: 'Departments list', data: departments });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch departments');
    }
  }

  static async getDepartmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const department = await DepartmentService.getDepartmentById(id);
      return sendSuccess({ res, message: 'Department details', data: department });
    } catch (error: any) {
      return sendError(res, 404, error.message || 'Department not found');
    }
  }

  static async createDepartment(req: Request, res: Response) {
    try {
      const department = await DepartmentService.createDepartment(req.body);
      return sendSuccess({ res, statusCode: 201, message: 'Department created successfully', data: department });
    } catch (error: any) {
      return sendError(res, 400, error.message || 'Failed to create department');
    }
  }

  static async assignHod(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { hodId } = req.body;
      const department = await DepartmentService.assignHod(id, hodId);
      return sendSuccess({ res, message: 'HOD assigned to department successfully', data: department });
    } catch (error: any) {
      return sendError(res, 400, error.message || 'Failed to assign HOD');
    }
  }
}
