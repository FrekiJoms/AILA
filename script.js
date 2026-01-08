// Admin Emails - will be fetched from database
let adminEmails = [];
// SUPABASE URL
const SUPABASE_URL = "https://woqlvcgryahmcejdlcqz.supabase.co";
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcWx2Y2dyeWFobWNlamRsY3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDg5NTMsImV4cCI6MjA4MDMyNDk1M30.PXL0hJ-8Hv7BP21Fly3tHXonJoxfVL0GNCY7oWXDKRA";
// domain URL
const AILA_URL = "https://ailearningassistant.edgeone.app";

// ========== CONVERSATION HISTORY GLOBALS ========== //
let currentConversationId = null;
let conversationMessages = [];
let isOfflineDataReady = false; // Flag to track if offline data is loaded
let isLoadingConversation = false; // Flag to prevent auto-position update on load
// ========== END CONVERSATION HISTORY GLOBALS ========== //

// --- START: Supabase Client Initialization ---
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let isUserAuthenticated = false;
let isTrialExpired = false;
let isAdminUser = false;

// --- END: Supabase Client Initialization ---
_supabase.auth.onAuthStateChange(async (event, session) => {
  if (
    event === "SIGNED_IN" &&
    session &&
    window.location.hash.includes("access_token")
  ) {
    // 1. Determine if it's a brand new user or a returning user
    const isNewUser = new Date() - new Date(session.user.created_at) < 60000;
    const eventType = isNewUser ? "Google Registration" : "Google Login";

    // 2. Get the user's name from their Google profile
    const displayName =
      session.user.user_metadata && session.user.user_metadata.full_name
        ? session.user.user_metadata.full_name
        : session.user.email.split("@")[0];

    localStorage.setItem("loggedInUserName", displayName);

    // 3. THIS IS THE FIX: Log the event to your Google Sheet before redirecting
    await logUserEventToSheet(session.user.email, displayName, eventType);
    
    window.location.assign(AILA_URL);
    
    setTimeout(() => {
  }, 2000);
    // 4. Cleanly reload the page to start the app
    window.location.assign(AILA_URL);
    return;
  }

  if (session) {
    localStorage.setItem("loggedInUser", session.user.email);
    const displayName =
      session.user.user_metadata && session.user.user_metadata.full_name
        ? session.user.user_metadata.full_name
        : session.user.email.split("@")[0];
    localStorage.setItem("loggedInUserName", displayName);
  }
});

const SFX = {
  loadingAmbient: "sfx/loading-ambient.mp3",
  glassBreak: "sfx/glass-break.mp3",
  success: "sfx/success.mp3",
  whoosh: "sfx/whoosh.mp3",
  typing: "sfx/typing.mp3",
  send: "sfx/send.mp3",
  receive: "sfx/receive.mp3",
  micOn: "sfx/mic-on.mp3",
  micOff: "sfx/mic-off.mp3",
};

// ========== Fetch Admins from Database ========== //
async function loadAdminsFromDatabase() {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session) {
      console.warn('No session available. Using empty admin list.');
      adminEmails = [];
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-admins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'list' })
    });

    if (response.ok) {
      const data = await response.json();
      adminEmails = data.admins.map((admin) => admin.email);
      console.log('[ADMIN] Admin list loaded from database:', adminEmails);
    } else {
      console.warn('Could not fetch admins from database. Using empty list.');
      adminEmails = [];
    }
  } catch (error) {
    console.error('Error fetching admins from database:', error);
    adminEmails = [];
  }
}

const iconMap = {
  "edu.gcfglobal.org": "icons/gcfglobal-color.png",
  "www.w3schools.com": "icons/w3schools-logo-icon.png",
  "docs.google.com/document": "icons/docs.png",
  "docs.google.com/spreadsheets": "icons/sheets.png",
  "drive.google.com": "icons/drive.png",
  "forms.gle": "icons/forms.png",
  "docs.google.com/forms": "icons/forms.png",
  "classroom.google.com": "icons/classroom.png",
  "sites.google.com": "icons/sites.png",
  "www.excelcampus.com": "icons/excel-campus-logo-optimized.png",
  "www.benlcollins.com": "icons/colins.png",
  "www.facebook.com": "icons/facebook.png",
};
const defaultIcon = "icons/external.png";

function getIconForUrl(url) {
  if (typeof url !== "string") return defaultIcon;
  for (const key in iconMap) {
    if (url.includes(key)) {
      return iconMap[key];
    }
  }
  return defaultIcon;
}
// =================================================================
// ============== CENTRALIZED MODAL QUESTIONS ======================
// == To edit questions/links, just edit them here. ==============
// =================================================================
const modalQuestions = {
  Modules: {
    title: "Activity",
    content: {
      "Spreadsheet Navigation & Data Familiarization": {
        _DESC_3_: "➡ Activity 1",
        "Information Sheet": "Activity 1 Information Sheet",
        "Activity Sheet": "Activity 1 Activity Sheet",
        _DESC_1_: "➡ This is the tool for the LA's",
        "Performance Checklist": "Activity 1 Performance Checklist",
        _DESC_2_:
          "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
        "Activity 1 Assessment Form":
          "https://docs.google.com/forms/d/e/1FAIpQLSeIsO_7TlYWT8i6hXBVmTw6-3UFH8kYQ3ipll0lC9KxvOwOFg/viewform",
      },
      "Data Processing Using Spreadsheet Formulas and Tools": {
        _DESC_3_: "➡ Activity 2",
        "Information Sheet": "Activity 2 Information Sheet",
        "Activity Sheet": "Activity 2 Activity Sheet",
        _DESC_1_: "➡ This is the tool for the LA's",
        "Performance Checklist": "Activity 2 Performance Checklist",
        _DESC_2_:
          "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
        "Activity 2 Assessment Form":
          "https://docs.google.com/forms/d/e/1FAIpQLScMn2q_BgZrUmJdSQyRqhiHcKNmDY7uxbWg07CZ1G7zajyC8w/viewform?usp=header",
      },
      "Spreadsheet Data Analysis Using Pivot Tables and Charts": {
        _DESC_3_: "➡ Activity 3",
        "Information Sheet": "Activity 3 Information Sheet",
        "Activity Sheet": "Activity 3 Activity Sheet",
        _DESC_1_: "➡ This is the tool for the LA's",
        "Performance Checklist": "Activity 3 Performance Checklist",
        _DESC_2_:
          "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
        "Activity 3 Assessment Form":
          "https://docs.google.com/forms/d/e/1FAIpQLSexDGWOZ6CLnjh7WbItGeeShHdwzLGgUBa8m0B81_AeNSLOmw/viewform",
      },
    },
  },
  Orientation: {
    title: "Orientation",
    content: ["Orientation to Data Proccessing"],
  },
  "Learning Materials": {
    title: "Learning Materials",
    content: [
      {
        "ICT/Data Proccessing Classroom":
          "https://classroom.google.com/c/Nzk0ODMxMDI1Mzgx?cjc=xxlb4l3e",
      },
      {
        "Google Sheets Get Started":
          "https://www.w3schools.com/googlesheets/google_sheets_get_started.php",
      },
      {
        "Google Sheets: Modifying Columns, Rows, and Cells":
          "https://edu.gcfglobal.org/en/googlespreadsheets/modifying-columns-rows-and-cells/1/",
      },
      {
        "Google Sheets: Understanding Number Formats":
          "https://edu.gcfglobal.org/en/googlespreadsheets/understanding-number-formats/1/",
      },
      {
        "Google Sheets Formulas":
          "https://www.w3schools.com/googlesheets/google_sheets_formulas.php",
      },
      {
        "Google Sheets IF Function":
          "https://www.w3schools.com/googlesheets/google_sheets_if.php",
      },
      {
        "The New XLOOKUP Function for Excel + Video Tutorial":
          "https://www.excelcampus.com/functions/xlookup-explained/",
      },
      {
        "MRP Workbooks": {
          Material_Requirement_Planning_20251113_wk02:
            "https://docs.google.com/spreadsheets/d/12-rQsdn698XDu1Fme0YR-LPHvFMLMcBKH3qtKOAQtEw/edit?usp=sharing",
          Material_Requirement_Planning_20251113_wk03:
            "https://docs.google.com/spreadsheets/d/1ITMJd_yMIDhqNEoRe0umfdOawu2eQsWK/edit?usp=drivesdk&ouid=101212779968196364079&rtpof=true&sd=true",
          Material_Requirement_Planning_20251113_wk04:
            "https://docs.google.com/spreadsheets/d/1UeVuVWZnXAty6ucR5vvUpqPB7f0iIw54J8G30cBGRAI/edit?usp=sharing",
      }
    },  
    ],
  },
  tools: {
    title: "Tools & Resources",
  },
};

// ============== START: MODAL SCRIPT ==============
// This entire block handles the functionality for the new modal pop-ups.

// Get references to all the modal elements from the HTML
const modal = document.getElementById("universalModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const toolsHeaderBtn = document.getElementById("toolsHeaderBtn");
// Add event listener for Activity dropdowns inside the modal
modalBody.addEventListener("click", function (e) {
  const clickedBtn = e.target.closest(".module-dropdown-btn");
  if (!clickedBtn) return; // Exit if the click wasn't on a dropdown button

  // Check if the button we clicked is already active
  const wasActive = clickedBtn.classList.contains("active");

  // First, close all dropdowns in the modal by removing the 'active' class
  const allDropdownBtns = modalBody.querySelectorAll(".module-dropdown-btn");
  allDropdownBtns.forEach((btn) => {
    btn.classList.remove("active");
  });

  // If the button we clicked wasn't already active, make it active now.
  // This opens the clicked dropdown and ensures all other are closed.
  if (!wasActive) {
    clickedBtn.classList.add("active");
  }
});

/**
 * Closes the modal by removing the 'visible' class.
 */
function closeModal() {
  if (modal) {
    modal.classList.remove("visible");
  }
}

/**
 * Recursively builds HTML content for the modal based on a flexible data structure.
 * It can render nested dropdowns, direct links with icons, descriptions, and simple questions.
 *
 * @param {object | Array} data - The data node from modalQuestions to render.
 * @returns {string} The generated HTML string.
 */
function buildContentHTML(data) {
  let html = "";

  // Case 1: The data is an ARRAY (like in 'Orientation' or 'Other')
  if (Array.isArray(data)) {
    data.forEach((item) => {
      // An item can be a simple string for a question link.
      if (typeof item === "string") {
        html += `<a href="#" class="question-link" onclick="useSuggestion('${item.replace(
          /'/g,
          "\\'"
        )}'); closeModal();">${item}</a>`;
      }
      // Or an object for a description, a direct link, or a dropdown.
      else if (typeof item === "object" && item !== null) {
        const key = Object.keys(item)[0];
        const value = item[key];

        // If the value is a string starting with 'http', it's a DIRECT LINK.
        if (typeof value === "string" && value.startsWith("http")) {
          const iconPath = getIconForUrl(value);
          html += `<a href="${value}" target="_blank" onclick="closeModal()" class="icon-link"><img src="${iconPath}" alt=""><span>${key}</span></a>`;
        }
        // If the value is an object, it's a DROPDOWN.
        else if (typeof value === "object" && value !== null) {
          html += `
                        <div class="module-dropdown">
                            <button class="module-dropdown-btn"><span>${key}</span><svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                            <div class="module-dropdown-content">
                                ${buildContentHTML(value)}
                            </div>
                        </div>`;
        }
      }
    });
  }
  // Case 2: The data is an OBJECT (like in 'Modules' or a nested dropdown)
  else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      const value = data[key];

      if (key.startsWith("_DESC_")) {
        html += `<p class="description">${value}</p>`;
      }
      // If the value is an object, it's a nested dropdown. Recurse.
      else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        html += `
                    <div class="module-dropdown">
                        <button class="module-dropdown-btn"><span>${key}</span><svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                        <div class="module-dropdown-content">
                            ${buildContentHTML(value)}
                        </div>
                    </div>`;
      }
      // If the value is a string starting with http, it's a link.
      else if (typeof value === "string" && value.startsWith("http")) {
        const iconPath = getIconForUrl(value);
        html += `<a href="${value}" target="_blank" onclick="closeModal()" class="icon-link"><img src="${iconPath}" alt=""><span>${key}</span></a>`;
      }
      // Otherwise, it's a simple question with a custom query.
      else if (typeof value === "string") {
        html += `<a href="#" onclick="event.preventDefault(); useSuggestion('${value.replace(
          /'/g,
          "\\'"
        )}'); closeModal();">${key}</a>`;
      }
    }
  }
  return html;
}

