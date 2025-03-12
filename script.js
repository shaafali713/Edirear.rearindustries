const YOUTUBE_API_KEY = "AIzaSyChm0thF6dU-MW-2_INOGRDwcfsn0mjO7E";
const GOOGLE_DRIVE_CLIENT_ID = "YOUR_GOOGLE_DRIVE_CLIENT_ID"; // Replace with your Google Drive Client ID

let currentUser = null;
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
let watchHistory = JSON.parse(localStorage.getItem("watchHistory")) || [];

// Handle Google Login
function handleGoogleLogin(response) {
    const credential = response.credential;
    fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
        .then((response) => response.json())
        .then((data) => {
            currentUser = data; // Save user data
            console.log("Logged in as:", currentUser.name);
            document.getElementById("login-button").innerText = "👤 Logout";
        })
        .catch((error) => {
            console.error("Login error:", error);
        });
}

// Logout
function logout() {
    currentUser = null;
    document.getElementById("login-button").innerText = "👤 Login";
    console.log("Logged out");
}

// Load Home Page
function loadHome() {
    document.getElementById("home-page").style.display = "block";
    document.getElementById("shorts-page").style.display = "none";
    document.getElementById("channel-page").style.display = "none";
    document.getElementById("video-player").style.display = "none";
    fetchYouTubeVideos();
}

// Load Shorts Page
function loadShorts() {
    document.getElementById("home-page").style.display = "none";
    document.getElementById("shorts-page").style.display = "block";
    document.getElementById("channel-page").style.display = "none";
    document.getElementById("video-player").style.display = "none";
    fetchShorts();
}

// Load Channel Page
function loadChannel(channelId) {
    document.getElementById("home-page").style.display = "none";
    document.getElementById("shorts-page").style.display = "none";
    document.getElementById("channel-page").style.display = "block";
    document.getElementById("video-player").style.display = "none";
    fetchChannelDetails(channelId);
}

// Fetch YouTube Videos
function fetchYouTubeVideos(query = "trending") {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&type=video&key=${YOUTUBE_API_KEY}`)
        .then((response) => response.json())
        .then((data) => displayVideos(data.items))
        .catch((error) => console.error("YouTube API error:", error));
}

// Display Videos
function displayVideos(videos) {
    const container = document.getElementById("videos-container");
    container.innerHTML = "";
    videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add("video");
        videoElement.innerHTML = `
            <img src="${video.snippet.thumbnails.medium.url}" onclick="playVideo('${video.id.videoId}', '${video.snippet.title}')">
            <div class="video-info">
                <img src="${video.snippet.thumbnails.default.url}" onclick="loadChannel('${video.snippet.channelId}')">
                <div>
                    <h4>${video.snippet.title}</h4>
                    <p>${video.snippet.channelTitle}</p>
                </div>
            </div>
        `;
        container.appendChild(videoElement);
    });
}

// Play Video
function playVideo(videoId, title) {
    document.getElementById("home-page").style.display = "none";
    document.getElementById("shorts-page").style.display = "none";
    document.getElementById("channel-page").style.display = "none";
    document.getElementById("video-player").style.display = "block";
    document.getElementById("player").src = `https://www.youtube.com/embed/${videoId}`;
    document.getElementById("video-title").innerText = title;

    // Save Watch History
    watchHistory.push({ id: videoId, title: title });
    localStorage.setItem("watchHistory", JSON.stringify(watchHistory));

    // Track Video View in Google Analytics
    gtag('event', 'view_video', {
        video_id: videoId,
        video_title: title,
    });

    // Show Ad
    showAd();

    // Fetch Suggested Videos
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&relatedToVideoId=${videoId}&type=video&key=${YOUTUBE_API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            const suggestedContainer = document.getElementById("suggested-videos");
            suggestedContainer.innerHTML = "";
            data.items.forEach((video) => {
                const videoElement = document.createElement("div");
                videoElement.classList.add("video");
                videoElement.innerHTML = `
                    <img src="${video.snippet.thumbnails.medium.url}" onclick="playVideo('${video.id.videoId}', '${video.snippet.title}')">
                    <div class="video-info">
                        <img src="${video.snippet.thumbnails.default.url}" onclick="loadChannel('${video.snippet.channelId}')">
                        <div>
                            <h4>${video.snippet.title}</h4>
                            <p>${video.snippet.channelTitle}</p>
                        </div>
                    </div>
                `;
                suggestedContainer.appendChild(videoElement);
            });
        });
}

