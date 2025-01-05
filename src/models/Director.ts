import mongoose, { Schema, Document } from 'mongoose'
import { IMovie } from './Movie'

/**
 * Interface representing a Director document in MongoDB
 * @interface IDirector
 * @extends {Document}
 */
export interface IDirector extends Document {
  /** Full name of the director */
  fullName: string;
  /** Preferred genre of the director */
  genre: string;
  /** Reference to movies directed by this director */
  movies: IMovie['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for the Director model
 * @constant DirectorSchema
 */
const DirectorSchema: Schema = new Schema({
  fullName: { type: String, required: true },
  genre: { type: String, required: true },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
}, {
  timestamps: true
})

export default mongoose.model<IDirector>('Director', DirectorSchema)
