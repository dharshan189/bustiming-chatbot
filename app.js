const busData = [
    // Karur to Erode
    { name: "Sree Kumaran (Karur to Erode)", time: "07:50 AM", location: "Kodumudi" },
    { name: "VST (Karur to Erode)", time: "08:25 AM", location: "Kodumudi" },
    { name: "City Rider (Karur to Erode)", time: "05:45 PM", location: "Karur Bus Stand" },
    { name: "MMS (Karur to Erode)", time: "01:30 PM", location: "Pasupathipalayam" },
    { name: "SGR (Karur to Erode)", time: "10:15 PM", location: "Karur Bus Stand" },
    { name: "KPN (Karur to Erode)", time: "02:45 AM", location: "NPT" },

    // Erode to Karur
    { name: "Morning Star (Erode to Karur)", time: "11:00 AM", location: "Modakkurichi" },
    { name: "Express 77 (Erode to Karur)", time: "06:15 AM", location: "Erode Bus Stand" },
    { name: "Raja (Erode to Karur)", time: "03:15 PM", location: "Solavampalayam" },
    { name: "TVS (Erode to Karur)", time: "07:30 PM", location: "Kodumudi" },
    { name: "Night Queen (Erode to Karur)", time: "11:45 PM", location: "Erode Bus Stand" },

    // Chennai to Madurai
    { name: "SETC Ultra Deluxe (Chennai to Madurai)", time: "09:00 PM", location: "Chennai CMBT" },
    { name: "KPN AC Sleeper (Chennai to Bangalore)", time: "10:30 PM", location: "Koyambedu" },
    { name: "Parveen (Chennai to Trichy)", time: "06:00 AM", location: "Guindy" },
    { name: "SRS (Chennai to Nagercoil)", time: "02:00 PM", location: "Perungalathur" },

    // Chennai to Coimbatore
    { name: "SETC AC Sleeper (Chennai to Coimbatore)", time: "10:00 PM", location: "Koyambedu" },
    { name: "TNSTC Deluxe (Chennai to Coimbatore)", time: "08:00 AM", location: "CMBT" },

    // Others
    { name: "TNSTC City Bus (Route 21G)", time: "08:30 AM", location: "Broadway" },
    { name: "TNSTC Deluxe (Salem to Erode)", time: "07:15 AM", location: "Salem New Bus Stand" },
    { name: "MTC Express (Route 500)", time: "06:45 AM", location: "Chengalpattu" },
    { name: "SETC Classic (Madurai to Kanyakumari)", time: "11:30 PM", location: "Madurai Mattuthavani" },
    { name: "TNSTC Semi-Deluxe (Trichy to Tanjore)", time: "02:00 PM", location: "Trichy Central BS" },
    { name: "MTC Volvo (Route 102)", time: "09:15 AM", location: "Kelambakkam" },
    { name: "SETC Super Fast (Chennai to Trichy)", time: "05:00 AM", location: "Trichy Central BS" },
    { name: "TNSTC Town Bus (Palani to Pollachi)", time: "04:30 PM", location: "Palani Bus Stand" }
];

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
let isSearching = false;

// Initial Welcome Message
let speechPlayed = false;
const welcomeText = "Welcome to time my bus you can search your local bus timings at any time";

window.onload = () => {
    addMessage("Welcome to TimeMyBus 🚌\n\nI am your automated assistant. Please select a route and enter a bus name or time to see available departures!", 'bot');

    // Automatic attempt after 1 second (might be blocked by browser)
    setTimeout(() => {
        if (!speechPlayed) playWelcome();
    }, 1000);
};

// HIGHLY RELIABLE MOBILE TRIGGER
// Browsers like iPhone Safari and Chrome Mobile REQUIRE a physical touch to play sound.
const playWelcome = () => {
    if (speechPlayed || !('speechSynthesis' in window)) return;

    // Wait 1 second before speaking
    setTimeout(() => {
        if (speechPlayed) return; // Prevent double trigger

        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(welcomeText);

        // Voice selection inside the trigger
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            utterance.voice = voices.find(v => v.lang.includes('en')) || voices[0];
        }

        utterance.onstart = () => {
            speechPlayed = true;
        };

        window.speechSynthesis.speak(utterance);
    }, 1000);
};

