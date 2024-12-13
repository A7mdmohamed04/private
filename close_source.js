document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});

document.addEventListener('mousedown', function(e) {
    if (e.button === 2) {
        e.preventDefault();
    }
});

document.querySelectorAll('iframe').forEach(function(iframe) {
    if (iframe.src.includes('youtube.com')) {
        iframe.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }
});
