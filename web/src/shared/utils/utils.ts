/* eslint-disable import/no-extraneous-dependencies */
import { clsx } from 'clsx';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const getUserInfo = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const user = jwtDecode(token);
  return user;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const timeDistanceMinute = (time: string) => {
  const date = dayjs(time);
  const now = dayjs(Date.now());
  const minute = now.diff(date, 'minute');
  return minute;
};

export const timeDistance = (time: string) => {
  // API-аас ирж байгаа цагийг CEST (UTC+2) гэж үзнэ
  const date = dayjs.utc(time);
  const now = dayjs.tz(new Date(), 'Asia/Ulaanbaatar');

  const minute = now.diff(date, 'minute');

  if (minute < 60) {
    return `${minute} минутын өмнө`;
  }

  const hour = now.diff(date, 'hour');

  if (hour < 24) {
    return `${hour} цагийн өмнө`;
  }

  const day = now.diff(date, 'day');

  if (day < 31) {
    return `${day} өдрийн өмнө`;
  }

  const month = now.diff(date, 'month');
  if (month < 12) {
    return `${month} сарын өмнө`;
  }

  const year = now.diff(date, 'year');
  return `${year} жилийн өмнө`;
};

export const timeDistanceWithDays = (time: string) => {
  // API-аас ирж байгаа цагийг CEST (UTC+2) гэж үзнэ
  const date = dayjs.utc(time);
  const now = dayjs.tz(new Date(), 'Asia/Ulaanbaatar');

  const day = date.diff(now, 'day');
  return day;
};

export const isEmpty = (str: string) => {
  // return /^\s*$/.test(str);
  // return /^(?:\s|<br\s*\/?>|<p>\s*<br\s*\/?>\s*<\/p>|<p>\s*<br\s*\/?>\s*<\/p>)*$/i.test(str);
  return /^(?:\s|&nbsp;|<br\s*\/?>|<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>)*$/i.test(str);
};
