import axios from 'axios';
import { useCallback, useMemo } from 'react';

const toastSettings = {
  autoClose: 3000,
  hideProgressBar: true,
  pauseOnHover: false,
  draggable: false,
};

export const useApiError = () => {
  const statusHandlers = useMemo(
    () => ({
      400: (msg: string) => {
        console.log(`400 Error:: ${msg}`, toastSettings);
      },
      401: (msg: string, errorCode: string) => {
        if (errorCode === 'ER-COMM-1001') {
          console.log('로그인 세션이 만료가 되었습니다. 다시 로그인 해주세요.', toastSettings);
        } else {
          console.log(`401 Error:: ${msg}`, toastSettings);
        }
      },
      403: (msg: string) => console.log(`403 Error:: ${msg}`, toastSettings),
      404: (msg: string) => console.log(`404 Error:: ${msg}`, toastSettings),
      500: () => console.log('500 Error:: 서버 오류가 발생했습니다.', toastSettings),
      default: () => console.log('서버에서 알 수 없는 오류가 발생했습니다.', toastSettings),
    }),
    [],
  );

  const handleError = useCallback(
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const httpStatus = error.response?.status;
          const errorResponse = error.response?.data;
          const httpMessage = errorResponse.message
            ? errorResponse.message
            : errorResponse.head.message;
          const httpErrorCode = errorResponse.error
            ? errorResponse.error || null
            : errorResponse.head.code || null;
          const handle =
            httpStatus && statusHandlers[httpStatus as keyof typeof statusHandlers]
              ? statusHandlers[httpStatus as keyof typeof statusHandlers]
              : statusHandlers.default;

          handle(httpMessage, httpErrorCode);
        } else {
          console.log('서버 연결이 원활하지 않습니다.', toastSettings);
        }
      } else {
        console.log('네트워크 연결 오류 또는 기타 오류가 발생했습니다', toastSettings);
      }
    },
    [statusHandlers],
  );

  return { handleError };
};
