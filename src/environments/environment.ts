// Same-origin: in dev the Angular proxy (proxy.conf.json) forwards /api to the API host,
// in production the API is hosted under the same site. Keeping it same-origin is what lets
// the SameSite=Strict refresh cookie work.
export const environment = {
  production: false,
  apiUrl: '/api'
};
