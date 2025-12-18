// EgoMAN Gallery State
let egomanAllVideos = [];
let egomanFilteredVideos = [];
let egomanCurrentPage = 1;
const egomanVideosPerPage = 12;

// HOT3D Gallery State
let hot3dAllVideos = [];
let hot3dFilteredVideos = [];
let hot3dCurrentPage = 1;
const hot3dVideosPerPage = 12;

// Video base path
const VIDEO_BASE_PATH = './static/trajectory_videos_pred_vs_gt/';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Load video metadata
    if (typeof VIDEO_METADATA !== 'undefined') {
        // Separate videos by dataset
        egomanAllVideos = VIDEO_METADATA.filter(v => v.dataset === 'egoman');
        hot3dAllVideos = VIDEO_METADATA.filter(v => v.dataset === 'hot3d');

        egomanFilteredVideos = [...egomanAllVideos];
        hot3dFilteredVideos = [...hot3dAllVideos];

        // Populate filter dropdowns
        populateEgomanFilters();
        populateHot3dFilters();

        // Add event listeners for EgoMAN filters
        document.getElementById('egoman-filter-hand').addEventListener('change', applyEgomanFilters);
        document.getElementById('egoman-filter-verb').addEventListener('change', applyEgomanFilters);
        document.getElementById('egoman-filter-object').addEventListener('change', applyEgomanFilters);
        document.getElementById('egoman-filter-scene').addEventListener('change', applyEgomanFilters);

        // Add event listeners for HOT3D filters
        document.getElementById('hot3d-filter-hand').addEventListener('change', applyHot3dFilters);
        document.getElementById('hot3d-filter-object').addEventListener('change', applyHot3dFilters);
        document.getElementById('hot3d-filter-pid').addEventListener('change', applyHot3dFilters);

        // Display initial videos
        displayEgomanVideos();
        displayHot3dVideos();

        console.log(`Loaded ${egomanAllVideos.length} EgoMAN videos and ${hot3dAllVideos.length} HOT3D videos`);
    } else {
        console.error('VIDEO_METADATA not loaded. Make sure video_metadata.js is included.');
    }
});

// ===== EgoMAN Functions =====

function populateEgomanFilters() {
    const verbs = new Set();
    const objects = new Set();
    const scenes = new Set();

    egomanAllVideos.forEach(video => {
        if (video.verb !== 'unknown') verbs.add(video.verb);
        if (video.object !== 'unknown') objects.add(video.object);
        scenes.add(video.scene);
    });

    // Populate verb filter
    const verbSelect = document.getElementById('egoman-filter-verb');
    Array.from(verbs).sort().forEach(verb => {
        const option = document.createElement('option');
        option.value = verb;
        option.textContent = capitalizeFirst(verb);
        verbSelect.appendChild(option);
    });

    // Populate object filter
    const objectSelect = document.getElementById('egoman-filter-object');
    Array.from(objects).sort().forEach(obj => {
        const option = document.createElement('option');
        option.value = obj;
        option.textContent = capitalizeFirst(obj);
        objectSelect.appendChild(option);
    });

    // Populate scene filter
    const sceneSelect = document.getElementById('egoman-filter-scene');
    Array.from(scenes).sort().forEach(scene => {
        const option = document.createElement('option');
        option.value = scene;
        option.textContent = scene.split('_').map(capitalizeFirst).join(' ');
        sceneSelect.appendChild(option);
    });
}

function applyEgomanFilters() {
    const handFilter = document.getElementById('egoman-filter-hand').value;
    const verbFilter = document.getElementById('egoman-filter-verb').value;
    const objectFilter = document.getElementById('egoman-filter-object').value;
    const sceneFilter = document.getElementById('egoman-filter-scene').value;

    egomanFilteredVideos = egomanAllVideos.filter(video => {
        if (handFilter !== 'all' && video.hand !== handFilter) return false;
        if (verbFilter !== 'all' && video.verb !== verbFilter) return false;
        if (objectFilter !== 'all' && video.object !== objectFilter) return false;
        if (sceneFilter !== 'all' && video.scene !== sceneFilter) return false;
        return true;
    });

    egomanCurrentPage = 1;
    displayEgomanVideos();
}

function resetEgomanFilters() {
    document.getElementById('egoman-filter-hand').value = 'all';
    document.getElementById('egoman-filter-verb').value = 'all';
    document.getElementById('egoman-filter-object').value = 'all';
    document.getElementById('egoman-filter-scene').value = 'all';
    applyEgomanFilters();
}