/**
 * Main function to generate the modal content.
 * This is now a simple wrapper around the powerful buildContentHTML function.
 * @param {string} sectionTitle The key to look up in the modalQuestions object.
 * @returns {string} HTML string for the modal's content.
 */
function getPlaceholderContent(sectionTitle) {
  const sectionData = modalQuestions[sectionTitle] || {};
  // This is the only line that changes in this function
  const contentHTML = buildContentHTML(sectionData.content);
  return `<div class="placeholder-section">${
    contentHTML ||
    `<p>Coming soon...</p>
    <i style="opacity: 70%"; "font-size: 9px">This section is not configured yet</i>`
  }</div>`;
}

/**
 * Opens and populates the modal based on the content type.
 * Supports composite types like 'tools-materials' to open tools modal at specific section.
 * @param {string} contentType - The type of content to display ('tools', 'tools-materials', etc.).
 */
function openModal(contentType) {
  // Parse composite content types like 'tools-materials' -> base='tools', section='materials'
  let baseType = contentType;
  let targetSection = null;
  
  if (contentType.includes("-")) {
    const parts = contentType.split("-");
    baseType = parts[0];
    targetSection = contentType;
  }

  const modalData = modalQuestions[baseType];
  if (!modalData) return;

  modalTitle.textContent = modalData.title;
  let bodyContent = "";

  if (baseType === "tools") {
    // Dynamically build the tools content with tabs
    bodyContent = `
            <div class="tools-nav">
                <button class="tools-nav-btn ${!targetSection || targetSection === 'tools-Modules' ? 'active' : ''}" data-target="tools-Modules">Activities</button>
                <button class="tools-nav-btn ${targetSection === 'tools-orientation' ? 'active' : ''}" data-target="tools-orientation">Orientation</button>
                <button class="tools-nav-btn ${targetSection === 'tools-materials' ? 'active' : ''}" data-target="tools-materials">Materials</button>
            </div>
            <div class="tools-content">
                <div id="tools-Modules" class="tools-pane ${!targetSection || targetSection === 'tools-Modules' ? 'active' : ''}">${getPlaceholderContent(
                  "Modules"
                )}</div>
                <div id="tools-orientation" class="tools-pane ${targetSection === 'tools-orientation' ? 'active' : ''}">${getPlaceholderContent(
                  "Orientation"
                )}</div>
                <div id="tools-materials" class="tools-pane ${targetSection === 'tools-materials' ? 'active' : ''}">${getPlaceholderContent(
                  "Learning Materials"
                )}</div>
            </div>
        `;
  } else if (baseType === "Modules") {
    // Handle Modules modal - it doesn't need tabs, just show the content
    bodyContent = getPlaceholderContent("Modules");
  } else {
    // For all other modals, generate the content as before.
    bodyContent = getPlaceholderContent(baseType);
  }

  modalBody.innerHTML = bodyContent;
  modal.classList.add("visible");

  // Re-attach the nav button logic specifically for the tools modal
  if (baseType === "tools") {
    const navButtons = modal.querySelectorAll(".tools-nav-btn");
    const panes = modal.querySelectorAll(".tools-pane");

    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        navButtons.forEach((b) => b.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-target");
        document.getElementById(targetId)?.classList.add("active");
      });
    });
  }
}
// Main event listeners for opening and closing the modal
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (toolsHeaderBtn)
  toolsHeaderBtn.addEventListener("click", () => openModal("tools"));

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      // Check if the click target is the modal backdrop itself
      closeModal();
    }
  });
}

// 2. Close modal on Escape key press:
document.addEventListener("keydown", (event) => {
  if (modal && event.key === "Escape") {
    // Check if modal is open and Escape key is pressed
    closeModal();
  }
});
// ============== END: MODAL SCRIPT ==============
// --- Sound Effects ---
let typingSound = null; // To control the looping typing sound
let ambientSound = null; // To control the looping ambient sound

/**
 * A more robust function to play sound effects with volume control.
 * @param {string} url - The path to the sound file.
 * @param {number} [volume=1.0] - The volume, from 0.0 to 1.0.
 */
function playSound(url, volume = 1.0) {
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play();
  } catch (error) {
    console.warn(`Could not play sound effect: ${url}`, error);
  }
}
document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    const allDropdowns = document.querySelectorAll(".dropdown");
    allDropdowns.forEach((dropdown) => {
      const content = dropdown.querySelector(".dropdown-content");
      if (content) content.style.display = "none";
    });
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const allDropdowns = document.querySelectorAll(".dropdown");
    allDropdowns.forEach((dropdown) => {
      const content = dropdown.querySelector(".dropdown-content");
      if (content) content.style.display = "none";
    });
  }
});
/* response area */
/* dito mo e ccustomize if may babagohin or e dadagdag na template questions */
let offlineResponses = {}; // This will be filled with data from our Google Sheet.

const messagesEl = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const logoArea = document.getElementById("logo");
const chatEl = document.querySelector(".chat"); // <-- ADD THIS LINE

/* Marked + DOMPurify */
marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderSafeMarkdown(mdText) {
  if (typeof mdText !== "string") mdText = String(mdText || "");
  const correctedText = mdText.replace(/\\n/g, "\n");
  const rawHtml = marked.parse(correctedText);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rawHtml;
  tempDiv.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (code) {
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "Copy";
      pre.appendChild(copyBtn);
    }
  });
  const processedHtml = tempDiv.innerHTML.replace(
    /<a href="([^"]+)">(.+?)<\/a>/gs,
    (match, href, text) => {
      const iconSrc = getIconForUrl(href);
      return `<a href="${href}" target="_blank" rel="noopener noreferrer"><img src="${iconSrc}" class="link-icon" alt="">${text}</a>`;
    }
  );
  return DOMPurify.sanitize(processedHtml, {
    ADD_TAGS: ["img", "pre", "code", "button"],
    ADD_ATTR: ["target", "rel", "style", "src", "alt", "class"],
  });
}

/* welcome logo */
/* welcome screen*/
function showWelcomeScreen() {
  const welcomeHTML = `
  <div class="welcome-screen">
    <div class="welcome-logo">
      <img src="icons/ailalogo.png"
           alt="AILA Logo"
           style="width:100%; height:100%; object-fit:cover; border-radius:14px;">
    </div>
    <h1 class="welcome-title" style="margin-bottom: 5px">Welcome to AILA</h1>
<p class="welcome-subtitle">Hi ${
    localStorage.getItem("loggedInUserName") || "kuys"
  }! I'm AILA, your personal AI learning assistant.</p>
    <div class="welcome-actions">
      <button class="welcome-btn" onclick="useSuggestion('Overview')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Overview</span>
      </button>
      <button class="welcome-btn" onclick="openModal('tools')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>Activities</span>
      </button>
      <button class="welcome-btn" onclick="useSuggestion('orientation')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          <span>Orientation</span> 
      </button>
      <button class="welcome-btn" onclick="openModal('tools-materials')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span>Learning Materials</span>
      </button>
    </div>
  </div>
`;

  messagesEl.innerHTML = welcomeHTML;
  const welcomeInput = document.getElementById("welcomeInput");
  if (welcomeInput) {
    welcomeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const value = welcomeInput.value.trim();
        if (value) useSuggestion(value);
      }
    });
    //welcomeInput.focus(); disabled//
  }
}

function useSuggestion(text) {
    // --- START: Authentication Check ---
  if (!isUserAuthenticated) {
    appendMessage(
      "You must be logged in to use AILA.",
      "bot"
    );
    // Show the login modal if it exists
    const authModal = document.getElementById("authModal");
    if (authModal) authModal.classList.remove("hidden");
    return; // Stop the function
  }
  // --- END: Authentication Check ---

  // --- THIS IS THE FIX ---
  // If the trial is expired, clear the screen, show the expiry message,
  // and stop the function from doing anything else.
  if (isTrialExpired) {
    messagesEl.innerHTML = ""; // Clear the welcome screen or any other content
    appendMessage(
      "Your trial is over. Please contact the developer to renew your trial.",
      "bot"
    );
    return; // <-- This is the crucial part that stops the query.
  }
  // --- END OF FIX ---

  // Check if the welcome screen is currently being displayed.
  const welcomeScreen = messagesEl.querySelector(".welcome-screen");

  // If the welcome screen is active, clear it before showing the new message.
  if (welcomeScreen) {
    messagesEl.innerHTML = "";
  }

  // The rest of the function remains the same: append the new message and send it.
  appendMessage(text, "user");
  sendToBackend(text, true);
}
function appendMessage(
  text,
  who = "bot",
  attachFAQs = false,
  suggestions = []
) {
  const wrap = document.createElement("div");
  wrap.className = "msg " + who;
  wrap.classList.add("new-message");
  wrap.innerHTML = renderSafeMarkdown(text);

  // Make all links open in a new tab for security
  wrap.querySelectorAll("a").forEach((a) => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  // Add the "Modules" button to bot messages
  if (who === "bot") {
    const actionWrap = document.createElement("div");
    actionWrap.className = "sugg-buttons";

    const modulesBtn = document.createElement("button");
    modulesBtn.className = "sugg-btn";
    modulesBtn.textContent = "📦 Activities";

    // This button now correctly opens the simple "Modules" modal
    modulesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal("tools");
    });

    actionWrap.appendChild(modulesBtn);
    wrap.appendChild(actionWrap);
  }

  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Store message in conversation history for saving
  conversationMessages.push({
    role: who === "user" ? "user" : "assistant",
    content: text
  });

  // Only auto-save after bot messages (complete exchange), not after user messages
  // This prevents duplicate conversations from being created
  if (who === "bot") {
    setTimeout(() => {
      saveConversation();
    }, 500);
  }

  return wrap;
}

