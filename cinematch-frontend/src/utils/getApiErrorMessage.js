export default function getApiErrorMessage(err, fallback) {
  const data = err.response?.data;

  if (data?.message) {
    return data.message;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((error) => error.msg).join(', ');
  }

  return fallback;
}