// Show Ad
function showAd() {
    const adContainer = document.getElementById("ad-container");
    adContainer.innerHTML = `
        <script type="text/javascript">
            atOptions = {
                'key' : 'df4d795569fc7b9dbff68a958a746434',
                'format' : 'iframe',
                'height' : 60,
                'width' : 468,
                'params' : {}
            };
        </script>
        <script type="text/javascript" src="//thermometerpushfulabnegate.com/df4d795569fc7b9dbff68a958a746434/invoke.js"></script>
    `;
}

// Fetch Shorts
function fetchShorts() {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=shorts&type=video&key=${YOUTUBE_API_KEY}`)
        .then((response) => response.json())
        .then((data) => displayShorts(data.items))
        .catch((error) => console.error("YouTube API error:", error));
}

// Display Shorts
function displayShorts(shorts) {
    const container = document.getElementById("shorts-container");
    container.innerHTML = "";
    shorts.forEach((short) => {
        const shortElement = document.createElement("div");
        shortElement.classList.add("short");
        shortElement.innerHTML = `
            <video src="https://www.youtube.com/embed/${short.id.videoId}" autoplay controls></video>
            <div class="short-actions">
                <button onclick="downloadShort('${short.id.videoId}')">⬇ Download</button>
            </div>
        `;
        container.appendChild(shortElement);
    });
}

// Download Short to Google Drive
function downloadShort(videoId) {
    const url = `https://www.youtube.com/embed/${videoId}`;
    alert("Downloading short to Google Drive...");
    // Implement Google Drive API integration here
}

// Fetch Channel Details
function fetchChannelDetails(channelId) {
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`)
        .then((response) => response.json())
        .then((data) => displayChannelDetails(data.items[0]))
        .catch((error) => console.error("YouTube API error:", error));
}

// Display Channel Details
function displayChannelDetails(channel) {
    const channelInfo = document.getElementById("channel-info");
    channelInfo.innerHTML = `
        <img src="${channel.snippet.thumbnails.default.url}">
        <div>
            <h2>${channel.snippet.title}</h2>
            <p>${channel.statistics.subscriberCount} subscribers</p>
        </div>
    `;

    // Fetch Channel Videos
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&maxResults=10&type=video&key=${YOUTUBE_API_KEY}`)
        .then((response) => response.json())
        .then((data) => displayChannelVideos(data.items))
        .catch((error) => console.error("YouTube API error:", error));
}

// Display Channel Videos
function displayChannelVideos(videos) {
    const container = document.getElementById("channel-videos");
    container.innerHTML = "";
    videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add("video");
        videoElement.innerHTML = `
            <img src="${video.snippet.thumbnails.medium.url}" onclick="playVideo('${video.id.videoId}', '${video.snippet.title}')">
            <div class="video-info">
                <h4>${video.snippet.title}</h4>
                <p>${video.snippet.channelTitle}</p>
            </div>
        `;
        container.appendChild(videoElement);
    });
}

// Search Videos
function searchVideos() {
    const query = document.getElementById("search-bar").value;
    searchHistory.push(query);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    fetchYouTubeVideos(query);
}

// Load Profile
function loadProfile() {
    if (!currentUser) {
        alert("Please login to view your profile.");
        return;
    }
    alert("Watch History: " + JSON.stringify(watchHistory));
}

// Initialize Google OAuth
function initializeGoogleOAuth() {
    google.accounts.id.initialize({
        client_id: "844845318549-v7r609qm7mgsnvmiouric89kr2radpnr.apps.googleusercontent.com", // Your Google OAuth Client ID
        callback: handleGoogleLogin,
    });
    google.accounts.id.renderButton(
        document.getElementById("login-button"),
        { theme: "outline", size: "large" }
    );
}

// Initial Load
initializeGoogleOAuth();
loadHome();