const safe = (fn) => {
  try {
    fn();
  } catch (e) {
    console.warn("safe error", e);
  }
};
safe(() => {
  document.addEventListener("click", (e) => {
    const open = document.querySelectorAll(
      ".dropdown-content, .sugg-buttons .dropdown-content"
    );
    open.forEach((c) => {
      const rect = c.getBoundingClientRect();
      if (window.innerWidth <= 880 && !c.contains(e.target)) {
        c.style.display = "none";
      }
    });
  });
});

function setupFloatingExpander() {
  const chat = document.querySelector(".chat");
  const ta = document.getElementById("input");
  const expander = document.getElementById("floating-expander");

  if (!chat || !ta || !expander) {
    console.error(
      "Floating Expander setup failed: One or more required elements are missing."
    );
    return;
  }

  // A single helper div for measuring text width is created once.
  let measurer = document.getElementById("text-measurer");
  if (!measurer) {
    measurer = document.createElement("div");
    measurer.id = "text-measurer";
    document.body.appendChild(measurer);
  }

  // *** THIS IS THE DEFINITIVE FIX ***
  // By setting position to 'fixed' and moving it far off-screen,
  // it is completely removed from the document's layout flow.
  // It can now become infinitely wide for measurement purposes
  // without ever stretching the body or causing a zoom-out.
  Object.assign(measurer.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    // It's still invisible, but the positioning is the key.
    visibility: "hidden",
    height: "auto",
    width: "auto",
    whiteSpace: "nowrap",
  });

  const handleInput = () => {
    const text = ta.value;

    // Apply the textarea's font styles to the measurer for an accurate width calculation.
    measurer.style.fontSize = getComputedStyle(ta).fontSize;
    measurer.style.fontFamily = getComputedStyle(ta).fontFamily;
    measurer.textContent = text;

    // The overflow logic remains the same.
    const hasOverflow = measurer.clientWidth > ta.clientWidth;
    const hasNewline = text.includes("\n");

    if ((hasOverflow || hasNewline) && text.trim() !== "") {
      expander.textContent = text;
      expander.classList.add("visible");
      chat.classList.add("expander-visible");
      expander.scrollTop = expander.scrollHeight;
    } else {
      expander.classList.remove("visible");
      chat.classList.remove("expander-visible");
    }
  };

  ta.addEventListener("input", handleInput);
  window.addEventListener("resize", handleInput);
  handleInput(); // Run once on startup to set the initial state.
}

// Make sure you call this function once after the page loads.
setupFloatingExpander();

safe(() => {
  document.addEventListener(
    "click",
    (e) => {
      const btn =
        e.target.closest(".sugg-btn") || e.target.closest(".dropdown-item");
      if (!btn) return;
      const content =
        btn.parentElement &&
        btn.parentElement.querySelector(".dropdown-content");
      if (!content) return;
      if (window.innerWidth <= 880) {
        e.stopPropagation();
        const visible = content.style.display === "block";
        content.style.display = visible ? "none" : "block";
        const first = content.querySelector("button, a");
        if (first) first.focus();
      }
    },
    { passive: true }
  );
});

