export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const signIn = async () => {
  localStorage.setItem('isAuthenticated', 'true');
};

export const signOut = async () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
