const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

function getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

async function fetchImages() {
    const apiUrl = 'https://api.github.com/repos/A7mdmohamed04/private/contents/images';
    
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        const gallery = document.getElementById('gallery');
        
        // Get file metadata to sort by upload date
        const filePromises = files.map(async file => {
            const commitResponse = await fetch(`https://api.github.com/repos/A7mdmohamed04/private/commits?path=images/${file.name}&page=1&per_page=1`);
            const commits = await commitResponse.json();
            return {
                ...file,
                uploadDate: new Date(commits[0].commit.author.date)
            };
        });

        const filesWithDates = await Promise.all(filePromises);
        
        // Sort files by upload date, newest first
        const sortedFiles = filesWithDates.sort((a, b) => b.uploadDate - a.uploadDate);
        
        sortedFiles.forEach(file => {
            if (file.type === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
                const post = document.createElement('div');
                post.className = 'post';
                
                const postHeader = document.createElement('div');
                postHeader.className = 'post-header';
                
                const avatar = document.createElement('div');
                avatar.className = 'post-avatar';
                
                const postInfo = document.createElement('div');
                postInfo.className = 'post-info';
                
                const username = document.createElement('div');
                username.className = 'post-username';
                username.textContent = 'El Ekbal School';
                
                const time = document.createElement('div');
                time.className = 'post-time';
                time.textContent = getRelativeTime(file.uploadDate);
                
                postInfo.appendChild(username);
                postInfo.appendChild(time);
                
                postHeader.appendChild(avatar);
                postHeader.appendChild(postInfo);
                
                const img = document.createElement('img');
                img.src = file.download_url;
                img.alt = file.name;
                
                post.appendChild(postHeader);
                post.appendChild(img);
                gallery.appendChild(post);
            }
        });
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

fetchImages();