function showTyping() {
  const t = document.createElement("div");
  t.className = "typing";
  t.id = "typingIndicator";
  t.innerHTML =
    '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  messagesEl.appendChild(t);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  logoArea.classList.add("logo-glow");

  if (!typingSound) {
    typingSound = new Audio("sfx/typing.mp3");
    typingSound.loop = true;
    typingSound.volume = 0.3; // Very subtle volume
    typingSound
      .play()
      .catch((e) => console.warn("Typing sound failed to play:", e));
  }

  // --- THIS IS THE FIX ---
  // Add the disabled class and disable the inputs.
  document.querySelector('.composer').classList.add('composer-disabled');
  document.getElementById('input').disabled = true;
  document.getElementById('sendBtn').disabled = true;
  document.getElementById('voiceBtn').disabled = true;
  // --- END OF FIX ---
}
function hideTyping() {
  const t = document.getElementById("typingIndicator");
  if (t) t.remove();
  logoArea.classList.remove("logo-glow");

  // Stop the looping typing sound
  if (typingSound) {
    typingSound.pause();
    typingSound.currentTime = 0;
    typingSound = null;
  }

  // --- THIS IS THE FIX ---
  // Remove the disabled class and re-enable the inputs.
  document.querySelector('.composer').classList.remove('composer-disabled');
  document.getElementById('input').disabled = false;
  document.getElementById('sendBtn').disabled = false;
  document.getElementById('voiceBtn').disabled = false;
  // --- END OF FIX ---
}
function sendToBackend(text, askSuggestions = false) {
  showTyping();

  const userName = localStorage.getItem("loggedInUserName") || "Guest";
  const userEmail = localStorage.getItem("loggedInUser");

  const payload = {
    message: text,
    sessionId: userEmail ? `${userName}_${userEmail}` : `guest_${Date.now()}`,
    name: userName,
    email: userEmail,
    askForSuggestions: !!askSuggestions,
  };

  async function getOfflineAnswer(q) {
     const matchingKeys = Object.keys(offlineResponses).filter((k) => {
      const escapedKey = k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedKey}\\b`, "i");
      return regex.test(q);
    });

    if (matchingKeys.length > 0) {
      const bestMatch = matchingKeys.reduce((a, b) =>
        a.length > b.length ? a : b
      );
      return offlineResponses[bestMatch];
    }
    return `🔴SERVER IS DOWN - PLEASE CONTACT DEVELOPER`;
  }

  // This is the secure implementation
  _supabase.functions.invoke('send-chat-message', {
    body: JSON.stringify(payload),
  })
  .then(response => {
    hideTyping();
    if (response.error) throw new Error(response.error.message);
    
    const data = response.data;
    const reply = data.reply;

    if (reply) {
        playSound(SFX.receive, 0.7);
        appendMessage(reply, "bot");
    } else {
        appendMessage("...", "bot");
    }
    pulseLogoOnce();
    updateStatus(true);
  })
  .catch(async (err) => {
      hideTyping();
      console.warn("Backend connection failed. Falling back to offline mode.", err);
      const offlineReply = await getOfflineAnswer(text);
      playSound(SFX.receive, 0.7);
      appendMessage(offlineReply, "bot", true);
      updateStatus(false);
  });
}

function sendMessage() {
    // --- START: Authentication Check ---
  if (!isUserAuthenticated) {
    appendMessage("You must be logged in to send messages.", "bot");
    const authModal = document.getElementById("authModal");
    if (authModal) authModal.classList.remove("hidden");
    return; // Stop the function
  }
  // --- END: Authentication Check ---

  const t = input.value.trim();
  if (!t) return;
  playSound(SFX.send, 0.8); // 80% volume
  const welcomeScreen = messagesEl.querySelector(".welcome-screen");
  if (welcomeScreen) {
    if (chatEl) chatEl.classList.remove("chat-welcome-mode"); // <-- ADD THIS LINE
    messagesEl.innerHTML = "";
  }

  appendMessage(t, "user");
  input.value = "";

  // THIS IS THE FIX: Use a small delay to prevent the click from falling through.
  // This ensures the mic-on sound doesn't play right after the send sound.
  setTimeout(() => {
    // Manually trigger the input event to swap the send button back to the voice button
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, 50); // A 50ms delay is imperceptible to the user but fixes the bug.

  sendToBackend(t, true);
}
function pulseLogoOnce() {
  logoArea.classList.add("logo-glow");
  setTimeout(() => logoArea.classList.remove("logo-glow"), 1250);
}

// --- New Logic for Composer Buttons & Voice ---
const voiceBtn = document.getElementById("voiceBtn");
const soundWave = document.getElementById("soundWave");

// 1. Show/Hide button based on text input
sendBtn.classList.add("is-hidden"); // Hide send button by default
voiceBtn.classList.remove("is-hidden"); // Ensure voice is visible

input.addEventListener("input", () => {
  const hasText = input.value.trim().length > 0;
  sendBtn.classList.toggle("is-hidden", !hasText);
  voiceBtn.classList.toggle("is-hidden", hasText);
});
// 2. Voice Recognition Logic
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;
let silenceTimer;
let watchdogTimer; // <-- NEW: The watchdog timer

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  const stopListening = () => {
    if (isListening) {
      recognition.stop();
    }
  };

  const startSilenceTimer = () => {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(stopListening, 5250); // 5.25-second timer
  };

  voiceBtn.addEventListener("click", () => {
        // --- START: Authentication Check ---
    if (!isUserAuthenticated) {
      appendMessage("You must be logged in to use voice input.", "bot");
      const authModal = document.getElementById("authModal");
      if (authModal) authModal.classList.remove("hidden");
      return; // Stop the function
    }
    // --- END: Authentication Check ---

    if (isListening) {
      playSound(SFX.micOff, 0.9);
      stopListening();
    } else {
      playSound(SFX.micOn, 0.9);
      input.value = "";
      try {
        recognition.start();
        // ... rest of the function

        // --- NEW: Start the watchdog timer ---
        clearTimeout(watchdogTimer); // Clear any old timers
        watchdogTimer = setTimeout(() => {
          // This will only run if recognition.onstart doesn't fire
          recognition.stop(); // Stop any pending attempts
          appendMessage(
            "🔴 **Voice Service Unavailable**\n\n- The microphone failed to start. This can happen when the page is embedded in another site (like Google Sites).",
            "bot"
          );
        }, 1500); // 1.5 second timeout
      } catch (e) {
        console.error("Error starting recognition:", e);
        // This catch handles immediate errors if .start() fails right away
        clearTimeout(watchdogTimer);
        appendMessage(
          `🔴 **Voice Error:** Could not start voice recognition. Error: ${e.message}`,
          "bot"
        );
      }
    }
  });

  recognition.onstart = () => {
    // --- NEW: Voice recognition started successfully, so cancel the watchdog ---
    clearTimeout(watchdogTimer);

    isListening = true;
    voiceBtn.classList.add("listening");
    voiceBtn.title = "Stop listening";
    soundWave.style.display = "flex";
    input.classList.add("voice-active");
    input.dispatchEvent(new Event("input", { bubbles: true })); // Hide send btn
    startSilenceTimer();
  };

  recognition.onend = () => {
    // --- NEW: Clear timers as a cleanup step ---
    clearTimeout(watchdogTimer);
    clearTimeout(silenceTimer);

    isListening = false;
    voiceBtn.classList.remove("listening");
    voiceBtn.title = "Use voice";
    soundWave.style.display = "none";
    input.classList.remove("voice-active");

    const messageToSend = input.value.trim();
    if (messageToSend.length > 0) {
      sendMessage();
    } else {
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  recognition.onresult = (event) => {
    let final_transcript = "";
    let interim_transcript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    input.value = final_transcript + interim_transcript;
    startSilenceTimer(); // Reset silence timer on any new speech
  };

  recognition.onerror = (event) => {
    // --- NEW: Clear watchdog on explicit error ---
    clearTimeout(watchdogTimer);
    console.error("Speech recognition error:", event.error);

    if (event.error === "no-speech") {
      return;
    }

    let errorMessage =
      "🔴 **Voice Error:** Something went wrong. Please try again.";

    if (event.error === "not-allowed") {
      errorMessage =
        "🔴 **Microphone Access Denied.**\nTo use voice input, please allow microphone access in your browser's site settings. The voice button will now be hidden to prevent further errors.";

      // Permanently hide the voice button if permission is denied
      voiceBtn.style.display = "none";
    } else if (event.error === "audio-capture") {
      errorMessage =
        "🔴 **No Microphone Found.**\nPlease make sure a microphone is connected and configured.";
    }

    // This uses your existing function to show a message in the chat, NOT an alert.
    appendMessage(errorMessage, "bot");
  };
} else {
  // This part handles browsers that don't support voice recognition at all
  console.warn("Speech Recognition not supported in this browser.");
  voiceBtn.style.display = "none";
  // Optional: Inform the user that voice is not supported
  // You can uncomment the line below if you want a message to appear in chat
  // appendMessage("🔴 **Voice Not Supported**\n\nYour browser does not support the Web Speech API, so voice input is unavailable.", 'bot');
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
// --- START: Final App Initialization ---

// Get a reference to the status indicator in the header.
const statusIndicator = document.getElementById("status-indicator");

/**
 * Updates the status icon's color and sets a data-attribute for the custom tooltip.
 * @param {string|boolean} status - "pending", true (online), or false (offline).
 */
function updateStatus(status) {
  if (!statusIndicator) return;

  statusIndicator.classList.remove("online", "offline", "pending");

  if (status === "pending") {
    statusIndicator.classList.add("pending");
    // We now set a 'data-tooltip' attribute instead of the 'title'
    statusIndicator.dataset.tooltip =
      "Status: Pending. Send a message to check connection.";
  } else if (status === true) {
    statusIndicator.classList.add("online");
    statusIndicator.dataset.tooltip = "AILA is Online";
  } else {
    // status === false
    statusIndicator.classList.add("offline");
    statusIndicator.dataset.tooltip = "AILA is Offline";
  }
}
/**
 * Sends user login/registration events to the Google Sheet, including IP address.
 * @param {string} email - The user's email address.
 * @param {string} username - The user's display name.
 * @param {string} eventType - The type of event, e.g., 'PIN Registration', 'Google Login'.
 */
async function logUserEventToSheet(email, username, eventType) {
  let ipAddress = "not available";
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) throw new Error("Response not OK");
    const data = await response.json();
    ipAddress = data.ip;
  } catch (error) {
    console.warn("Could not fetch IP address:", error);
  }

  const payload = {
    timestamp: new Date().toISOString(),
    email: email,
    username: username,
    event: eventType,
    ipAddress: ipAddress,
  };

  try {
    // Securely invoke the 'log-event' Edge Function
    const { error } = await _supabase.functions.invoke('log-event', {
      body: JSON.stringify(payload),
    });

    if (error) throw error; // Rethrow Supabase-specific errors

    console.log(`Successfully logged '${eventType}' for ${username}.`);
  } catch (error) {
    console.error("Error logging user event via Edge Function:", error);
  }
}
async function loadOfflineData() {
  try {
    // Get auth session first
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
      console.warn('No session for offline data. Using fallback.');
      offlineResponses = { Error: "Not authenticated" };
      return;
    }

    // Securely invoke the 'get-offline-data' Edge Function via fetch
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-offline-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data && typeof data === 'object') {
      offlineResponses = data;
      isOfflineDataReady = true; // Mark offline data as ready
      console.log('[OFFLINE] Offline data loaded successfully. ' + Object.keys(data).length + ' entries');
    } else {
      throw new Error("Invalid data format from offline-data function");
    }

  } catch (error) {
    console.error('[OFFLINE] Could not load offline data:', error.message);
    // Hardcoded fallback
    offlineResponses = {
      Error: "Offline responses could not be loaded. Please check your connection or contact support."
    };
    isOfflineDataReady = true; // Mark as ready even if fallback
  }
}
// --- START: Updated initializeApp Function ---
async function initializeApp() {
  console.log('[INIT] AILA initializing - Loading offline data first...');
  
  // Load offline data first - must be done before anything else
  // This is CRITICAL: offline data must be available immediately
  await loadOfflineData();
  
  console.log('[INIT] Offline data ready - Loading admin configuration...');
  
  // Load admins from database
  await loadAdminsFromDatabase();

  // --- NEW: Check if user is already logged in (from localStorage) ---
  const storedUser = localStorage.getItem("loggedInUser");
  const storedAuth = localStorage.getItem("authToken");
  
  if (storedUser && storedAuth === "true") {
    // User was previously logged in
    // Verify session is still valid with Supabase
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
      // Session is still valid, load app in background (no loading overlay)
      isUserAuthenticated = true;
      
      // Hide loading overlay - we'll process in the main UI
      const loadingOverlay = document.getElementById("loading-overlay");
      if (loadingOverlay) {
        loadingOverlay.classList.add("hidden");
      }
      
      // Update user info FIRST - this sets isAdminUser flag
      await updateUserInfo();
      
      // AFTER updateUserInfo(), now set up DevTools blocker with correct admin status
      setupDevToolsBlocker();
      
      // Show welcome screen
      showWelcomeScreen();
      
      // Offline data already loaded at the start of initializeApp()
      // Load conversation history
      const { data: { session: currentSession } } = await _supabase.auth.getSession();
      if (currentSession) {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/conversation-history`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${currentSession.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list" }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const conversations = data.conversations || [];
          
          // If no conversations exist, show welcome screen
          if (conversations.length === 0) {
            showWelcomeScreen();
          } else {
            // Render the conversation history and show welcome screen
            renderConversationHistory(conversations);
            setTimeout(() => {
              showWelcomeScreen();
            }, 300);
          }
        } else {
          // Fallback to welcome screen if fetch fails
          showWelcomeScreen();
        }
      } else {
        // No session, show welcome screen
        showWelcomeScreen();
      }
      
      updateStatus("pending");
      return;
    } else {
      // Session expired, clear stored auth and show login
      localStorage.removeItem("authToken");
      localStorage.removeItem("loggedInUser");
    }
  }
  // --- END: Check for existing session ---
  
  // --- THIS IS THE FIX (Part 2): Check for the double-reload flag ---
  if (sessionStorage.getItem("justLoggedIn") === "true") {
    // ... (double-reload logic remains the same)
    sessionStorage.removeItem("justLoggedIn");
    const loadingOverlay = document.getElementById("loading-overlay");
    const statusText = document.getElementById("loading-status-text");
    if (loadingOverlay && statusText) {
      loadingOverlay.classList.remove("hidden");
      statusText.textContent = "Syncing account...";
      document.getElementById("loading-complete").classList.add("hidden");
      document.getElementById("enter-app-btn").classList.add("hidden");
    }
    setTimeout(() => {
        window.location.reload();
    }, 1000);
    return;
  }
  // --- End of Double-Reload Logic ---

  // For first-time visitors (loading screen flow), set up DevTools blocker
  setupDevToolsBlocker();

  if (window.location.hash.includes("access_token")) {
    // ... (google login redirect logic remains the same)
    const loadingOverlay = document.getElementById("loading-overlay");
    const statusText = document.getElementById("loading-status-text");
    if (loadingOverlay && statusText) {
      loadingOverlay.classList.remove("hidden");
      statusText.textContent = "Finalizing login...";
      document.getElementById("loading-in-progress").style.display = 'block';
      document.getElementById("loading-complete").classList.add("hidden");
      document.getElementById("loading-logo-container").style.display = 'flex';
      document.getElementById('enter-app-btn').classList.add('hidden');
    }
    setTimeout(() => { 
      window.location.href = AILA_URL;
    }, 1000);
    return;
  }

  const loadingLogo = document.getElementById("loading-logo");
  const clickMeText = document.getElementById("click-me-text");
  const statusText = document.getElementById("loading-status-text");
  const loadingInProgress = document.getElementById("loading-in-progress");
  const loadingComplete = document.getElementById("loading-complete");
  const enterAppBtn = document.getElementById("enter-app-btn");
  const loadingTip = document.getElementById("loading-tip");

  if (!loadingLogo || !statusText || !loadingComplete || !enterAppBtn || !loadingTip) {
    console.error("AILA Error: A critical loading element is missing.");
    return;
  }

  // --- START: FINAL Shatter & Reassemble Listener ---
const logoContainer = document.getElementById("loading-logo-container");
const mainLogo = document.getElementById("loading-logo");

