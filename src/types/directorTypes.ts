export interface DirectorData {
  fullName: string;
  genre: string;
  movies?: string[]; // Array of movie IDs
}

export interface UpdateDirectorData {
  fullName?: string;
  genre?: string;
  movies?: string[];
}
