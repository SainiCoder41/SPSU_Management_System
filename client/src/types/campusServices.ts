export interface ILibraryBook {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
}

export interface IBookIssue {
  _id: string;
  book: ILibraryBook;
  student: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  finePaid: boolean;
  status: 'Issued' | 'Returned' | 'Overdue';
}

export interface IPlacementDrive {
  _id: string;
  companyName: string;
  roleTitle: string;
  ctcPackageLPA: number;
  eligibilityCgpa: number;
  eligibleDepartments: Array<{ _id: string; name: string; code: string }>;
  driveDate: string;
  registrationDeadline: string;
  location: string;
  description: string;
  status: 'Active' | 'Closed' | 'Upcoming';
}

export interface IPlacementApplication {
  _id: string;
  drive: IPlacementDrive;
  student: any;
  resumeUrl?: string;
  appliedDate: string;
  status: 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected';
  feedback?: string;
}

export interface IVisitorLog {
  _id: string;
  visitorName: string;
  phone: string;
  relation: string;
  studentVisited?: any;
  hostelBlock?: any;
  purpose: string;
  checkIn: string;
  checkOut?: string;
  gateNumber: string;
  status: 'Inside' | 'CheckedOut';
}