if (logoContainer && mainLogo) {
  let isAnimating = false; // Use a single flag to prevent all clicks during the sequence

  logoContainer.addEventListener("click", () => {
    if (isAnimating) {
      return; // Exit if the shatter/reassemble sequence is already running
    }
    isAnimating = true;

    playSound(SFX.glassBreak, 0.7);

    // --- Shatter Phase ---
    mainLogo.style.opacity = "0";
    const pieces = []; // Array to hold our shatter pieces

    for (let i = 0; i < 16; i++) {
      const piece = document.createElement("div");
      piece.className = "shatter-piece";
      const row = Math.floor(i / 4);
      const col = i % 4;
      piece.style.backgroundPosition = `-${col * 32.5}px -${row * 32.5}px`;
      logoContainer.appendChild(piece);
      pieces.push(piece); // Store the piece

      // Animate the piece flying outwards
      setTimeout(() => {
        const randomX = (Math.random() - 0.5) * 400;
        const randomY = (Math.random() - 0.5) * 400;
        const randomRot = (Math.random() - 0.5) * 720;
        piece.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`;
        piece.style.opacity = "0";
      }, 20);
    }

    // --- Reassemble Phase ---
    // After a delay, start bringing the pieces back
    setTimeout(() => {
      pieces.forEach((piece, i) => {
        // Stagger the return of each piece for the "piece by piece" effect
        piece.style.transitionDelay = `${i * 25}ms`;
        // Reset transform and opacity to fly the piece back to its original spot
        piece.style.transform = 'translate(0, 0) rotate(0deg)';
        piece.style.opacity = '1';
      });

      // --- Final Cleanup ---
      // After the reassembly is complete, restore the original logo
      setTimeout(() => {
        logoContainer.innerHTML = ''; // Clear out all piece elements
        logoContainer.appendChild(mainLogo); // Add the original logo back
        mainLogo.style.opacity = "1";
        isAnimating = false; // Allow clicks again
      }, 1200); // Must be long enough for all pieces to return

    }, 1000); // Delay between shattering and starting to reassemble
  });
}
// --- END: FINAL Shatter & Reassemble Listener ---

  // Offline data is loaded at the very start of initializeApp()
  // No need to load it again here

  // ... (the rest of your tip cycling and loading animation logic remains the same)
  const loadingTips = [
      "AILA is made by a group of LA's from the ICTDp.",
      "If AILA gets stuck, try starting a new chat from the sidebar.",
      "You can ask AILA to explain complex topics in simple terms.",
      "REFRESH The Site if it's not Loading.",
      "AILA can remember the context of your current conversation.",
      "Use the 'Contact Developer' button if you need help with your trial."
  ];
  let tipInterval;

  function cycleLoadingTips() {
    loadingTip.style.opacity = '0';
    setTimeout(() => {
        const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
        loadingTip.innerHTML = `<strong>TIP: </strong> ${randomTip}`;
        loadingTip.style.opacity = '1';
    }, 500);
  }

  const firstTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
  loadingTip.innerHTML = `<strong>TIP: </strong> ${firstTip}`;
  loadingTip.style.opacity = '1';

  tipInterval = setInterval(cycleLoadingTips, 3000);

  loadingLogo.classList.add("restoring");
  if (clickMeText) clickMeText.style.opacity = "0";

  let stage = 1;
  const stages = [
    "Connecting to AILA's Network...",
    "Loading Resources...",
    "Waking Up AILA...",
    "Almost there...",
  ];

  function updateStatusText() {
    if (stage <= stages.length) {
      statusText.textContent = stages[stage - 1];
      stage++;
      setTimeout(updateStatusText, 400);
    }
  }

  setTimeout(updateStatusText, 100);

  setTimeout(async () => {
    loadingInProgress.classList.add("hidden");
    loadingComplete.classList.remove("hidden");
    const {
      data: { session },
    } = await _supabase.auth.getSession();
    if (session) {
      const email = session.user.email;
      const displayName = localStorage.getItem("loggedInUserName") || email.split("@")[0];
      const welcomeContainer = document.getElementById("welcome-message-container");
      const welcomeText = document.getElementById("welcome-message-text");
      const finalEnterBtn = document.getElementById("final-enter-btn");

      if (welcomeContainer && welcomeText && finalEnterBtn) {
        welcomeText.textContent = `Welcome back, ${displayName}!`;
        document.getElementById("enter-app-btn").classList.add("hidden");
        welcomeContainer.classList.remove("hidden");
        finalEnterBtn.addEventListener("click", () =>
          handleSuccessfulLogin(email)
        );
      }
    } else {
      enterAppBtn.classList.remove("hidden");
    }
  }, stages.length * 400 + 200);

}
// --- END: Updated initializeApp Function ---

const ro = new MutationObserver(
  () => (messagesEl.scrollTop = messagesEl.scrollHeight)
);
ro.observe(messagesEl, { childList: true, subtree: true });

//window.addEventListener("load", () => setTimeout(() => input.focus(), 250)); disaabled//
// Start the application by calling our new initializer function.
initializeApp();
// --- Cleanup sounds on page exit (Reliable Method) ---
// The 'pagehide' event is the correct and most reliable way to stop audio when a tab is closed.
window.addEventListener("pagehide", () => {
  // Stop the ambient sound if it's playing
  if (ambientSound) {
    ambientSound.pause();
    ambientSound.currentTime = 0;
  }
  // Also stop the typing sound, just in case
  if (typingSound) {
    typingSound.pause();
    typingSound.currentTime = 0;
  }
});
// --- Event Listener for Dynamic Copy Buttons ---
messagesEl.addEventListener("click", (e) => {
  // Check if the clicked element is a copy button
  if (e.target.classList.contains("copy-btn")) {
    const btn = e.target;
    const pre = btn.closest("pre"); // Find the parent code block
    if (pre) {
      const code = pre.querySelector("code");
      if (code) {
        // Use the modern Clipboard API to copy the text
        navigator.clipboard
          .writeText(code.innerText)
          .then(() => {
            // Provide visual feedback to the user
            btn.textContent = "Copied!";
            // Reset the button text after 2 seconds
            setTimeout(() => {
              btn.textContent = "Copy";
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
            btn.textContent = "Error"; // Show an error message on the button
          });
      }
    }
  }
});
// --- START: Authentication Modal Logic ---

// This function will set up everything related to the auth modal.
// We run it after the window loads to ensure all HTML elements are ready.
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const confirmModal = document.getElementById("confirmModal");
    const confirmTitle = document.getElementById("confirmTitle");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmYesBtn = document.getElementById("confirmYesBtn");
    const confirmNoBtn = document.getElementById("confirmNoBtn");

    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmModal.classList.remove("hidden");

    const resolveAndClose = (value) => {
      confirmModal.classList.add("hidden");
      resolve(value);
    };

    confirmYesBtn.onclick = () => resolveAndClose(true);
    confirmNoBtn.onclick = () => resolveAndClose(false);
  });
}

// (This entire function replaces the old handleSuccessfulLogin function)
function handleSuccessfulLogin(email, isNewUser = false) {
    isUserAuthenticated = true;
  localStorage.setItem("loggedInUser", email);
  localStorage.setItem("authToken", "true");
  if (isNewUser) {
    localStorage.setItem("trialStartDate", new Date().toISOString());
  }

  // --- START: FIX FOR LOGIN SOUNDS ---
  // Stop the loading screen's ambient sound if it is running.
  if (ambientSound) {
    ambientSound.pause();
    ambientSound.currentTime = 0;
    ambientSound = null; // Dereference to allow garbage collection
  }
  // Play the "whoosh" sound effect to signal entering the app.
  playSound(SFX.whoosh, 0.7);
  // --- END: FIX FOR LOGIN SOUNDS ---

  const loadingOverlay = document.getElementById("loading-overlay");

  // Hide all overlays and modals
  if (loadingOverlay) loadingOverlay.classList.add("hidden");
  closeModal();

  // Now, show the main application screen and update user info
  updateUserInfo();
  showWelcomeScreen();
  
  // DevTools blocker is already active and will check isAdminUser flag dynamically
  
  updateStatus("pending");
}

// --- START: DEVTOOLS BLOCKER FOR NON-ADMINS ---
function setupDevToolsBlocker() {
  // Show friendly message
  const showBlockMessage = () => {
    console.warn(
      "%c⚠️ Developer Tools are Restricted",
      "color: #FFC107; font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%cThis application restricts developer tools access.\nOnly admins can access developer tools. If you need assistance, please contact the developer.",
      "color: #8b949e; font-size: 12px;"
    );
  };

  // Check if user should be blocked (called dynamically on each event)
  const shouldBlockDevTools = () => {
    return !(isUserAuthenticated && isAdminUser);
  };

  // Block keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Only block if user is NOT an admin
    if (!shouldBlockDevTools()) return;

    // F12 (DevTools)
    if (e.key === "F12") {
      e.preventDefault();
      showBlockMessage();
      return false;
    }

    // Ctrl+Shift+I (Chrome/Firefox DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
      e.preventDefault();
      showBlockMessage();
      return false;
    }

    // Ctrl+U (View Page Source)
    if (e.ctrlKey && e.key === "u") {
      e.preventDefault();
      showBlockMessage();
      return false;
    }

    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === "C") {
      e.preventDefault();
      showBlockMessage();
      return false;
    }

    // Ctrl+Shift+J (Console on some browsers)
    if (e.ctrlKey && e.shiftKey && e.key === "J") {
      e.preventDefault();
      showBlockMessage();
      return false;
    }

    // F11 (Fullscreen)
    if (e.key === "F11") {
      e.preventDefault();
      return false;
    }
  });

  // Block right-click context menu
  document.addEventListener("contextmenu", (e) => {
    // Only block if user is NOT an admin
    if (!shouldBlockDevTools()) return;
    
    e.preventDefault();
    showBlockMessage();
    return false;
  });

  // Detect if someone tries to open DevTools (this is a basic check)
  const devtoolsCheck = setInterval(() => {
    // Only block if user is NOT an admin
    if (!shouldBlockDevTools()) return;
    
    const threshold = 160; // Height threshold to detect DevTools opening
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
      console.warn(
        "%c⚠️ DevTools Detected - Access Restricted",
        "color: #FF6B6B; font-size: 14px; font-weight: bold;"
      );
    }
  }, 500);
}
// --- END: DEVTOOLS BLOCKER FOR NON-ADMINS ---

function setupAuthModal() {
  // 1. Get all elements from the DOM.
  const authModal = document.getElementById("authModal");
  const authCloseBtn = document.getElementById("authCloseBtn");
  const authTitle = document.getElementById("authTitle");
  const authActionBtn = document.getElementById("authActionBtn");
  const authForm = document.getElementById("authForm");
  const enterAppBtn = document.getElementById("enter-app-btn");
  const customAlert = document.getElementById("customAlert");
  const pinGroup = document.getElementById("pinGroup");
  const pinContainer = document.getElementById("pinContainer");
  const pinConfirmGroup = document.getElementById("pinConfirmGroup");
  const pinConfirmContainer = document.getElementById("pinConfirmContainer");

  // --- START: PIN VISIBILITY ELEMENTS ---
  const togglePinBtn = document.getElementById("togglePinBtn");
  const togglePinConfirmBtn = document.getElementById("togglePinConfirmBtn");
  // --- END: PIN VISIBILITY ELEMENTS ---

  const successScreen = document.getElementById("successScreen");
  const successMessage = document.getElementById("successMessage");
  const finalEnterBtn = document.getElementById("finalEnterBtn");

  const registerLink = document.getElementById("registerLink");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const backToLoginLink = document.getElementById("backToLoginLink");
  const googleLoginBtn = document.getElementById("googleLoginBtn");

  let authState = "login";
  let alertTimeout;

  // 2. Define all functions.
  // A reusable function to show a confirmation modal

  function showCustomAlert(message, type = "error") {
    clearTimeout(alertTimeout);
    customAlert.textContent = message;
    customAlert.classList.toggle("success", type === "success");
    customAlert.classList.remove("hidden");
    alertTimeout = setTimeout(() => customAlert.classList.add("hidden"), 4000);
  }

  function showAuthModal() {
    setAuthState("login"); // Always default to login state when opening
    authModal.classList.remove("hidden");
  }

  function closeAuthModal() {
    authModal.classList.add("hidden");
  }

  // --- START: NEW PIN TOGGLE FUNCTION ---
  function togglePinVisibility(container, button) {
    const inputs = container.querySelectorAll(".pin-digit");
    const eyeIcon = button.querySelector(".eye-icon"); // The REGULAR eye
    const eyeOffIcon = button.querySelector(".eye-off-icon"); // The SLASHED eye

    const isCurrentlyHidden = inputs[0].type === "password";

    if (isCurrentlyHidden) {
      // It's hidden, so SHOW it
      inputs.forEach((input) => {
        input.type = "text";
      });
      // And update icon to show the OPEN eye (representing the new "visible" state)
      eyeIcon.style.display = "block";
      eyeOffIcon.style.display = "none";
    } else {
      // It's visible, so HIDE it
      inputs.forEach((input) => {
        input.type = "password";
      });
      // And update icon to show the SLASHED eye (representing the new "hidden" state)
      eyeIcon.style.display = "none";
      eyeOffIcon.style.display = "block";
    }
  }
  // --- END: NEW PIN TOGGLE FUNCTION ---

  // (This entire function replaces the old setAuthState function)
  function setAuthState(newState) {
    authState = newState;
    const btnText = authActionBtn.querySelector(".btn-text");

    // Get references to all the elements we need to toggle
    const googleLoginBtn = document.getElementById("googleLoginBtn");
    const separator = document.getElementById("authSeparator");
    const usernameGroup = document.getElementById("usernameGroup");
    const pinGroup = document.getElementById("pinGroup");
    const pinConfirmGroup = document.getElementById("pinConfirmGroup");
    const privacyAcceptanceGroup = document.getElementById("privacyAcceptanceGroup");
    const privacyCheckbox = document.getElementById("privacyCheckbox");
    const registerLink = document.getElementById("registerLink");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const backToLoginLink = document.getElementById("backToLoginLink");

    // --- Reset to a default 'login' view ---
    authTitle.textContent = "Login to AILA";
    btnText.textContent = "Login";
    authForm.style.display = "block";
    successScreen.classList.add("hidden");
    googleLoginBtn.style.display = "block";
    separator.style.display = "block";
    pinGroup.style.display = "block";
    usernameGroup.classList.add("hidden");
    pinConfirmGroup.classList.add("hidden");
    privacyAcceptanceGroup.classList.add("hidden");
    authActionBtn.disabled = false;
    registerLink.style.display = "inline";
    forgotPasswordLink.style.display = "inline";
    backToLoginLink.classList.add("hidden");

    // --- Apply changes for other states ---
    if (newState === "register") {
      authTitle.textContent = "Create an Account";
      btnText.textContent = "Register";

      // Hide Google login and show username field
      googleLoginBtn.style.display = "none";
      separator.style.display = "none";
      usernameGroup.classList.remove("hidden");
      pinConfirmGroup.classList.remove("hidden");
      privacyAcceptanceGroup.classList.remove("hidden");
      privacyCheckbox.checked = false; // Reset checkbox
      authActionBtn.disabled = true; // Disable until privacy is accepted

      // Adjust links
      registerLink.style.display = "none";
      forgotPasswordLink.style.display = "none";
      backToLoginLink.classList.remove("hidden");
    } else if (newState === "reset") {
      authTitle.textContent = "Reset Password";
      btnText.textContent = "Send Instructions";

      // Hide elements not needed for reset
      pinGroup.style.display = "none";
      googleLoginBtn.style.display = "none";
      separator.style.display = "none";

      // Adjust links
      registerLink.style.display = "none";
      forgotPasswordLink.style.display = "none";
      backToLoginLink.classList.remove("hidden");
    }
  }

function showWelcomeAndEnter(email, isNewUser) {
  authForm.style.display = "none"; // Hide the form
  successScreen.classList.remove("hidden"); // Show the success screen

  // --- THIS IS THE FIX ---
  // Get the user's full name from localStorage, with a fallback to the username.
  const displayName = localStorage.getItem("loggedInUserName") || email.split("@")[0];

  successMessage.textContent = isNewUser
    ? `Welcome, ${displayName}!`
    : `Welcome back, ${displayName}!`;
}

  function setupPinInput(container) {
    if (!container) return;
    const inputs = [...container.querySelectorAll(".pin-digit")];
    inputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        // Use 'tel' type but only allow digits via this regex
        input.value = input.value.replace(/\\D/g, "");
        if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0)
          inputs[index - 1].focus();
      });
    });
  }

  function getPinFromContainer(container) {
    if (!container) return "";
    return [...container.querySelectorAll(".pin-digit")]
      .map((input) => input.value)
      .join("");
  }

  // 3. Attach all event listeners.

  if (enterAppBtn) enterAppBtn.addEventListener("click", showAuthModal);
  if (authCloseBtn) authCloseBtn.addEventListener("click", closeAuthModal);
  if (registerLink)
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      setAuthState("register");
    });
  if (forgotPasswordLink)
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      setAuthState("reset");
    });
  if (backToLoginLink)
    backToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      setAuthState("login");
    });

  // --- START: ADD PIN VISIBILITY LISTENERS ---
  if (togglePinBtn) {
    togglePinBtn.addEventListener("click", () =>
      togglePinVisibility(pinContainer, togglePinBtn)
    );
  }
  if (togglePinConfirmBtn) {
    togglePinConfirmBtn.addEventListener("click", () =>
      togglePinVisibility(pinConfirmContainer, togglePinConfirmBtn)
    );
  }
  // --- END: ADD PIN VISIBILITY LISTENERS ---

  // --- START: PRIVACY CHECKBOX LISTENER ---
  const privacyCheckbox = document.getElementById("privacyCheckbox");
  if (privacyCheckbox) {
    privacyCheckbox.addEventListener("change", () => {
      authActionBtn.disabled = !privacyCheckbox.checked;
    });
  }
  // --- END: PRIVACY CHECKBOX LISTENER ---

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const { error } = await _supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // This is the fix: It tells Supabase where to return after a successful login.
          redirectTo: AILA_URL,
        },
      });
      if (error) {
        showCustomAlert(error.message);
      }
    });
  }
  // (This block should be added right after the googleLoginBtn listener)

  const facebookLoginBtn = document.getElementById("facebookLoginBtn");

  if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const { error } = await _supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          // This tells Supabase where to return after a successful login.
          redirectTo: AILA_URL,
        },
      });
      if (error) {
        showCustomAlert(error.message);
      }
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      authActionBtn.classList.add("loading");
      authActionBtn.disabled = true;

      const email = document.getElementById("email").value;

      try {
        if (authState === "reset") {
          // This sends a password reset link to the user's email.
          const { error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "reset.html",
          });

          if (error) {
            throw error;
          }

          showCustomAlert(
            "Password reset instructions sent to your email.",
            "success"
          );

          // After 3 seconds, switch the form back to the login view.
          setTimeout(() => {
            setAuthState("login");
          }, 3000);
        } else {
          const pin = getPinFromContainer(pinContainer);
          const pinConfirm = getPinFromContainer(pinConfirmContainer);

          if (pin.length !== 6)
            throw new Error("PIN must be exactly 6 digits.");

          if (authState === "register") {
            const username = document.getElementById("username").value;
            if (!username.trim()) throw new Error("Username cannot be empty.");
            if (pin !== pinConfirm)
              throw new Error("The PINs you entered do not match.");
            
            // Check if privacy policy is accepted
            const privacyCheckbox = document.getElementById("privacyCheckbox");
            if (!privacyCheckbox || !privacyCheckbox.checked) {
              throw new Error("You must accept the Privacy Policy to register.");
            }

            // --- START: THIS IS THE FIX ---
            // Step 1: Sign up the user. Supabase automatically signs them in on success.
            const { error } = await _supabase.auth.signUp({
              email,
              password: pin,
              options: { data: { full_name: username } },
            });
            if (error) throw error;

            // Step 2: Log the registration event to your Google Sheet.
            await logUserEventToSheet(email, username, "PIN Registration");

            // Step 3: Immediately handle the successful login and load the app.
            // We pass 'true' to indicate this is a new user for the trial logic.
            handleSuccessfulLogin(email, true);
            
            // Reload the page after 1 second to ensure all data is refreshed
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            // --- END: THIS IS THE FIX ---

          } else {
            // This is the existing login logic, which remains the same.
            const { data, error } = await _supabase.auth.signInWithPassword({
              email,
              password: pin,
            });
            if (error) throw error;

            const user = data.user;
            const displayName =
              user.user_metadata && user.user_metadata.full_name
                ? user.user_metadata.full_name
                : user.email.split("@")[0];
            await logUserEventToSheet(email, displayName, "PIN Login");

            handleSuccessfulLogin(email);
            
            // Reload the page after 1 second to ensure all data is refreshed
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } catch (error) {
        if (error.message.includes("User already registered")) {
          showCustomAlert("User already registered. Please log in.");
        } else if (error.message.includes("Invalid login credentials")) {
          showCustomAlert("Email not registered or incorrect PIN.");
        } else {
          showCustomAlert(error.message);
        }
      } finally {
        authActionBtn.classList.remove("loading");
        authActionBtn.disabled = false;
      }
    });
  }

  if (finalEnterBtn) {
    finalEnterBtn.addEventListener("click", () => {
      const email = localStorage.getItem("loggedInUser"); // Get the email we'll need
      handleSuccessfulLogin(email);
    });
  }

  setupPinInput(pinContainer);
  setupPinInput(pinConfirmContainer);
}

// Run the setup function after the page has fully loaded
window.addEventListener("load", () => {
  setupAuthModal();
  setupNavigation();
});

// --- END: Authentication Modal Logic ---
// --- START: User Info Update ---
let trialInterval; // Keep a reference to the timer to clear it on logout

async function updateUserInfo() {
  // Clear any existing timer before starting a new one
  if (trialInterval) clearInterval(trialInterval);

  // --- THIS IS THE FIX (PART 1) ---
  // Reset the global trial status every time a user's info is updated.
  // This ensures a new user with a valid trial doesn't get locked out.
  isTrialExpired = false;
  // --- END OF FIX (PART 1) ---

  // --- Get all DOM elements ---
  const userEmailEl = document.getElementById("userEmail");
  const userAvatarEl = document.getElementById("userAvatar");
  const trialStatusEl = document.getElementById("trialStatus");
  const menuUserAvatarEl = document.getElementById("menuUserAvatar");
  const menuUserNameEl = document.getElementById("menuUserName");
  const menuUserEmailEl = document.getElementById("menuUserEmail");
  const trialTimerEl = document.getElementById("trialTimer");
  const chatInput = document.getElementById("input");
  const chatSendBtn = document.getElementById("sendBtn");
  const voiceBtn = document.getElementById("voiceBtn");

  // Re-enable the form by default when this function runs.
  if (chatInput) {
    chatInput.disabled = false;
    chatInput.placeholder = "Ask AILA anything…";
  }
  if (chatSendBtn) chatSendBtn.disabled = false;
  if (voiceBtn) voiceBtn.disabled = false;

  // --- Fetch session from Supabase ---
  const {
    data: { session },
  } = await _supabase.auth.getSession();

  if (session) {
    const user = session.user;

    const displayName =
      user.user_metadata && user.user_metadata.full_name
        ? user.user_metadata.full_name
        : user.email.split("@")[0];
    localStorage.setItem("loggedInUserName", displayName);

    const avatarContent =
      user.app_metadata.provider === "google" && user.user_metadata
        ? `<img src="${user.user_metadata.avatar_url}" alt="User Avatar" class="user-avatar-img">`
        : `<span id="userInitial">${displayName
            .charAt(0)
            .toUpperCase()}</span>`;

    userEmailEl.textContent = displayName;
    userAvatarEl.innerHTML = avatarContent;
    menuUserNameEl.textContent = displayName;
    menuUserEmailEl.textContent = user.email;
    menuUserAvatarEl.innerHTML = avatarContent;
        // --- START: Dev Tools Button Visibility & Admin Status ---
    const devToolsBtn = document.getElementById("devToolsBtn");
    isAdminUser = adminEmails.includes(user.email);
    
    if (devToolsBtn) {
      if (isAdminUser) {
        devToolsBtn.classList.remove("hidden");
      } else {
        devToolsBtn.classList.add("hidden");
      }
    }
    // --- END: Dev Tools Button Visibility & Admin Status ---


    // --- Real-time Trial Countdown Logic ---
    const customTrialDays = user.user_metadata.custom_trial_days;
    const trialDays =
      typeof customTrialDays === "number" && customTrialDays >= 0
        ? customTrialDays
        : 30; // Default is 30 days

    let trialEndDate = new Date(
      new Date(user.created_at).setDate(
        new Date(user.created_at).getDate() + trialDays
      )
    );

    trialInterval = setInterval(() => {
      const now = new Date();
      const diffTime = trialEndDate - now;

      if (diffTime <= 0) {
        trialStatusEl.textContent = "Trial Expired";
        trialStatusEl.style.color = "var(--danger)";
        trialTimerEl.textContent = "EXPIRED";
        clearInterval(trialInterval);

        // --- THIS IS THE FIX (PART 2) ---
        // Set the global flag to true and disable the chat.
        isTrialExpired = true;
        if (chatInput) {
          chatInput.disabled = true;
          chatInput.placeholder = "Your trial has expired.";
        }
        if (chatSendBtn) chatSendBtn.disabled = true;
        if (voiceBtn) voiceBtn.disabled = true;
        // --- END OF FIX (PART 2) ---
        return;
      }

      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

      trialStatusEl.textContent = `Trial: ${days} days left`;
      trialStatusEl.style.color = days < 7 ? "#FFC107" : "var(--success)";
      trialTimerEl.textContent = `${String(days).padStart(2, "0")}:${String(
        hours
      ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
    }, 1000);
  } else {
    // --- Handle logged out state ---
    userEmailEl.textContent = "Not logged in";
    userAvatarEl.innerHTML = `<span id="userInitial">?</span>`;
    trialStatusEl.textContent = "";
    if (trialTimerEl) trialTimerEl.textContent = "--:--:--:--";
  }

  // Load conversation history for the user
  loadConversationHistory();
}
// --- START: DEV TOOLS MODAL ---
function openDevToolsModal() {
  // Use the existing universal modal
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modal = document.getElementById("universalModal");

  modalTitle.textContent = "Developer Tools";

  // Create the form content for the modal body
  modalBody.innerHTML = `
    <div class="dev-tools-section">
      <h3 class="dev-tools-title">Set User Trial Days</h3>
      <form id="setTrialForm" class="dev-tools-form">
        <div class="form-group">
          <label for="targetEmail">User Email:</label>
          <input type="email" id="targetEmail" required placeholder="user@example.com">
        </div>
        <div class="form-group">
          <label for="trialDays">Trial Days:</label>
          <input type="number" id="trialDays" required placeholder="e.g., 90">
        </div>
        <button type="submit" id="setTrialBtn" class="dev-tool-btn">Set Trial</button>
      </form>
      <div id="devToolsAlert" class="custom-alert hidden" style="margin-top: 15px;"></div>
    </div>
  `;

  // Show the modal
  modal.classList.add("visible");

  // Add the logic for the form submission
  const setTrialForm = document.getElementById("setTrialForm");
  if (setTrialForm) {
    setTrialForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const targetEmail = document.getElementById("targetEmail").value;
      const days = parseInt(document.getElementById("trialDays").value, 10);
      const setTrialBtn = document.getElementById("setTrialBtn");
      const devToolsAlert = document.getElementById("devToolsAlert");

      if (!targetEmail || isNaN(days)) {
        devToolsAlert.textContent = "Please fill in all fields correctly.";
        devToolsAlert.classList.remove("hidden", "success");
        return;
      }
      
      setTrialBtn.disabled = true;
      setTrialBtn.textContent = "Setting...";

      // We re-use the existing admin function!
      await adminSetTrialDays(targetEmail, days);
      
      // Give feedback
      devToolsAlert.textContent = "Successfully set trial for ${targetEmail} to ${days} days. User must log out and back in to see the change.";
      devToolsAlert.classList.remove("hidden");
      devToolsAlert.classList.add("success");


      setTrialBtn.disabled = false;
      setTrialBtn.textContent = "Set Trial";

      // Close the modal after a short delay
      setTimeout(() => {
        closeModal();
      }, 3000);
    });
  }
}
// --- END: DEV TOOLS MODAL ---

function setupNavigation() {
  // Get ALL elements from the DOM
  const navSidebar = document.getElementById("navSidebar");
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const newChatBtn = document.getElementById("newChatBtn");
  const contactDevBtn = document.getElementById("contactDevBtn"); // <-- ADD THIS
  const userProfileBtn = document.getElementById("userProfile");
  const userMenu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");

    // --- Mobile Swipe Gesture Logic ---
    let touchStartX = 0;
    let touchEndX = 0;
    // --- START: THIS IS THE FIX ---
    // We increase the swipe distance required to 50px to prevent accidental swipes.
    const swipeThreshold = 50; 
    // We also restrict the swipe-to-open gesture to the first 40px of the screen edge.
    const edgeThreshold = 100; 
    // --- END: THIS IS THE FIX ---
  
    function handleSwipeGesture() {
      // Only run on mobile
      if (window.innerWidth > 900) return;
  
      // 1. SWIPE-TO-OPEN (Left to Right)
      if (
        !navSidebar.classList.contains("expanded") &&
        touchStartX < edgeThreshold
      ) {
        if (touchEndX - touchStartX > swipeThreshold) {
          navSidebar.classList.add("expanded"); // Open sidebar
        }
      }
  
      // 2. SWIPE-TO-CLOSE (Right to Left)
      if (navSidebar.classList.contains("expanded")) {
        if (touchStartX - touchEndX > swipeThreshold) {
          navSidebar.classList.remove("expanded"); // Close sidebar
        }
      }
    }
  
    document.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
  
    document.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
      },
      { passive: true }
    );

  // --- Desktop Toggle Logic ---
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", () => {
      navSidebar.classList.toggle("expanded");
      // Close history section whenever sidebar toggle is clicked
      const historySection = document.getElementById("historySection");
      if (historySection) {
        historySection.classList.add("hidden");
      }
    });
  }

  // --- Mobile Toggle Logic ---
  function toggleMobileNav() {
    navSidebar.classList.toggle("expanded");
    // Close history section when collapsing sidebar
    if (!navSidebar.classList.contains("expanded")) {
      const historySection = document.getElementById("historySection");
      if (historySection) {
        historySection.classList.add("hidden");
      }
    }
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener("click", toggleMobileNav);
  }

  // --- Common Button Logic ---
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      startNewConversation();
      // If on mobile and sidebar is open, close it
      if (
        window.innerWidth <= 900 &&
        navSidebar.classList.contains("expanded")
      ) {
        toggleMobileNav();
      }
    });
  }

  // --- START: CONTACT DEVELOPER BUTTON LOGIC (Updated) ---
  if (contactDevBtn) {
    contactDevBtn.addEventListener("click", () => {
      // This now navigates the user to your new, dedicated contact form page.
      window.location.href = 'pages/form.html';
    });
  }
  // --- END: CONTACT DEVELOPER BUTTON LOGIC (Updated) ---
  // --- START: DEV TOOLS BUTTON LOGIC ---
  const devToolsBtn = document.getElementById("devToolsBtn");
  if (devToolsBtn) {
    devToolsBtn.addEventListener("click", () => {
        window.location.href = "admin/index.html";
    });
  }
  // --- END: DEV TOOLS BUTTON LOGIC ---

  // --- START: CONVERSATION HISTORY BUTTON LOGIC ---
  const historyToggleBtn = document.getElementById("historyToggleBtn");
  const historySection = document.getElementById("historySection");
  const historySearch = document.getElementById("historySearch");
  
  if (historyToggleBtn && historySection) {
    historyToggleBtn.addEventListener("click", () => {
      historySection.classList.toggle("hidden");
      
      // Auto-expand sidebar when history is clicked (if sidebar is compressed)
      if (navSidebar && !navSidebar.classList.contains("expanded")) {
        navSidebar.classList.add("expanded");
      }
      
      if (!historySection.classList.contains("hidden")) {
        const sortBy = document.getElementById("historyFilter")?.value || "newest";
        loadConversationHistory(sortBy);
      }
    });
  }

  if (historySearch) {
    historySearch.addEventListener("input", (e) => {
      searchConversations(e.target.value);
    });
  }

  const historyFilter = document.getElementById("historyFilter");
  if (historyFilter) {
    historyFilter.addEventListener("change", (e) => {
      loadConversationHistory(e.target.value);
    });
  }
  // --- END: CONVERSATION HISTORY BUTTON LOGIC ---

  // --- User Profile Menu Logic ---
  if (userProfileBtn && userMenu) {
    userProfileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("hidden");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const isConfirmed = await showConfirm(
        "Confirm Logout",
        "Are you sure you want to log out?"
      );
      if (isConfirmed) {
        // --- START: Reset admin status on logout ---
        isUserAuthenticated = false;
        isAdminUser = false;
        // --- END: Reset admin status on logout ---
        await _supabase.auth.signOut();
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("authToken");
        window.location.reload();
      }
    });
  }

  // --- CONSOLIDATED "CLICK OUTSIDE" HANDLER ---
  window.addEventListener("click", (e) => {
    // 1. Close user menu if it's open and the click is outside
    if (
      userMenu &&
      !userMenu.classList.contains("hidden") &&
      !userMenu.contains(e.target) &&
      !userProfileBtn.contains(e.target)
    ) {
      userMenu.classList.add("hidden");
    }

    // 2. Close sidebar if it's open and the click is outside
    if (
      navSidebar.classList.contains("expanded") &&
      !navSidebar.contains(e.target)
    ) {
      const isMobile = window.innerWidth <= 900;
      // Check if the click was on the mobile toggle button
      const isMobileToggle = mobileNavToggle
        ? mobileNavToggle.contains(e.target)
        : false;

      if (isMobile && !isMobileToggle) {
        toggleMobileNav(); // Close on mobile
      } else if (!isMobile) {
        navSidebar.classList.remove("expanded"); // Close on desktop
        // Also close history section when sidebar closes on desktop
        const historySection = document.getElementById("historySection");
        if (historySection) {
          historySection.classList.add("hidden");
        }
      }
    }

    // 3. Close history section if clicking outside sidebar on mobile
    const historySection = document.getElementById("historySection");
    const isMobile = window.innerWidth <= 900;
    if (isMobile && historySection && !historySection.classList.contains("hidden")) {
      if (!navSidebar.contains(e.target)) {
        historySection.classList.add("hidden");
      }
    }
  });
}
async function adminSetTrialDays(targetEmail, days) {
  if (!targetEmail || typeof days !== "number") {
    console.error(
      "ADMIN: 🛑 USAGE ERROR: Please provide a target email and the number of days. Example: adminSetTrialDays('user@example.com', 90)"
    );
    return;
  }

  console.log(
    `ADMIN: ⏳ Invoking secure function to set trial for ${targetEmail} to ${days} days...`
  );

  try {
    const { data, error } = await _supabase.functions.invoke("set-trial-days", {
      body: { targetEmail, days },
    });

    if (error) throw error; // This will be caught by the catch block below

    // This handles errors returned gracefully from the function itself
    if (data.error) {
      console.error(`ADMIN: ❌ FUNCTION FAILED: ${data.error}`);
    } else {
      console.log(`ADMIN: ✅ SUCCESS: ${data.message}`);
      console.log(
        "ADMIN: 👉 The user must log out and log back in for the change to take effect."
      );
    }
  } catch (error) {
    // This is the crucial part for debugging.
    console.error("ADMIN: ❌ INVOCATION FAILED: The server returned an error.");

    // The real error message is often nested inside the 'context' object.
    if (error.context && error.context.error) {
      console.error("ADMIN: ❗ SERVER SAYS:", error.context.error);
    } else {
      // If the structure is different, log the entire object for inspection.
      console.error("ADMIN: ❗ Raw error object:", error);
    }
  }
}
// This function allows an admin to securely log in as another user.
// --- START: ADMIN IMPERSONATION FUNCTION (with better error handling) ---
async function adminLoginAsUser(targetEmail) {
  if (!targetEmail) {
    console.error(
      "ADMIN: 🛑 USAGE ERROR: Please provide the user's email. Example: adminLoginAsUser('user@example.com')"
    );
    return;
  }

  console.log(`ADMIN: ⏳ Generating secure login link for ${targetEmail}...`);

  try {
    const { data, error } = await _supabase.functions.invoke(
      "impersonate-user",
      {
        body: { targetEmail },
      }
    );

    // This error is for network issues or if the function doesn't exist.
    if (error) throw error;

    // This is for errors returned *from our function's code*.
    if (data.error) {
      console.error(`ADMIN: ❌ FUNCTION FAILED: ${data.error}`);
    } else {
      console.log(
        "ADMIN:✅ SUCCESS! Click the link below to log in as the user."
      );
      console.log("👉 " + data.magicLink);
      console.log(
        "To return to your admin account, simply log out from the user's session."
      );
    }
    setTimeout(() => { 
      window.location.href = AILA_URL;
    }, 2000);
    return;
  } catch (error) {
    // This block catches the server errors (like the 400 Bad Request).
    console.error("ADMIN: ❌ INVOCATION FAILED: The server returned an error.");

    // The real error message from the server is inside 'error.context'.
    if (error.context && error.context.error) {
      console.error("ADMIN: ❗ SERVER SAYS:", error.context.error);
    } else {
      // If the structure is weird, log the whole object for debugging.
      console.error("ADMIN: ❗ Raw error object:", error);
    }
  }
}
// ========== CONVERSATION HISTORY FUNCTIONS ========== //

