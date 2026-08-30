import dayjs from 'dayjs';

export const formatDate = (date: dayjs.ConfigType, format: string = 'YYYY.MM.DD') => {
  if (!date || (date && !dayjs(date).isValid())) return '';
  return dayjs(date.toString()).format(format);
};

export const parseDate = (date: dayjs.ConfigType) => {
  if (!date || (date && !dayjs(date).isValid())) return null;
  return dayjs(date).toDate();
};
