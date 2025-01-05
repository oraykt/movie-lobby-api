import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  streamingLink: { type: String, required: true },
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Director',
    required: false
  }
})

export default mongoose.model('Movie', movieSchema)
