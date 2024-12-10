document.getElementById('download-btn').addEventListener('click', function() {
    const link = document.createElement('a');
    link.href = 'your-video.mp4'; // Replace with your video file link
    link.download = 'video.mp4'; // Replace with the desired file name
    link.click();
});

document.getElementById('description-btn').addEventListener('click', function() {
    const description = document.getElementById('description');
    description.classList.toggle('hidden');
});
