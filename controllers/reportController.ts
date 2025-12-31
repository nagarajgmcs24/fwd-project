
import { Request, Response } from 'express';
import { Report } from '../models/Report';

// Using any for req and res to resolve Property 'body', 'status', 'json' errors in the current environment
export const submitReport = async (req: any, res: any) => {
  try {
    const { userId, userName, userPhone, wardId, description, image, aiVerificationReason } = req.body;
    
    const newReport = new Report({
      reportId: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId,
      userName,
      userPhone,
      wardId,
      description,
      image,
      aiVerificationReason,
      status: 'PENDING'
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

// Using any for req and res to resolve Property 'query', 'status', 'json' errors in the current environment
export const getReports = async (req: any, res: any) => {
  try {
    const { wardId, userId } = req.query;
    let query: any = {};
    if (wardId) query.wardId = wardId;
    if (userId) query.userId = userId;

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Using any for req and res to resolve Property 'params', 'status', 'json' errors in the current environment
export const verifyReport = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndUpdate(id, { status: 'VERIFIED' }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify report' });
  }
};