// Listen for first tap anywhere on the screen
document.addEventListener('touchstart', playWelcome, { once: true });
document.addEventListener('click', playWelcome, { once: true });

function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    div.innerText = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    // Force a reflow to ensure the message is rendered immediately
    div.offsetHeight;
    return div;
}

function getTimePeriod(timeStr) {
    const time = timeStr.toUpperCase();
    const hour = parseInt(time.split(':')[0]);
    const isPM = time.includes('PM');

    if (isPM) {
        if (hour === 12 || (hour >= 1 && hour < 5)) return 'Afternoon';
        if (hour >= 5 && hour < 9) return 'Evening';
        return 'Night';
    } else {
        if (hour === 12 || (hour >= 1 && hour < 4)) return 'Night';
        return 'Morning';
    }
}

function handleSearch() {
    if (isSearching) return;

    const query = userInput.value.trim();
    const route = document.getElementById('route-select').value;

    if (!query && !route) return;

    // Check if the user selected a session chip without selecting a route first
    const sessions = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];
    if (sessions.includes(query.toUpperCase()) && !route) {
        const errorMsg = addMessage(`⚠️ Please select your bus route`, 'bot');
        errorMsg.classList.add('validation-error');
        return;
    }

    isSearching = true;

    // Show user message
    const displayMsg = route && query ? `${route} at ${query}` : (query || route);
    addMessage(displayMsg, 'user');
    userInput.value = '';

    // Disable input, button, and suggestions while searching
    sendBtn.disabled = true;
    userInput.disabled = true;
    document.getElementById('suggestions').style.pointerEvents = 'none';
    document.getElementById('suggestions').style.opacity = '0.5';

    // Show Loading Message
    const loadingMsg = addMessage("Finding your bus details. Please wait !!", 'bot');
    loadingMsg.classList.add('loading-dots');

    setTimeout(() => {
        // Remove loading message and enable inputs
        loadingMsg.remove();
        sendBtn.disabled = false;
        userInput.disabled = false;
        document.getElementById('suggestions').style.pointerEvents = 'auto';
        document.getElementById('suggestions').style.opacity = '1';
        userInput.focus();

        isSearching = false;
        processQuery(query, route);
    }, 5000);
}

