export type Exif = {
  camera?: string;
  lens?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: number;
  focalLength?: string;
};

export type Photo = {
  id: string;
  postId: string;
  src: string;
  width: number;
  height: number;
  position: number;
  exif: Exif | null;
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
  isOwnedByVisitor: boolean;
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
