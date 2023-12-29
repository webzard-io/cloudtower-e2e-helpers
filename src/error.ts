export function formatResponseError(error: any) {
  const getErrorValue = () => {
    if (error.name === "AxiosError") {
      return error.response.data;
    }
    return String(error);
  };
  return JSON.stringify({
    error: getErrorValue(),
  });
}
