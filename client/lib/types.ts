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
  likeCount: number;
  photos: Photo[];
};

export type Comment = {
  id: string;
  postId: string;
  name: string;
  body: string;
  createdAt: string;
};

export type LikeStatus = {
  likeCount: number;
  liked: boolean;
};

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};
