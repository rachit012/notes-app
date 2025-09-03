import { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  user: Types.ObjectId;
}

const NoteSchema = new Schema<INote>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default model<INote>('Note', NoteSchema);