const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

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
                time.textContent = 'School Activities';
                
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
