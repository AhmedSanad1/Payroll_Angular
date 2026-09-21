// Live build. apiUrl stays relative so the SPA and the API share an origin
// (http://216.219.83.248:550/api) -- that is what keeps the SameSite=Strict
// refresh cookie working. Swapped in for environment.ts by the production
// configuration's fileReplacements in angular.json.
export const environment = {
  production: true,
  apiUrl: '/api'
};
