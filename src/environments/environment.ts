export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  auth: {
    domain: 'dev-a6yruv50gcerao6w.us.auth0.com',
    clientId: 'eOX4VCRHMlVnAoOXsW81GRZvrthMQCKJ',
    audience: 'https://dev-a6yruv50gcerao6w.us.auth0.com/api/v2/',
    redirectUri: `${window.location.origin}/callback`, 
    logoutUrl: `${window.location.origin}/`,
    returnTo: `${window.location.origin}/login`,            
  }
};