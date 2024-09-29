import PlayerScreen from './screens/PlayerScreen';
import GridScreen from './screens/GridScreen';
import MyVizbeeHandlers from './vizbee/MyVizbeeHandlers';

// Global variables to manage application state
const mediaList = [
    {
        "title": "Elephants Dream",
        "streamId": "elephants",
        "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/hls/ElephantsDream.m3u8",
        "imageUrl": "https://vizbee.s3.amazonaws.com/images/demoapp/elephantsdream.jpg",
        "isLive": false
    },
    {
        "title": "Tears of Steel",
        "streamId": "tears",
        "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/hls/TearsOfSteel.m3u8",
        "imageUrl": "https://vizbee.s3.amazonaws.com/images/demoapp/tearsofsteel.png",
        "isLive": false
    },
    {
        "title": "Akamai Live Stream",
        "streamId": "akamai-live-stream",
        "streamUrl": "https://livecmaftest1.akamaized.net/cmaf/live/2099281/abr6s/master.m3u8",
        "imageUrl": "https://vizbee.s3.amazonaws.com/images/demoapp/akamai-live.jpg",
        "isLive": true
    }
];
let currentScreen = 'grid';
let gridScreen = new GridScreen(mediaList);
let playerScreen = new PlayerScreen(mediaList);

/**
 * Initialize the application when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {

    gridScreen.init();
    playerScreen.init();

    // Set up key event listeners
    document.addEventListener('keydown', registerForLGRemoteKeyEvents);

	// [BEGIN] Vizbee Integration

    // Initialize Vizbee integration
    loadAndInitVizbee()
        .then(() => { console.log('Vizbee SDK script loaded successfully'); })
        .catch(error => console.error('Vizbee SDK script loading failed:', error));

	// [END] Vizbee Integration
});

/**
 * Handle remote control events for LG TV environment.
 * @param {KeyboardEvent} e - The keydown event object.
 */
function registerForLGRemoteKeyEvents(e) {
    switch (Number(e.keyCode)) {
        case 19:
        case 415:
            handlePlayPause();
            break;
        case 37: // LEFT arrow
        case 412: // LEFT arrow
            handleLeftArrow();
            break;
        case 39: // RIGHT arrow
        case 417: // RIGHT arrow
            handleRightArrow();
            break;
        case 13: // OK button
            handleEnter();
            break;
        case 461: // RETURN button
        case 413: // STOP button
            handleBack();
            break;
    }
}

/**
 * Handle play/pause button press.
 */
function handlePlayPause() {
    if(currentScreen === 'player') {
        playerScreen.handlePlayPause();
    }
}

/**
 * Handle left arrow button press.
 */
function handleLeftArrow() {
    if(currentScreen === 'grid') {
        gridScreen.handleLeftArrow();
    } else {
        playerScreen.handleLeftArrow();
    }
}

/**
 * Handle right arrow button press.
 */
function handleRightArrow() {
    if(currentScreen === 'grid') {
        gridScreen.handleRightArrow();
    } else {
        playerScreen.handleRightArrow();
    }
}

/**
 * Handle enter/OK button press.
 */
function handleEnter() {
    if(currentScreen === 'grid') {
        toggleScreen();
        const currentVideoIndex = gridScreen.getCurrentItemIndex();
        playerScreen.handleStartVideo(currentVideoIndex);
        currentScreen = 'player';
    } else {
        playerScreen.handleEnter();
    }
}

/**
 * Handle back button press.
 */
function handleBack() {
    if(currentScreen === 'grid') {
        gridScreen.handleBack();
    } else {
        playerScreen.handleBack();
        toggleScreen();
        gridScreen.updateFocus();
        currentScreen = 'grid';
    }
}

/**
 * Toggle between grid and player screens.
 */
function toggleScreen() {
    document.getElementById('grid-screen').classList.toggle('inactive');
    document.getElementById('player-screen').classList.toggle('inactive');
}

// [BEGIN] Vizbee Integration

/**
 * Load and initialize the Vizbee SDK.
 * @returns {Promise} A promise that resolves when the Vizbee script is loaded.
 */
function loadAndInitVizbee() {
    listenAndIntiVizbee();
    return addScript("https://sdk.claspws.tv/v7/vizbee.js");
}

/**
 * Set up listener for Vizbee SDK initialization and initialize the SDK.
 */
function listenAndIntiVizbee() {
    window.addEventListener('VIZBEE_SDK_READY', () => {
        if (window.vizbee) {
            console.log(`listenAndIntiVizbee - initiating vizbee sdk now ...`);
            const vzbInstance = window.vizbee.continuity.ContinuityContext.getInstance();
            vzbInstance.start('vzb7564326732');
            setDeeplinkHandler();
        }
    });
}

/**
 * Set up the deeplink handler for Vizbee.
 */
function setDeeplinkHandler() {
    if(window.vizbee) {
        const vizbeeHandlersInstance = MyVizbeeHandlers.getInstance(playerScreen);
        const vzbInstance = vizbee.continuity.ContinuityContext.getInstance();
        vzbInstance.getAppAdapter().setDeeplinkHandler((videoInfo) => {
            toggleScreen();
            currentScreen = "player";
            vizbeeHandlersInstance.deeplinkHandler(videoInfo);
        });
    }
}

/**
 * Dynamically add a script to the document.
 * @param {string} src - The source URL of the script.
 * @param {string|null} integrity - The integrity hash for the script (optional).
 * @param {string|null} crossorigin - The crossorigin attribute for the script (optional).
 * @returns {Promise} A promise that resolves when the script is loaded.
 */
function addScript(src, integrity = null, crossorigin = null) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        
        if (integrity) {
            script.integrity = integrity;
        }
        
        if (crossorigin) {
            script.crossOrigin = crossorigin;
        }
        
        script.onload = () => { console.log(`Script load completed`); resolve(script) };
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        
        document.head.appendChild(script);
    });
}

// [END] Vizbee Integration