// --- START: NEW CONVERSATION FUNCTION ---
function startNewConversation() {
  // Clear current conversation
  currentConversationId = null;
  conversationMessages = [];
  
  // Clear messages display
  const messagesContainer = document.getElementById("messages");
  if (messagesContainer) {
    messagesContainer.innerHTML = "";
  }
  
  // Show welcome screen
  showWelcomeScreen();
  
  // Update history UI to deselect current conversation
  updateHistoryActiveState();
  
  console.log('[CONVERSATION] New conversation started');
}
// --- END: NEW CONVERSATION FUNCTION ---

async function saveConversation(title = "") {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    // Use conversationMessages array instead of DOM scraping to avoid malformed data
    if (!conversationMessages || conversationMessages.length === 0) return;

    const messages = conversationMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch(`${SUPABASE_URL}/functions/v1/conversation-history`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "save",
        conversationId: currentConversationId,
        title: title,
        messages: messages,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save conversation");
      return;
    }

    const data = await response.json();
    if (data.id && !currentConversationId) {
      currentConversationId = data.id;
    }
    
    // Move this conversation to the top of history AFTER saving a new message
    // But only if we're not currently just loading an existing conversation
    if (!isLoadingConversation) {
      await updateConversationPosition();
    }
    
    console.log('[CONVERSATION] Conversation saved');
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

async function loadConversationHistory(sortBy = "newest") {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/conversation-history`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "list" }),
    });

    if (!response.ok) return;

    const data = await response.json();
    let conversations = data.conversations || [];
    
    // Sort by date
    if (sortBy === "oldest") {
      conversations.reverse();
    }
    
    renderConversationHistory(conversations);
  } catch (error) {
    console.error("Error loading conversation history:", error);
  }
}

// Only updates the active state without reordering the list
function updateHistoryActiveState() {
  const historyItems = document.querySelectorAll(".history-item");
  historyItems.forEach((item) => {
    item.classList.remove("active");
  });
  
  // Find and highlight the current conversation
  historyItems.forEach((item) => {
    if (item.dataset.conversationId === currentConversationId) {
      item.classList.add("active");
    }
  });
}

// Move conversation to the top of the history list after a new message is sent
async function updateConversationPosition() {
  try {
    // Reload history with newest first to put this conversation at the top
    await loadConversationHistory("newest");
  } catch (error) {
    console.error("Error updating conversation position:", error);
  }
}

function renderConversationHistory(conversations) {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  historyList.innerHTML = "";

  if (conversations.length === 0) {
    historyList.innerHTML = '<p style="color: #8b949e; font-size: 12px; text-align: center; padding: 16px;">No conversations yet</p>';
    return;
  }

  conversations.forEach((conv) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.dataset.conversationId = conv.id;
    if (conv.id === currentConversationId) {
      item.classList.add("active");
    }

    const title = document.createElement("div");
    title.className = "history-item-title";
    title.textContent = conv.title;
    title.title = conv.title;

    const actions = document.createElement("div");
    actions.className = "history-item-actions";

    const renameBtn = document.createElement("button");
    renameBtn.className = "history-action-btn";
    renameBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3"></path></svg>';
    renameBtn.title = "Rename";
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      enableInlineEdit(title, conv.id, conv.title);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "history-action-btn delete";
    deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteBtn.title = "Delete";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      showDeleteConfirmation(conv.id, conv.title);
    };

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(title);
    item.appendChild(actions);

    item.onclick = () => loadConversation(conv.id);

    historyList.appendChild(item);
  });
}

async function loadConversation(conversationId) {
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    // Set flag to prevent auto-position update during load
    isLoadingConversation = true;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/conversation-history`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "load",
        conversationId: conversationId,
      }),
    });

    if (!response.ok) {
      alert("Failed to load conversation");
      isLoadingConversation = false;
      return;
    }

    const data = await response.json();
    currentConversationId = data.id;

    // Clear current messages
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer) {
      messagesContainer.innerHTML = "";
    }

    // Reset conversation messages array
    conversationMessages = [];

    // Render loaded messages (appendMessage will populate conversationMessages)
    data.messages.forEach((msg) => {
      if (msg.role === "user") {
        appendMessage(msg.content, "user");
      } else {
        appendMessage(msg.content, "bot");
      }
    });

    // Clear the flag now that loading is complete
    isLoadingConversation = false;

    // Update UI to highlight current conversation (but don't move to top on just clicking)
    updateHistoryActiveState();

    console.log('[CONVERSATION] Conversation loaded');
  } catch (error) {
    console.error("Error loading conversation:", error);
    isLoadingConversation = false;
  }
}

