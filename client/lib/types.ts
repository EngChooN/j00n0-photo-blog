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

export type ProjectStatus = 'ongoing' | 'completed';

export type ProjectSummary = {
  id: string;
  title: string;
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
  project: ProjectSummary | null;
};

export type ProjectListItem = {
  id: string;
  title: string;
  concept: string | null;
  coverPhotoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { posts: number };
};

// Posts inside a project response don't carry the project relation back —
// the parent project is the context. This narrower shape makes that explicit.
export type ProjectPost = Omit<Post, 'project'>;

export type ProjectDetail = {
  id: string;
  title: string;
  concept: string | null;
  coverPhotoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  posts: ProjectPost[];
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
