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
    const gallery = document.getElementById('gallery');
    const apiUrl = 'https://api.github.com/repos/A7mdmohamed04/private/contents/images';
    
    try {
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        // Get file metadata to sort by upload date
        const filePromises = files.map(async file => {
            const commitResponse = await fetch(`https://api.github.com/repos/A7mdmohamed04/private/commits?path=images/${file.name}&page=1&per_page=1`);
            const commits = await commitResponse.json();
            const commitMessage = commits[0].commit.message;
            let description = '';
            
            // Extract description from commit message
            if (commitMessage.includes('Description:')) {
                description = commitMessage.split('Description:')[1].trim();
            }
            
            return {
                ...file,
                uploadDate: new Date(commits[0].commit.author.date),
                description: description
            };
        });

        const filesWithDates = await Promise.all(filePromises);
        
        // Remove loading spinner
        gallery.innerHTML = '';
        
        // Sort files by upload date, newest first
        const sortedFiles = filesWithDates.sort((a, b) => b.uploadDate - a.uploadDate);
        
        // Group files by upload time (rounded to nearest minute)
        const groupedFiles = {};
        sortedFiles.forEach(file => {
            if (file.type === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
                // Round to nearest minute to group files uploaded close together
                const date = new Date(file.uploadDate);
                date.setSeconds(0, 0);
                const timeKey = date.getTime();
                
                if (!groupedFiles[timeKey]) {
                    groupedFiles[timeKey] = {
                        date: file.uploadDate,
                        files: [],
                        description: file.description // Store description at group level
                    };
                }
                groupedFiles[timeKey].files.push(file);
            }
        });

        // Create posts for each group
        Object.values(groupedFiles).forEach(group => {
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
            time.textContent = getRelativeTime(group.date);
            
            postInfo.appendChild(username);
            postInfo.appendChild(time);
            
            postHeader.appendChild(avatar);
            postHeader.appendChild(postInfo);
            
            post.appendChild(postHeader);

            // Add description before images if present
            if (group.description) {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'post-description';
                descriptionDiv.textContent = group.description;
                post.appendChild(descriptionDiv);
            }
            
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'post-images';
            
            // Add layout class based on number of images
            const imageCount = group.files.length;
            if (imageCount === 1) {
                imagesContainer.classList.add('single');
            } else if (imageCount === 2) {
                imagesContainer.classList.add('double');
            } else if (imageCount === 3) {
                imagesContainer.classList.add('triple');
            } else if (imageCount === 4) {
                imagesContainer.classList.add('quad');
            } else {
                imagesContainer.classList.add('many');
            }

            // Store the group's images for fullscreen navigation
            const groupImages = [];
            
            group.files.forEach(file => {
                const img = document.createElement('img');
                img.src = file.download_url;
                img.alt = file.description || file.name;
                groupImages.push(file.download_url);
                
                img.addEventListener('click', () => {
                    openFullscreen(groupImages, groupImages.indexOf(file.download_url));
                });
                
                imagesContainer.appendChild(img);
            });
            
            post.appendChild(imagesContainer);
            
            gallery.appendChild(post);
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        gallery.innerHTML = '<p>This page is under development right now, please check back later.</p>';
    }
}

// Fullscreen functionality
const overlay = document.querySelector('.fullscreen-overlay');
const fullscreenImg = document.querySelector('.fullscreen-image');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.nav-arrow.prev');
const nextBtn = document.querySelector('.nav-arrow.next');

let currentImages = [];
let currentIndex = 0;
let startY = 0;
let currentY = 0;

function openFullscreen(images, index) {
    currentImages = images;
    currentIndex = index;
    showCurrentImage();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showCurrentImage() {
    fullscreenImg.src = currentImages[currentIndex];
    updateArrowVisibility();
}

function updateArrowVisibility() {
    if (window.innerWidth > 768) {
        prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = currentIndex < currentImages.length - 1 ? 'block' : 'none';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

function closeFullscreen() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

closeBtn.addEventListener('click', closeFullscreen);

function navigateImage(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < currentImages.length) {
        if (window.innerWidth <= 768) {
        
            fullscreenImg.classList.add(direction > 0 ? 'slide-left' : 'slide-right');
            
            setTimeout(() => {
                currentIndex = newIndex;
                showCurrentImage();
                fullscreenImg.classList.remove('slide-left', 'slide-right');
                fullscreenImg.classList.add('slide-reset');
                
                setTimeout(() => {
                    fullscreenImg.classList.remove('slide-reset');
                }, 300);
            }, 300);
        } else {
            currentIndex = newIndex;
            showCurrentImage();
        }
    }
}

prevBtn.addEventListener('click', () => navigateImage(-1));
nextBtn.addEventListener('click', () => navigateImage(1));
overlay.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
});

overlay.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 100) {
        closeFullscreen();
    }
});
let touchStartX = 0;
overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

overlay.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) > 50) { 
        if (diff > 0 && currentIndex > 0) {
            navigateImage(-1);
        } else if (diff < 0 && currentIndex < currentImages.length - 1) {
            navigateImage(1);
        }
    }
});

fetchImages();
