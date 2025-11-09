export const getBackendUrl = (): string => {
  const url = process.env.REACT_APP_EZ_BACKEND_URL;
  if (!url) {
    throw new Error('REACT_APP_EZ_BACKEND_URL is not configured');
  }
  return url;
};

export const isBackendConfigured = (): boolean => {
  return !!process.env.REACT_APP_EZ_BACKEND_URL;
};