function displayEgomanVideos() {
    const container = document.getElementById('egoman-video-container');
    const videoCount = document.getElementById('egoman-video-count');

    // Clear container
    container.innerHTML = '';

    // Calculate pagination
    const totalPages = Math.ceil(egomanFilteredVideos.length / egomanVideosPerPage);
    const startIdx = (egomanCurrentPage - 1) * egomanVideosPerPage;
    const endIdx = Math.min(startIdx + egomanVideosPerPage, egomanFilteredVideos.length);
    const pageVideos = egomanFilteredVideos.slice(startIdx, endIdx);

    // Update video count
    videoCount.textContent = `Showing ${startIdx + 1}-${endIdx} of ${egomanFilteredVideos.length} videos`;

    // Display videos
    pageVideos.forEach(video => {
        const videoItem = createVideoElement(video);
        container.appendChild(videoItem);
    });

    // Update pagination controls
    updateEgomanPaginationControls(totalPages);
}

function updateEgomanPaginationControls(totalPages) {
    const pageInfo = document.getElementById('egoman-page-info');
    const prevBtn = document.getElementById('egoman-prev-btn');
    const nextBtn = document.getElementById('egoman-next-btn');

    pageInfo.textContent = `Page ${egomanCurrentPage} of ${totalPages}`;

    prevBtn.disabled = egomanCurrentPage === 1;
    nextBtn.disabled = egomanCurrentPage === totalPages || totalPages === 0;
}

function previousEgomanPage() {
    if (egomanCurrentPage > 1) {
        egomanCurrentPage--;
        displayEgomanVideos();
        scrollToEgomanSection();
    }
}

function nextEgomanPage() {
    const totalPages = Math.ceil(egomanFilteredVideos.length / egomanVideosPerPage);
    if (egomanCurrentPage < totalPages) {
        egomanCurrentPage++;
        displayEgomanVideos();
        scrollToEgomanSection();
    }
}

