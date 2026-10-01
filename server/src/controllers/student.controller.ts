import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export class StudentController {
  static async getStudents(req: Request, res: Response) {
    try {
      const filters = {
        page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 20,
        search: req.query.search ? String(req.query.search) : undefined,
        branch: req.query.branch ? String(req.query.branch) : undefined,
        semester: req.query.semester ? parseInt(String(req.query.semester), 10) : undefined,
        batch: req.query.batch ? String(req.query.batch) : undefined,
        section: req.query.section ? String(req.query.section) : undefined,
        hostelCode: req.query.hostel ? String(req.query.hostel) : undefined,
        gender: req.query.gender ? String(req.query.gender) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
      };

      const result = await StudentService.getStudents(filters);
      return sendSuccess({
        res,
        message: 'Students fetched successfully',
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch students');
    }
  }

  static async getStudentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await StudentService.getStudentById(id);
      return sendSuccess({ res, message: 'Student details', data: student });
    } catch (error: any) {
      return sendError(res, 404, error.message || 'Student not found');
    }
  }

  static async createStudent(req: Request, res: Response) {
    try {
      const student = await StudentService.createStudent(req.body);
      return sendSuccess({ res, statusCode: 201, message: 'Student created successfully', data: student });
    } catch (error: any) {
      return sendError(res, 400, error.message || 'Failed to create student');
    }
  }

  static async updateStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await StudentService.updateStudent(id, req.body);
      return sendSuccess({ res, message: 'Student updated successfully', data: student });
    } catch (error: any) {
      return sendError(res, 400, error.message || 'Failed to update student');
    }
  }

  static async getMyProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'Unauthorized');
      const student = await StudentService.getStudentById(req.user.userId);
      return sendSuccess({ res, message: 'Personal profile', data: student });
    } catch (error: any) {
      return sendError(res, 404, error.message || 'Student profile not found');
    }
  }
}
