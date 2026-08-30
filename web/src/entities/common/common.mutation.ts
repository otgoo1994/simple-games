import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '~/shared/api';
import { URL } from './common.constants';
import { CreateCommentRequestType } from './common.types';

export const useAddComment = () => {
  return useMutation({
    mutationFn: async (params: CreateCommentRequestType) => {
      return axiosInstance.post(`${URL.comment}`, params);
    },
  });
};
