import mongoose, { Schema, Document } from 'mongoose'

/**
 * Interface representing a Movie document in MongoDB
 * @interface IMovie
 * @extends {Document}
 */
export interface IMovie extends Document {
  /** Title of the movie */
  title: string;
  /** Genre of the movie */
  genre: string;
  /** Rating of the movie (0-10) */
  rating: number;
  /** Streaming URL where the movie can be watched */
  streamingLink: string;
}

/**
 * Mongoose schema for the Movie model
 * @constant MovieSchema
 */
const MovieSchema: Schema = new Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 10 },
  streamingLink: { type: String, required: false }
})

export default mongoose.model<IMovie>('Movie', MovieSchema)
