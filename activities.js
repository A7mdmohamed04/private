function getAuthorizationUrl() {
    const clientId = 'a9746a36a69f8f9'; // Your Client ID
    const redirectUri = 'https://achievement.ekbal.site/activities'; // Your redirect URI
    const state = crypto.randomUUID(); // Generate secure random state for CSRF protection
  
    // Store state to verify when callback returns
    localStorage.setItem('oauth_state', state);
  
    const url = `https://api.imgur.com/oauth2/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}`;
    window.location.href = url; // Redirect the user to Imgur authorization page
  }
  
  async function exchangeCodeForToken(code) {
    const clientId = 'a9746a36a69f8f9'; // Your Client ID
    const clientSecret = '1d63430cfa8494cc2a66851935ff0a9fb2057f28'; // Your Client Secret
    const redirectUri = 'https://achievement.ekbal.site/activities'; // Your redirect URI
  
    const data = new URLSearchParams();
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);
    data.append('code', code);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', redirectUri);
  
    try {
      const response = await fetch('https://api.imgur.com/oauth2/token', {
        method: 'POST',
        body: data
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const tokenData = await response.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
  
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }
  
  async function uploadImageToImgur(imageFile) {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found, please authenticate first.');
    }
  
    const formData = new FormData();
    formData.append('image', imageFile);
  
    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try refreshing
          await refreshAccessToken();
          // Retry upload with new token
          return await uploadImageToImgur(imageFile);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        return data.data.link;
      } else {
        throw new Error(data.data.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token found, please authenticate first.');
    }
  
    const clientId = 'a9746a36a69f8f9'; // Your Client ID
    const clientSecret = '1d63430cfa8494cc2a66851935ff0a9fb2057f28'; // Your Client Secret
  
    const data = new URLSearchParams();
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);
    data.append('refresh_token', refreshToken);
    data.append('grant_type', 'refresh_token');
  
    try {
      const response = await fetch('https://api.imgur.com/oauth2/token', {
        method: 'POST',
        body: data
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const tokenData = await response.json();
      const accessToken = tokenData.access_token;
      const newRefreshToken = tokenData.refresh_token;
  
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      
      return { accessToken, newRefreshToken };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
  
  async function handleRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('oauth_state');
  
    if (!code) {
      throw new Error('No authorization code in URL');
    }
  
    if (state !== storedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }
  
    localStorage.removeItem('oauth_state'); // Clean up
    return await exchangeCodeForToken(code);
  }