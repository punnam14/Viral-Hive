// src/utils.js
export const parseQueryString = (queryString) => {
    const params = {};
    const queries = queryString.substring(1).split('&');
    queries.forEach((query) => {
      const [key, value] = query.split('=');
      params[key] = decodeURIComponent(value);
    });
    return params;
  };
  