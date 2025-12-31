
import { Request, Response } from 'express';
import { User } from '../models/User';

// Using any for req and res to resolve Property 'body', 'status', 'json' errors in the current environment
export const signup = async (req: any, res: any) => {
  try {
    const { name, phone, password, role, wardId } = req.body;
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      name,
      phone,
      passwordHash: password, // Note: Use bcrypt in production
      role,
      wardId
    });

    await newUser.save();
    res.status(201).json({ 
      id: newUser._id, 
      name: newUser.name, 
      phone: newUser.phone, 
      role: newUser.role, 
      wardId: newUser.wardId 
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Using any for req and res to resolve Property 'body', 'status', 'json' errors in the current environment
export const login = async (req: any, res: any) => {
  try {
    const { phone, password, role } = req.body;
    const user = await User.findOne({ phone, passwordHash: password, role });
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    res.json({ 
      id: user._id, 
      name: user.name, 
      phone: user.phone, 
      role: user.role, 
      wardId: user.wardId 
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