function scrollToEgomanSection() {
    const section = document.getElementById('egoman-video-container').closest('section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== HOT3D Functions =====

function populateHot3dFilters() {
    const objects = new Set();
    const pids = new Set();

    hot3dAllVideos.forEach(video => {
        if (video.object !== 'unknown') objects.add(video.object);
        if (video.p_id) pids.add(video.p_id);
    });

    // Populate object filter
    const objectSelect = document.getElementById('hot3d-filter-object');
    Array.from(objects).sort().forEach(obj => {
        const option = document.createElement('option');
        option.value = obj;
        option.textContent = capitalizeFirst(obj);
        objectSelect.appendChild(option);
    });

    // Populate P-ID filter
    const pidSelect = document.getElementById('hot3d-filter-pid');
    Array.from(pids).sort().forEach(pid => {
        const option = document.createElement('option');
        option.value = pid;
        option.textContent = pid;
        pidSelect.appendChild(option);
    });
}

function applyHot3dFilters() {
    const handFilter = document.getElementById('hot3d-filter-hand').value;
    const objectFilter = document.getElementById('hot3d-filter-object').value;
    const pidFilter = document.getElementById('hot3d-filter-pid').value;

    hot3dFilteredVideos = hot3dAllVideos.filter(video => {
        if (handFilter !== 'all' && video.hand !== handFilter) return false;
        if (objectFilter !== 'all' && video.object !== objectFilter) return false;
        if (pidFilter !== 'all' && video.p_id !== pidFilter) return false;
        return true;
    });

    hot3dCurrentPage = 1;
    displayHot3dVideos();
}

function resetHot3dFilters() {
    document.getElementById('hot3d-filter-hand').value = 'all';
    document.getElementById('hot3d-filter-object').value = 'all';
    document.getElementById('hot3d-filter-pid').value = 'all';
    applyHot3dFilters();
}

function displayHot3dVideos() {
    const container = document.getElementById('hot3d-video-container');
    const videoCount = document.getElementById('hot3d-video-count');

    // Clear container
    container.innerHTML = '';

    // Calculate pagination
    const totalPages = Math.ceil(hot3dFilteredVideos.length / hot3dVideosPerPage);
    const startIdx = (hot3dCurrentPage - 1) * hot3dVideosPerPage;
    const endIdx = Math.min(startIdx + hot3dVideosPerPage, hot3dFilteredVideos.length);
    const pageVideos = hot3dFilteredVideos.slice(startIdx, endIdx);

    // Update video count
    videoCount.textContent = `Showing ${startIdx + 1}-${endIdx} of ${hot3dFilteredVideos.length} videos`;

    // Display videos
    pageVideos.forEach(video => {
        const videoItem = createHot3dVideoElement(video);
        container.appendChild(videoItem);
    });

    // Update pagination controls
    updateHot3dPaginationControls(totalPages);
}

function updateHot3dPaginationControls(totalPages) {
    const pageInfo = document.getElementById('hot3d-page-info');
    const prevBtn = document.getElementById('hot3d-prev-btn');
    const nextBtn = document.getElementById('hot3d-next-btn');

    pageInfo.textContent = `Page ${hot3dCurrentPage} of ${totalPages}`;

    prevBtn.disabled = hot3dCurrentPage === 1;
    nextBtn.disabled = hot3dCurrentPage === totalPages || totalPages === 0;
}

function previousHot3dPage() {
    if (hot3dCurrentPage > 1) {
        hot3dCurrentPage--;
        displayHot3dVideos();
        scrollToHot3dSection();
    }
}

function nextHot3dPage() {
    const totalPages = Math.ceil(hot3dFilteredVideos.length / hot3dVideosPerPage);
    if (hot3dCurrentPage < totalPages) {
        hot3dCurrentPage++;
        displayHot3dVideos();
        scrollToHot3dSection();
    }
}

function scrollToHot3dSection() {
    const section = document.getElementById('hot3d-video-container').closest('section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== Shared Functions =====

function createVideoElement(video) {
    const column = document.createElement('div');
    column.className = 'column is-one-third video-item';

    const videoElement = document.createElement('video');
    videoElement.src = VIDEO_BASE_PATH + video.filename;
    videoElement.controls = true;
    videoElement.loop = true;
    videoElement.preload = 'metadata';
    videoElement.muted = true;

    // Add hover play effect
    let isPlaying = false;

    videoElement.addEventListener('mouseenter', function () {
        const playPromise = this.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
            }).catch(error => {
                console.log('Autoplay prevented:', error);
            });
        }
    });

    videoElement.addEventListener('mouseleave', function () {
        if (isPlaying) {
            this.pause();
            this.currentTime = 0;
            isPlaying = false;
        }
    });

    const caption = document.createElement('div');
    caption.className = 'video-caption';
    caption.textContent = capitalizeFirst(video.description);

    const metadata = document.createElement('div');
    metadata.className = 'video-metadata';
    metadata.innerHTML = `
        <span class="tag is-info is-light">${capitalizeFirst(video.hand)} Hand</span>
        <span class="tag is-success is-light">${capitalizeFirst(video.verb)}</span>
        <span class="tag is-warning is-light">${capitalizeFirst(video.object)}</span>
        <span class="tag is-link is-light">${video.scene.split('_').map(capitalizeFirst).join(' ')}</span>
    `;

    column.appendChild(videoElement);
    column.appendChild(caption);
    column.appendChild(metadata);

    return column;
}

function createHot3dVideoElement(video) {
    const column = document.createElement('div');
    column.className = 'column is-one-third video-item';

    const videoElement = document.createElement('video');
    videoElement.src = VIDEO_BASE_PATH + video.filename;
    videoElement.controls = true;
    videoElement.loop = true;
    videoElement.preload = 'metadata';
    videoElement.muted = true;

    // Add hover play effect
    let isPlaying = false;

    videoElement.addEventListener('mouseenter', function () {
        const playPromise = this.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
            }).catch(error => {
                console.log('Autoplay prevented:', error);
            });
        }
    });

    videoElement.addEventListener('mouseleave', function () {
        if (isPlaying) {
            this.pause();
            this.currentTime = 0;
            isPlaying = false;
        }
    });

    const caption = document.createElement('div');
    caption.className = 'video-caption';
    caption.textContent = capitalizeFirst(video.description);

    const metadata = document.createElement('div');
    metadata.className = 'video-metadata';
    metadata.innerHTML = `
        <span class="tag is-light">${video.p_id || 'N/A'}</span>
        <span class="tag is-info is-light">${capitalizeFirst(video.hand)} Hand</span>
        <span class="tag is-success is-light">${capitalizeFirst(video.verb)}</span>
        <span class="tag is-warning is-light">${capitalizeFirst(video.object)}</span>
        <span class="tag is-link is-light">${video.scene.split('_').map(capitalizeFirst).join(' ')}</span>
    `;

    column.appendChild(videoElement);
    column.appendChild(caption);
    column.appendChild(metadata);

    return column;
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== Comparison Section Functions =====

