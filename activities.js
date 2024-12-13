const clientId = '300d98e67379ff5';
const clientSecret = 'c93882906705952e3bcd550181dae33e6f3dcba0';
const username = 'ekbalwebsite';

// Get access token using client credentials flow
async function getAccessToken() {
    try {
        const response = await fetch('https://api.imgur.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

async function fetchImgurImages() {
    const container = document.getElementById('image-container');
    container.innerHTML = '<div class="loading">Loading images...</div>';

    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('Failed to get access token');
        }

        const response = await fetch(`https://api.imgur.com/3/account/${username}/images`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        container.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(image => {
                const wrapper = document.createElement('div');
                wrapper.className = 'image-wrapper';
                
                const postHeader = document.createElement('div');
                postHeader.className = 'post-header';
                postHeader.innerHTML = `
                    <div class="post-avatar"></div>
                    <div class="post-info">
                        <div class="post-username">Ekbal Boys</div>
                        <div class="post-time">${new Date(image.datetime * 1000).toLocaleDateString()}</div>
                    </div>
                `;
                
                const img = document.createElement('img');
                img.src = image.link;
                img.className = 'image-item';
                img.alt = image.title || 'Imgur image';
                
                img.onerror = () => {
                    wrapper.remove();
                };

                wrapper.appendChild(postHeader);
                wrapper.appendChild(img);

                if (image.description) {
                    const description = document.createElement('div');
                    description.className = 'post-description';
                    description.textContent = image.description;
                    wrapper.appendChild(description);
                }

                container.appendChild(wrapper);
            });
        } else {
            const albumsResponse = await fetch(`https://api.imgur.com/3/account/${username}/albums`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!albumsResponse.ok) {
                throw new Error('No images or albums found');
            }

            const albumsData = await albumsResponse.json();
            
            if (albumsData.data && albumsData.data.length > 0) {
                for (const album of albumsData.data) {
                    const albumResponse = await fetch(`https://api.imgur.com/3/album/${album.id}/images`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    
                    if (albumResponse.ok) {
                        const albumImages = await albumResponse.json();
                        albumImages.data.forEach(image => {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'image-wrapper';
                            
                            const postHeader = document.createElement('div');
                            postHeader.className = 'post-header';
                            postHeader.innerHTML = `
                                <div class="post-avatar"></div>
                                <div class="post-info">
                                    <div class="post-username">Ekbal Boys</div>
                                    <div class="post-time">${new Date(image.datetime * 1000).toLocaleDateString()}</div>
                                </div>
                            `;
                            
                            const img = document.createElement('img');
                            img.src = image.link;
                            img.className = 'image-item';
                            img.alt = image.title || 'Album image';
                            
                            img.onerror = () => {
                                wrapper.remove();
                            };

                            wrapper.appendChild(postHeader);
                            wrapper.appendChild(img);

                            if (image.description) {
                                const description = document.createElement('div');
                                description.className = 'post-description';
                                description.textContent = image.description;
                                wrapper.appendChild(description);
                            }

                            container.appendChild(wrapper);
                        });
                    }
                }
            }
        }

        if (container.children.length === 0) {
            throw new Error('No images found');
        }

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="error">
                ${error.message === 'No images found' 
                    ? 'No images found for this account. Please verify the username.'
                    : 'Error loading images. Please try again later.'}
            </div>`;
    }
}

// Initialize the image loading
fetchImgurImages();