function processQuery(query, route) {
    // Normalize query: replace space between numbers with a colon (e.g., "7 50" -> "7:50")
    let normalizedQueryStr = query ? query.replace(/(\d{1,2})\s+(\d{2})/, '$1:$2') : "";
    const upperQuery = normalizedQueryStr.toUpperCase();
    const upperRoute = route ? route.toUpperCase() : "";

    // First filter by route if selected
    let filteredData = busData;
    if (upperRoute) {
        filteredData = busData.filter(bus => bus.name.toUpperCase().includes(upperRoute));
    }

    // Check if it's a time query
    const timeKeywords = {
        "MORNING": ["04:", "05:", "06:", "07:", "08:", "09:", "10:", "11:", "AM"],
        "AFTERNOON": ["12:", "01:", "02:", "03:", "04:", "PM"],
        "EVENING": ["05:", "06:", "07:", "08:", "PM"],
        "NIGHT": ["09:", "10:", "11:", "12:", "01:", "02:", "03:", "PM", "AM"]
    };

    const isTimeQuery = /\d{1,2}:\d{2}/.test(normalizedQueryStr) ||
        upperQuery.includes("AM") ||
        upperQuery.includes("PM") ||
        ["MORNING", "AFTERNOON", "EVENING", "NIGHT"].includes(upperQuery);

    let results = [];
    let responseText = "";

    if (normalizedQueryStr) {
        if (isTimeQuery) {
            results = filteredData.filter(bus => {
                const busTime = bus.time.toUpperCase();

                // Handle keywords like "Morning"
                if (["MORNING", "AFTERNOON", "EVENING", "NIGHT"].includes(upperQuery)) {
                    if (upperQuery === "MORNING") return busTime.includes("AM") && !busTime.includes("12:");
                    if (upperQuery === "AFTERNOON") return busTime.includes("PM") && (busTime.includes("12:") || parseInt(busTime) < 5);
                    if (upperQuery === "EVENING") return busTime.includes("PM") && (parseInt(busTime) >= 5 && parseInt(busTime) < 9);
                    if (upperQuery === "NIGHT") return (busTime.includes("PM") && parseInt(busTime) >= 9) || (busTime.includes("AM") && (busTime.includes("12:") || parseInt(busTime) < 4));
                }

                const normalizedBusTime = busTime.replace(/^0/, '');
                const normalizedQuery = upperQuery.replace(/^0/, '');
                return busTime.includes(upperQuery) || normalizedBusTime.includes(normalizedQuery);
            });
            responseText = results.length > 0 ? `Buses available in the ${normalizedQueryStr}:` : `No buses found for ${normalizedQueryStr} on this route.`;
        } else {
            results = filteredData.filter(bus => bus.name.toUpperCase().includes(upperQuery));
            responseText = results.length > 0 ? `Results for "${query}":` : `No buses found matching "${query}".`;
        }
    } else if (route) {
        results = filteredData;
        responseText = `Showing all buses for ${route}:`;
    }

    addMessage(responseText, 'bot');

    if (results.length > 0) {
        const resultContainer = document.createElement('div');
        resultContainer.className = 'message bot-message';
        resultContainer.style.background = 'transparent';
        resultContainer.style.border = 'none';
        resultContainer.style.padding = '0';

        results.forEach(bus => {
            const period = getTimePeriod(bus.time);
            const card = document.createElement('div');
            card.className = 'bus-card';
            card.innerHTML = `
                <div class="bus-info">
                    <span class="bus-name">${bus.name}</span>
                    <span class="bus-location">📍 Scheduled at ${bus.location}</span>
                    <div class="bus-session-info">
                        <span class="session-label">Session :</span>
                        <span class="bus-period-tag period-${period.toLowerCase()}">${period.toUpperCase()}</span>
                    </div>
                </div>
                <div class="bus-time-wrapper">
                    <span class="bus-time">${bus.time}</span>
                </div>
            `;
            resultContainer.appendChild(card);
        });

        chatContainer.appendChild(resultContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

sendBtn.addEventListener('click', handleSearch);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Suggestion click handling
document.getElementById('suggestions').addEventListener('click', (e) => {
    if (isSearching) return;

    if (e.target.id === 'all-timings-chip') {
        const route = document.getElementById('route-select').value;
        if (!route) return;

        isSearching = true;
        addMessage(`Show all timings`, 'user');

        document.getElementById('suggestions').style.pointerEvents = 'none';
        document.getElementById('suggestions').style.opacity = '0.5';

        const loadingMsg = addMessage("Finding your bus details. Please wait !!", 'bot');
        loadingMsg.classList.add('loading-dots');

        setTimeout(() => {
            loadingMsg.remove();
            document.getElementById('suggestions').style.pointerEvents = 'auto';
            document.getElementById('suggestions').style.opacity = '1';
            isSearching = false;
            processQuery("", route);
        }, 5000);
        return;
    }
    if (e.target.classList.contains('suggestion-chip')) {
        userInput.value = e.target.innerText;
        handleSearch();
    }
});

// Dropdown change handling
document.getElementById('route-select').addEventListener('change', (e) => {
    const allTimingsChip = document.getElementById('all-timings-chip');
    if (e.target.value) {
        allTimingsChip.style.display = 'block';
    } else {
        allTimingsChip.style.display = 'none';
    }
});
