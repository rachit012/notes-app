import { Request, Response } from 'express';
import Note from '../models/Note';
import { IUser } from '../models/User';

export const getNotes = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = req.user as IUser;
    const notes = await Note.find({ user: user._id }).sort({ createdAt: -1 });
    res.status(200).json(notes);
};

export const createNote = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const user = req.user as IUser;
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    const note = await Note.create({
        title: content.substring(0, 20),
        content,
        user: user._id,
    });
    res.status(201).json(note);
};

export const deleteNote = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const user = req.user as IUser;
    const note = await Note.findById(req.params.id);
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }
    if (note.user.toString() !== user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to delete this note' });
    }
    
    await Note.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Note deleted successfully' });
};