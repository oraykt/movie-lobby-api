import mongoose from 'mongoose'

const directorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }]
})

export default mongoose.model('Director', directorSchema)
