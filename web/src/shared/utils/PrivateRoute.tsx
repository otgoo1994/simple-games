import { ReactNode } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CommonQuery, WebtoonDetailType } from '~/entities/common';
import { Loading } from '~/shared/components';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const chapter = searchParams.get('chapter');

  const { data: seriesDetail, isLoading: seriesLoading } = useQuery(
    CommonQuery.getSingleSeries(Number(id)),
  );

  if (seriesLoading || !seriesDetail) {
    return <Loading />;
  }

  // if (!seriesDetail.data || seriesDetail.data.length <= 0) {
  //   return <ErrorPage type="NOTFOUND" />;
  // }

  if (seriesDetail.data[0].is_adult === 'N') {
    if (chapter) {
      const value = Number(chapter);
      if (value >= 0 && value <= 3) {
        return children;
      }
    }
  }

  const userInfo = localStorage.getItem('loggedUser');
  return userInfo ? children : <ErrorPage type="NEEDTOLOGIN" />;
};
