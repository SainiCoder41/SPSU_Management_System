import { Request, Response } from 'express';
import { Hostel } from '../models/Hostel.js';
import { Student } from '../models/Student.js';
import { cache } from '../config/redis.js';

export const getHostels = async (req: Request, res: Response): Promise<void> => {
  try {
    const hostels = await Hostel.find()
      .populate({
        path: 'warden',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort({ name: 1 });

    // Sync accurate occupancy counts
    const hostelsWithOccupancy = await Promise.all(
      hostels.map(async (h) => {
        const count = await Student.countDocuments({ hostel: h._id });
        return {
          ...h.toObject(),
          occupancy: count,
        };
      })
    );

    res.status(200).json({ success: true, count: hostelsWithOccupancy.length, data: hostelsWithOccupancy });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching hostels' });
  }
};

export const createHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, capacity, warden, description } = req.body;

    const existing = await Hostel.findOne({ name: name.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: `Hostel '${name}' already exists` });
      return;
    }

    const hostel = new Hostel({
      name: name.toUpperCase(),
      type,
      capacity: capacity || 100,
      warden: warden || null,
      description,
    });
    await hostel.save();

    await cache.del('admin:stats');

    res.status(201).json({ success: true, message: 'Hostel block registered successfully', data: hostel });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating hostel' });
  }
};

export const updateHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, capacity, warden, description } = req.body;
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      res.status(404).json({ success: false, message: 'Hostel not found' });
      return;
    }

    if (name) hostel.name = name.toUpperCase();
    if (type) hostel.type = type;
    if (capacity !== undefined) hostel.capacity = capacity;
    if (warden !== undefined) hostel.warden = warden || null;
    if (description !== undefined) hostel.description = description;

    await hostel.save();
    await cache.del('admin:stats');

    const updated = await Hostel.findById(hostel._id).populate({
      path: 'warden',
      populate: { path: 'user', select: 'name email phone' },
    });

    res.status(200).json({ success: true, message: 'Hostel updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating hostel' });
  }
};
