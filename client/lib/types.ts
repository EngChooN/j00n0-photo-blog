export type Photo = {
  id: string;
  postId: string;
  src: string;
  width: number;
  height: number;
  position: number;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  caption: string;
  location: string;
  takenAt: string;
  createdAt: string;
  photos: Photo[];
};

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};
