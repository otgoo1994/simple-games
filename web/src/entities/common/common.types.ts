export type CategoryType = {
  seq: number;
  category_name: string;
};

export type getSeriesListRequestType = {
  category_id?: number;
  name?: string;
  release_day?: number;
};

export type SelectType = {
  value: number;
  label: string;
};

export type FileType = {
  seq: number;
  name: string;
  download_url: string;
  is_public: boolean;
};

export type CreateCommentRequestType = {
  series_id: number;
  parent_id: number | null;
  comment: string;
};

export type WebtoonType = {
  seq: number;
  view_cnt: number;
  name: string;
  chapter_count: number;
  categories: {
    category_name: string;
    category_id: number;
  }[];
  description: string;
  file: FileType;
  updated_date: string;
  end_yn: 'Y' | 'N';
  is_adult: 'Y' | 'N';
  category_name?: string;
  file_id?: string;
  chapter?: string;
  series_id?: number;
};

export type ChapterType = {
  seq: number;
  file_id: number;
  name: string;
  chapter: string;
  series_id: number;
  category_name: string;
  is_adult: 'Y' | 'N';
  categories: {
    category_name: string;
    category_id: number;
  }[];
};

export type ChapterListType = {
  seq: number;
  chapter: number;
  created_date: string;
};

export type WebtoonDetailType = {
  seq: number;
  view_cnt: number;
  file_id: number;
  name: string;
  description: string;
  end_yn: 'Y' | 'N';
  is_adult: 'Y' | 'N';
  chapters: ChapterListType[];
};

export type LoggedUserType = {
  seq: number;
  email: string;
  username: string;
  token: string;
};

export type PriceType = {
  seq: number;
  plan_name: string;
  price: number;
};