function parseComparisonFilename(filename) {
    const parts = filename.split('.jpg_');
    if (parts.length !== 2) {
        return null;
    }

    const imageName = parts[0] + '.jpg';
    const remaining = parts[1].replace('.mp4', '');

    const lastUnderscore = remaining.lastIndexOf('_');
    const number = remaining.substring(lastUnderscore + 1);
    const fullIntention = remaining.substring(0, lastUnderscore);

    let intentionText = fullIntention.replace(/^(left|right|both)-hand-/, '');
    let specificAction = intentionText;

    intentionText = intentionText.replace(/-/g, ' ');
    specificAction = specificAction.replace(/-/g, ' ');

    return {
        imageName: imageName,
        intention: intentionText,
        specificAction: specificAction,
        number: parseInt(number),
        filename: filename
    };
}

function groupVideosByImage(videos) {
    const groups = {};

    videos.forEach(video => {
        const parsed = parseComparisonFilename(video);
        if (!parsed) return;

        if (!groups[parsed.imageName]) {
            groups[parsed.imageName] = {
                imageName: parsed.imageName,
                intentions: {}
            };
        }

        if (!groups[parsed.imageName].intentions[parsed.intention]) {
            groups[parsed.imageName].intentions[parsed.intention] = [];
        }

        groups[parsed.imageName].intentions[parsed.intention].push({
            filename: video,
            number: parsed.number,
            specificAction: parsed.specificAction
        });
    });

    Object.values(groups).forEach(group => {
        Object.values(group.intentions).forEach(videos => {
            videos.sort((a, b) => a.number - b.number);
        });
    });

    return groups;
}

function createComparisonHTML(group) {
    const container = document.createElement('div');
    container.className = 'video-comparison';

    const grid = document.createElement('div');
    grid.className = 'comparison-grid';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'input-image-container';
    imageContainer.innerHTML = `
        <img src="./static/images/${group.imageName}"
             class="input-image"
             alt="Input frame"
             onerror="this.style.display='none'">
        <div class="input-image-label">Input Frame</div>
    `;

    const contentContainer = document.createElement('div');
    const videosContainer = document.createElement('div');
    videosContainer.className = 'comparison-videos-container';

    // Collect all videos from all intentions and flatten them
    const allVideos = [];
    Object.entries(group.intentions).forEach(([intention, videos]) => {
        videos.forEach(video => {
            allVideos.push({
                ...video,
                intention: intention
            });
        });
    });

    // Display all videos (4 videos in 2x2 grid)
    allVideos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'comparison-video-item';
        videoItem.innerHTML = `
            <video controls loop preload="metadata" muted>
                <source src="./static/duo_select/${video.filename}" type="video/mp4">
            </video>
            <div class="comparison-video-label">
                ${capitalizeFirst(video.intention)}
            </div>
        `;

        const videoElement = videoItem.querySelector('video');
        let isPlaying = false;

        videoElement.addEventListener('mouseenter', function () {
            const playPromise = this.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                }).catch(() => { });
            }
        });

        videoElement.addEventListener('mouseleave', function () {
            if (isPlaying) {
                this.pause();
                this.currentTime = 0;
                isPlaying = false;
            }
        });

        videosContainer.appendChild(videoItem);
    });

    contentContainer.appendChild(videosContainer);
    grid.appendChild(imageContainer);
    grid.appendChild(contentContainer);
    container.appendChild(grid);

    return container;
}

function loadComparisons() {
    const videos = [
                '20230731_s1_angela_mclean_act3_nwakzz_videostamp_0151_923.89_928.88_timestamp_0.0_1.5.jpg_poke-food-on-plate-with-fork-with-left-hand_6.mp4',
                '20230731_s1_angela_mclean_act3_nwakzz_videostamp_0151_923.89_928.88_timestamp_0.0_1.5.jpg_retrieve-fork-on-stovetop-with-right-hand_0.mp4',
                '20230731_s1_angela_mclean_act3_nwakzz_videostamp_0151_923.89_928.88_timestamp_0.0_1.5.jpg_open-oven-door-with-right-hand_6.mp4',
                '20230731_s1_angela_mclean_act3_nwakzz_videostamp_0151_923.89_928.88_timestamp_0.0_1.5.jpg_turn-on-stove-with-left-hand_2.mp4'
            ];

    const groups = groupVideosByImage(videos);
    const container = document.getElementById('comparisons-container');

    if (container) {
        Object.values(groups).forEach(group => {
            const comparisonElement = createComparisonHTML(group);
            container.appendChild(comparisonElement);
        });

        console.log(`Loaded ${Object.keys(groups).length} comparison groups`);
    }
}

// Initialize comparisons when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadComparisons();
});
