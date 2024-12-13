const clientId = 'f4f7609452665ab';  // Updated to match the working client ID from final.html
const username = 'ekbalwebsite';

async function fetchImgurImages() {
    const container = document.getElementById('image-container');
    container.innerHTML = '<div class="loading">Loading images...</div>';

    try {
        // First try to get images directly from account
        const response = await fetch(`https://api.imgur.com/3/account/${username}/images`, {
            headers: {
                'Authorization': `Client-ID ${clientId}`,
                'Accept': 'application/json'
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
            // If no direct images, try getting albums
            const albumsResponse = await fetch(`https://api.imgur.com/3/account/${username}/albums`, {
                headers: {
                    'Authorization': `Client-ID ${clientId}`,
                    'Accept': 'application/json'
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
                            'Authorization': `Client-ID ${clientId}`,
                            'Accept': 'application/json'
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
                    : 'Error loading images. Please check credentials or try again later.'}
            </div>`;
    }
}

// Call the function when the page loads
window.addEventListener('DOMContentLoaded', fetchImgurImages);
