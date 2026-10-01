import { Department } from '../models/Department';
import { User } from '../models/User';
import { cache } from '../config/redis';

export class DepartmentService {
  static async getAllDepartments() {
    return Department.find()
      .populate('hodId', 'firstName lastName fullName email phone')
      .sort({ name: 1 });
  }

  static async getDepartmentById(id: string) {
    const dept = await Department.findById(id).populate('hodId', 'firstName lastName fullName email phone');
    if (!dept) throw new Error('Department not found');
    return dept;
  }

  static async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
    hodId?: string;
  }) {
    const existing = await Department.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error('Department code already exists');

    const department = await Department.create({
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description || null,
      hodId: data.hodId || null,
    });

    if (data.hodId) {
      await User.findByIdAndUpdate(data.hodId, { role: 'HOD' });
    }

    await cache.delByPattern('department');
    return this.getDepartmentById((department._id as any).toString());
  }

  static async assignHod(departmentId: string, hodId: string) {
    const dept = await Department.findById(departmentId);
    if (!dept) throw new Error('Department not found');

    const user = await User.findById(hodId);
    if (!user) throw new Error('User not found');

    dept.hodId = user._id as any;
    await dept.save();

    user.role = 'HOD';
    await user.save();

    await cache.delByPattern('department');
    return this.getDepartmentById(departmentId);
  }
}
