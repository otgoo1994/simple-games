import { queryOptions } from '@tanstack/react-query';
import { axiosInstance } from '~/shared/api';
import { URL } from './common.constants';
import { getSeriesListRequestType } from './common.types';

export const CommonQuery = {
  all: () => ['home'],
  getSeriesList: ({ category_id, name, release_day }: getSeriesListRequestType) =>
    queryOptions({
      queryKey: [...CommonQuery.all(), 'get-series-list'],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (category_id) {
          params.append('category_id', String(category_id));
        }

        if (name) {
          params.append('name', name);
        }

        if (release_day) {
          params.append('release_day', String(release_day));
        }

        const response = await axiosInstance.get(`${URL.series}?${params.toString()}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getCategoryList: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), 'get-category-list'],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.category}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getMostViewedCategoryList: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), 'get-most-viewed-category-list'],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.mostViewdCategory}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getFreeSeriesCategoryList: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), 'get-free-series-category-list'],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.freeSeriesCategory}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getMostViewedSeriesList: (category_id: number | null) =>
    queryOptions({
      queryKey: [...CommonQuery.all(), 'get-most-viewed-series-list'],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (category_id) {
          params.append('category_id', String(category_id));
        }

        const response = await axiosInstance.get(`${URL.mostViewedSeries}?${params.toString()}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getSingleSeries: (seq: number) =>
    queryOptions({
      queryKey: [...CommonQuery.all(), `get-single-series-${seq}`],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.singleSeries}/${seq}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getPricePlan: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), `get-price-plan`],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.price}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getLastAddedChapters: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), `get-last-added-chapters`],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.lastAddedChapters}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getLastReadChapters: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), `get-last-read-chapters`],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.lastReadChapters}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getSpecialSeriesList: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), `get-special-series-list`],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.specialSeriesList}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),

  getFreeSeriesList: (category_id: number | null) =>
    queryOptions({
      queryKey: [...CommonQuery.all(), 'get-free-series-list'],
      queryFn: async () => {
        const params = new URLSearchParams();

        if (category_id) {
          params.append('category_id', String(category_id));
        }

        const response = await axiosInstance.get(`${URL.freeSeriesList}?${params.toString()}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
  getLoggedUserInfo: () =>
    queryOptions({
      queryKey: [...CommonQuery.all(), `get-logged-user-info`],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.getUserInfo}`);

        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),

  getCommentListBySeriesId: (series_id: number) =>
    queryOptions({
      queryKey: [...CommonQuery.all(), `get-comment-list`],
      queryFn: async () => {
        const response = await axiosInstance.get(`${URL.commentList}/${series_id}`);
        return response.data;
      },
      retry: 1,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }),
};
