export interface MovieData {
  title: string;
  genre: string;
  rating: number;
  streamingLink: string;
  director?: string;
}

export interface UpdateMovieData {
  title?: string;
  genre?: string;
  rating?: number;
  streamingLink?: string;
  director?: string;
}
