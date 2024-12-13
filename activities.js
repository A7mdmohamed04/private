function getAuthorizationUrl() {
    const clientId = 'a9746a36a69f8f9'; // Your Client ID
    const redirectUri = 'https://achievement.ekbal.site/activities'; // Your redirect URI
    const state = 'random_state'; // Random string for CSRF protection
  
    const url = `https://api.imgur.com/oauth2/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}`;
    window.location.href = url; // Redirect the user to Imgur authorization page
  }
  function exchangeCodeForToken(code) {
    const clientId = 'a9746a36a69f8f9'; // Your Client ID
    const clientSecret = '1d63430cfa8494cc2a66851935ff0a9fb2057f28'; // Your Client Secret
    const redirectUri = 'https://achievement.ekbal.site/activities'; // Your redirect URI
  
    const data = new URLSearchParams();
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);
    data.append('code', code);
    data.append('grant_type', 'authorization_code');
    data.append('redirect_uri', redirectUri);
  
    fetch('https://api.imgur.com/oauth2/token', {
      method: 'POST',
      body: data
    })
      .then(response => response.json())
      .then(data => {
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;
  
        localStorage.setItem('access_token', accessToken); // Save token in localStorage
        localStorage.setItem('refresh_token', refreshToken); // Save refresh token in localStorage
      })
      .catch(error => console.error('Error exchanging code for token:', error));
  }
  function uploadImageToImgur(imageFile) {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.log('No access token found, please authenticate first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', imageFile);
  
    fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Image uploaded successfully:', data.data.link);
        } else {
          console.log('Image upload failed:', data.data.error);
        }
      })
      .catch(error => console.error('Error uploading image:', error));
  }
  function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.log('No refresh token found, please authenticate first.');
      return;
    }
  
    const clientId = 'a9746a36a69f8f9'; // Your Client ID
    const clientSecret = '1d63430cfa8494cc2a66851935ff0a9fb2057f28'; // Your Client Secret
  
    const data = new URLSearchParams();
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);
    data.append('refresh_token', refreshToken);
    data.append('grant_type', 'refresh_token');
  
    fetch('https://api.imgur.com/oauth2/token', {
      method: 'POST',
      body: data
    })
      .then(response => response.json())
      .then(data => {
        const accessToken = data.access_token;
        const newRefreshToken = data.refresh_token;
  
        localStorage.setItem('access_token', accessToken); // Update access token
        localStorage.setItem('refresh_token', newRefreshToken); // Update refresh token
      })
      .catch(error => console.error('Error refreshing token:', error));
  }
  function handleRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
  
    if (code) {
      exchangeCodeForToken(code); // Exchange code for tokens
    } else {
      console.log('No authorization code in URL');
    }
  }
          