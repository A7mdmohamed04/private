
// Mobile menu functionality
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Imgur gallery functionality
const clientId = 'd5b111ef2ac3796';
const username = 'ekbalwebsite';

async function fetchImgurImages() {
    const container = document.getElementById('image-container');
    container.innerHTML = '<div class="loading">Loading images...</div>';

    try {
        const response = await fetch(`https://api.imgur.com/3/account/${username}/images/0`, {
            headers: {
                'Authorization': `Client-ID ${clientId}`,
                'Access-Control-Allow-Origin': '*'
            }
        });

        if (response.status === 403) {
            throw new Error('Access forbidden. Please check your API credentials.');
        }

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
            throw new Error('No images found');
        }

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="error">
                ${error.message === 'Access forbidden. Please check your API credentials.' 
                    ? 'Access forbidden. Please check your API credentials.'
                    : error.message === 'No images found'
                        ? 'No images found for this account. Please verify the username.'
                        : 'Error loading images. Please try again later.'}
            </div>`;
    }
}

// Call the function when page loads
fetchImgurImages();
