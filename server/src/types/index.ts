import { Request } from 'express';

export type UserRole =
  | 'ADMIN'
  | 'STUDENT'
  | 'FACULTY'
  | 'MENTOR'
  | 'WARDEN'
  | 'HOD'
  | 'PARENT';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type StudentStatus =
  | 'ACTIVE'
  | 'GRADUATED'
  | 'SUSPENDED'
  | 'ALUMNI'
  | 'DROPPED';

export type HostelCode =
  | 'BH1'
  | 'BH2'
  | 'BH3'
  | 'BH4'
  | 'GH1'
  | 'GH2'
  | 'GH3';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'VISITING';

export type ParentRelation = 'FATHER' | 'MOTHER' | 'GUARDIAN';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
