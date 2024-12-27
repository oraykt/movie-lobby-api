export interface MovieData {
  title: string;
  genre: string;
  rating: number;
  streamingLink: string;
}

export interface UpdateMovieData {
  title?: string;
  genre?: string;
  rating?: number;
  streamingLink?: string;
}