async function deleteConversation(conversationId, title) {
  // Confirmation is handled by showDeleteConfirmation modal - no need for confirm() here
  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/conversation-history`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        conversationId: conversationId,
      }),
    });

    if (!response.ok) throw new Error("Failed to delete");

    if (currentConversationId === conversationId) {
      currentConversationId = null;
      conversationMessages = [];
      const messagesContainer = document.getElementById("messages");
      if (messagesContainer) messagesContainer.innerHTML = "";
      
      // Show welcome screen after deleting the current conversation
      showWelcomeScreen();
    }

    loadConversationHistory();
    console.log('[CONVERSATION] Conversation deleted successfully');
  } catch (error) {
    console.error("Error deleting conversation:", error);
    // No alert - user will see it failed if conversation still appears
  }
}

// Custom confirmation modal for delete
function showDeleteConfirmation(conversationId, title) {
  const confirmModal = document.getElementById("confirmModal");
  const confirmTitle = document.getElementById("confirmTitle");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmYesBtn = document.getElementById("confirmYesBtn");
  const confirmNoBtn = document.getElementById("confirmNoBtn");

  confirmTitle.textContent = "Delete Conversation";
  confirmMessage.textContent = `Are you sure you want to delete "${title}"? This action cannot be undone.`;
  confirmModal.classList.remove("hidden");

  const handleYes = async () => {
    confirmModal.classList.add("hidden");
    confirmYesBtn.removeEventListener("click", handleYes);
    confirmNoBtn.removeEventListener("click", handleNo);
    await deleteConversation(conversationId, title);
  };

  const handleNo = () => {
    confirmModal.classList.add("hidden");
    confirmYesBtn.removeEventListener("click", handleYes);
    confirmNoBtn.removeEventListener("click", handleNo);
  };

  confirmYesBtn.addEventListener("click", handleYes);
  confirmNoBtn.addEventListener("click", handleNo);
}

function enableInlineEdit(titleElement, conversationId, currentTitle) {
  // Create an input field with the current title
  const input = document.createElement("input");
  input.type = "text";
  input.className = "history-item-title-edit";
  input.value = currentTitle;
  input.maxLength = 100;

  // Replace the title element with the input
  titleElement.replaceWith(input);
  input.focus();
  input.select();

  // Function to save the new title
  const saveTitle = async (newTitle) => {
    if (!newTitle || newTitle === currentTitle) {
      // Restore original if no change
      input.replaceWith(titleElement);
      return;
    }

    try {
      const { data: { session } } = await _supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/conversation-history`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rename",
          conversationId: conversationId,
          title: newTitle,
        }),
      });

      if (!response.ok) throw new Error("Failed to rename");

      // Update the title element text
      titleElement.textContent = newTitle;
      titleElement.title = newTitle;
      
      // Replace input with updated title
      input.replaceWith(titleElement);
      
      loadConversationHistory();
      console.log('[CONVERSATION] Conversation renamed');
    } catch (error) {
      console.error("Error renaming conversation:", error);
      // Restore original on error
      input.replaceWith(titleElement);
    }
  };

  // Save on Enter key
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveTitle(input.value.trim());
    }
  });

  // Save on blur (clicking away)
  input.addEventListener("blur", () => {
    saveTitle(input.value.trim());
  });
}

async function searchConversations(query) {
  if (!query.trim()) {
    loadConversationHistory();
    return;
  }

  try {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/conversation-history`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "search",
        searchQuery: query,
      }),
    });

    if (!response.ok) return;

    const data = await response.json();
    renderConversationHistory(data.conversations || []);
  } catch (error) {
    console.error("Error searching conversations:", error);
  }
}

// ========== END CONVERSATION HISTORY FUNCTIONS ========== //