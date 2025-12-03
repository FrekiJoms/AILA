// --- START: Supabase Client Initialization ---
const SUPABASE_URL = "https://woqlvcgryahmcejdlcqz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcWx2Y2dyeWFobWNlamRsY3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDg5NTMsImV4cCI6MjA4MDMyNDk1M30.PXL0hJ-8Hv7BP21Fly3tHXonJoxfVL0GNCY7oWXDKRA";

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- END: Supabase Client Initialization ---
// --- START: Supabase Auth State Listener ---
_supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // This is a successful login (e.g., after Google redirect)
        const user = session.user;

        // --- Check Trial Status from Supabase ---
        const { data: profile, error: profileError } = await _supabase
            .from('profiles')
            .select('trial_start_date')
            .eq('id', user.id)
            .single();

        if (profileError) {
            alert(`Error fetching profile: ${profileError.message}`);
            return;
        }

        const startDate = new Date(profile.trial_start_date);
        const diffDays = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 30) {
            alert("Your 30-day trial has expired.");
            _supabase.auth.signOut();
            return;
        }

        // --- Proceed with successful login UI ---
        localStorage.setItem('loggedInUser', user.email);
        document.getElementById('loading-overlay').classList.remove('visible');
        showWelcomeScreen();
        updateUserInfo();
    }
});
// --- END: Supabase Auth State Listener ---

const SCRIPT_API_URL =
  "https://script.google.com/macros/s/AKfycbxyBAMvcSxdV_Gbc8JIKB1yJRPw0ocQKpczfZ8KLp4Gln2LgWTTbFar3ugjODGrqjiE/exec";
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

// =================================================================
// ============== CENTRALIZED MODAL QUESTIONS ======================
// == To edit questions/links, just edit them here. ==============
// =================================================================
const modalQuestions = {
  Modules: {
    //  "module title here"{
    //    "navigation title here": "output here", << put a ( , ) every end
    //  },
    "Spreadsheet Navigation & Data Familiarization": {
      _DESC_3_: "➡ Module 1",
      "Information Sheet": "Module 1 Information Sheet",
      "Activity Sheet": "Module 1 Activity Sheet",
      _DESC_1_: "➡ This is the tool for the LA's",
      "Performance Checklist": "Module 1 Performance Checklist",
      _DESC_2_:
        "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
      "Module 1 Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLSeIsO_7TlYWT8i6hXBVmTw6-3UFH8kYQ3ipll0lC9KxvOwOFg/viewform",
    },
    "Data Processing Using Spreadsheet Formulas and Tools": {
      _DESC_3_: "➡ Module 2",
      "Information Sheet": "Module 2 Information Sheet",
      "Activity Sheet": "Module 2 Activity Sheet",
      _DESC_1_: "➡ This is the tool for the LA's",
      "Performance Checklist": "Module 2 Performance Checklist",
      _DESC_2_:
        "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
      "Module 2 Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLScMn2q_BgZrUmJdSQyRqhiHcKNmDY7uxbWg07CZ1G7zajyC8w/viewform?usp=header",
    },
    "Spreadsheet Data Analysis Using Pivot Tables and Charts": {
      _DESC_3_: "➡ Module 3",
      "Information Sheet": "Module 3 Information Sheet",
      "Activity Sheet": "Module 3 Activity Sheet",
      _DESC_1_: "➡ This is the tool for the LA's",
      "Performance Checklist": "Module 3 Performance Checklist",
      _DESC_2_:
        "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
      "Module 3 Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLSexDGWOZ6CLnjh7WbItGeeShHdwzLGgUBa8m0B81_AeNSLOmw/viewform",
    },
  },
  Orientation: ["Orientation to Data Proccessing"],
  "Learning Materials": [
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
      },
    },
  ],
}; // =================================================================

// ============== START: MODAL SCRIPT ==============
// This entire block handles the functionality for the new modal pop-ups.

// Get references to all the modal elements from the HTML
const modal = document.getElementById("universalModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const toolsHeaderBtn = document.getElementById("toolsHeaderBtn");
// Add event listener for module dropdowns inside the modal
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
  const contentHTML = buildContentHTML(sectionData);
  return `<div class="placeholder-section">${
    contentHTML ||
    `<p>Coming soon...</p>
    <i style="opacity: 70%"; "font-size: 9px">This section is not configured yet</i>`
  }</div>`;
}

/**
 * Opens and populates the modal based on the content type.
 * @param {string} contentType - The type of content to display ('tools', 'modules', etc.).
 */
function openModal(contentType) {
  let title = "";
  let bodyContent = "";

  // Logic for the special "Tools" modal with internal navigation
  if (contentType === "tools") {
    title = "Tools & Resources";
    // THIS IS THE CORRECTED PART:
    // We have added the missing <div> panes for "materials" and "other".
    bodyContent = `
            <div class="tools-nav">
                <button class="tools-nav-btn active" data-target="tools-Modules">Modules</button>
                <button class="tools-nav-btn" data-target="tools-orientation">Orientation</button>
                <button class="tools-nav-btn" data-target="tools-materials">Materials</button>
            </div>
            <div class="tools-content">
                <div id="tools-Modules" class="tools-pane active">${getPlaceholderContent(
                  "Modules"
                )}</div>
                <div id="tools-orientation" class="tools-pane">${getPlaceholderContent(
                  "Orientation"
                )}</div>
                <div id="tools-materials" class="tools-pane">${getPlaceholderContent(
                  "Learning Materials"
                )}</div>
            </div>
        `;
  } else {
    // This part handles the simpler modals and is already correct.
    switch (contentType) {
      case "modules":
        title = "Modules";
        bodyContent = getPlaceholderContent("Modules");
        break;
      case "orientation":
        title = "Orientation";
        bodyContent = getPlaceholderContent("Orientation");
        break;
      case "materials":
        title = "Learning Materials";
        bodyContent = getPlaceholderContent("Learning Materials");
        break;
    }
  }

  // This part injects the content and adds the event listeners. It is already correct.
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyContent;
  modal.classList.add("visible");

  if (contentType === "tools") {
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
// N8N chat webhook link constant
const CHAT_WEBHOOK = "https://levercrafter.app.n8n.cloud/webhook/aila-chat";
const OFFLINE_DATA_URL =
  "https://script.google.com/macros/s/AKfycbxyBAMvcSxdV_Gbc8JIKB1yJRPw0ocQKpczfZ8KLp4Gln2LgWTTbFar3ugjODGrqjiE/exec";
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

// feedback button area functionality
const feedbackBtn = document.getElementById("feedbackBtn");

// click event to feedback button
if (feedbackBtn) {
  feedbackBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Show brief loading animation
    const originalText = feedbackBtn.innerHTML;
    feedbackBtn.innerHTML = "⏳...";
    feedbackBtn.disabled = true;

    setTimeout(() => {
      // feedback form link here
      window.open("https://forms.gle/cNRtaUZBwDuPoUk77", "_blank"); // put your google form link here
      setTimeout(() => {
        feedbackBtn.innerHTML = originalText;
        feedbackBtn.disabled = false;
      }, 2000);
    }, 300);
  });
}
/*  show up button (pwede mo itong dagdagan or kukuhaan or e change)*/
const faqs = [
  "Overview",
  "Origin",
  "What's in ICT?",
  "What is MRP?",
  "What is MPS?",
  "What is BOM?",
  "What is Inventory?",
  "What is PO?",
  "How to do dashboard?",
  "Data connection between sheets",
  "How can I prepare for oral validation",
  "Three types of data ",
  "References",
  "Main developer of AILA?",
];
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
      <img src="ailalogo.png"
           alt="AILA Logo"
           style="width:100%; height:100%; object-fit:cover; border-radius:14px;">
    </div>
    <h1 class="welcome-title" style="margin-bottom: 5px">Welcome to AILA</h1>
    <p class="welcome-subtitle">Hi kuys! I'm AILA, Feel free to ask any questions related to our Kaizenset ICT Data Processing</p>
    <div class="welcome-actions">
      <button class="welcome-btn" onclick="useSuggestion('Overview')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Overview</span>
      </button>
      <button class="welcome-btn" onclick="openModal('modules')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>Modules</span>
      </button>
      <button class="welcome-btn" onclick="useSuggestion('orientation')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          <span>Orientation</span> 
      </button>
      <button class="welcome-btn" onclick="openModal('materials')">
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
    welcomeInput.focus();
  }
}

function useSuggestion(text) {
  // Check if the welcome screen is currently being displayed.
  const welcomeScreen = messagesEl.querySelector(".welcome-screen");

  // THIS IS THE FIX: Only clear the chat if the welcome screen is active.
  // This prevents the chat history from being deleted during a conversation.
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
    modulesBtn.textContent = "📦 Modules";

    // This button now correctly opens the simple "Modules" modal
    modulesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal("modules");
    });

    actionWrap.appendChild(modulesBtn);
    wrap.appendChild(actionWrap);
  }

  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
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

(function setupAutoResize() {
  const ta =
    document.querySelector("textarea#input") ||
    document.getElementById("input");
  if (!ta) return;
  const resize = () => {
    ta.style.height = "auto";
    const max = Math.min(window.innerHeight * 0.35, 220);
    ta.style.height = Math.min(ta.scrollHeight, max) + "px";
    setTimeout(() => (messagesEl.scrollTop = messagesEl.scrollHeight), 50);
  };
  ta.addEventListener("input", resize, { passive: true });
  window.addEventListener("resize", resize);
  resize();
})();

// google form feedback area
// make sure header feedback opens new tab and doesn't break on mobile
safe(() => {
  const fb = document.getElementById("feedbackBtn");
  if (fb) {
    fb.addEventListener("click", (e) => {
      e.preventDefault();
      fb.setAttribute("aria-busy", "true");
      const original = fb.innerHTML;
      fb.innerHTML = "⏳";
      window.open("https://forms.gle/cNRtaUZBwDuPoUk77", "_blank"); // put your google form link here
      setTimeout(() => {
        fb.innerHTML = original;
        fb.removeAttribute("aria-busy");
      }, 900);
    });
  }
});

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
}
/* send to backend; use offlineResponses if offline or network fails */
function sendToBackend(text, askSuggestions = false) {
  showTyping();
  const payload = {
    message: text,
    sessionId: "guest_" + Date.now(),
    name: "Guest",
    email: null,
    askForSuggestions: !!askSuggestions,
  };

  // This helper function will now ONLY be used when the connection completely fails.
  function getOfflineAnswer(q) {
    // Find all keywords from the offline responses that are present in the user's query as whole words.
    const matchingKeys = Object.keys(offlineResponses).filter((k) => {
      // We create a regular expression to match the keyword as a whole word, ignoring case.
      const escapedKey = k.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedKey}\\b`, "i");
      return regex.test(q);
    });

    // If any keywords were found, select the one with the most characters.
    if (matchingKeys.length > 0) {
      const bestMatch = matchingKeys.reduce((a, b) =>
        a.length > b.length ? a : b
      );
      // Return the response for the best-matching (longest) keyword.
      return offlineResponses[bestMatch];
    }

    // If no keywords were found, return the default offline message.
    return `🔴OFFLINE: 
      Kuys! tulog pa si AILA, click mo nalang yung button for more common questions.
      \n<h5>We're still looking forward to the day that the already-prepared online version (GISING NA SI AILA), gets approved, even if it comes with a small fee, because it will allow us to help more LA and incoming trainees in the future.</h5>
      \n- *AILA can still response in templated answers given below, CLICK THE BUTTON*
      `;
  }

  // N8N fetch url
  fetch("https://levercrafter.app.n8n.cloud/webhook/aila-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      hideTyping();
      if (!res.ok) {
        throw new Error(`...`);
      }
      const data = await res.json().catch(() => ({}));
      const reply = data.reply;
      //... inside the .then() block
      if (reply) {
        playSound(SFX.receive, 0.7); // 70% volume, slightly quieter
        appendMessage(reply, "bot");
      }
      //...
      else {
        appendMessage("...", "bot");
      }
      pulseLogoOnce();
      updateStatus(true); // <-- ADD THIS LINE
    })
    .catch((err) => {
      hideTyping();
      console.warn("Offline mode triggered:", err);
      const offlineReply = getOfflineAnswer(text);

      // THIS IS THE FIX: Play the receive sound for offline messages too.
      playSound(SFX.receive, 0.7);

      appendMessage(offlineReply, "bot", true);
      updateStatus(false); // <-- ADD THIS LINE
    });
}

function sendMessage() {
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
 * Loads the offline responses from our Google Sheet API.
 */
async function loadOfflineData() {
  try {
    const response = await fetch(OFFLINE_DATA_URL);
    if (!response.ok) {
      throw new Error("Failed to load offline data");
    }
    const data = await response.json();
    offlineResponses = data; // Populate our variable with the fetched data
    console.log("Offline responses loaded successfully from Google Sheet.");
  } catch (error) {
    console.error("Could not load offline data:", error);
    // Optional: You could have a hardcoded fallback here if the sheet fails to load
    offlineResponses = {
      Error:
        "Offline responses could not be loaded. Please check the connection.",
    };
  }
}

/**
 * Initializes the app with a dynamic, multi-stage loading screen.
 */
async function initializeApp() {
  // --- START: Check for an existing session ---
  const loggedInUserEmail = localStorage.getItem("loggedInUser");
  if (loggedInUserEmail) {
    // If a user is already logged in, bypass the loading screen entirely.
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.remove("visible"); // Instantly hide the overlay
    showWelcomeScreen(); // Show the main chat interface
    updateStatus("pending"); // Set the initial status
    updateUserInfo();
    return; // Stop the rest of the initializeApp function from running
  }
  // --- 1. Define loading content & get elements ---
  const loadingStatuses = [
    "Starting...",
    "Initializing...",
    "Loading resources...",
    "Connecting to APIs...",
    "Connecting to the server...",
    "Connecting to the server...1",
    "Connecting to the server...2",
    "Connecting to the server...3",
    "Finalizing setup...",
  ];
  const loadingTips = [
    "Ask about specific topics like MRP, BOM, PO, Inventory, or MPS.",
    "Ask AILA about pivot table or dashboard.",
    "AILA was originally a floating embedded chat inside the ICT website.",
    "AILA can understand and display formatted tables and also codes and formulas.",
    "Navigate the Tool icon 🔧 to access Modules, Orientation, and Learning Materials.",
    "You can find learning materials by clicking Tool icon > Materials.",
    "Aila was envisioned on the 9th of October, later created on 26th of October",
    "Dyk, AILA main developer was, N. Joshua?",
  ];
  const loadingOverlay = document.getElementById("loading-overlay");
  const logoContainer = document.getElementById("loading-logo-container");
  const mainLogo = document.getElementById("loading-logo");
  const inProgressDiv = document.getElementById("loading-in-progress");
  const completeDiv = document.getElementById("loading-complete");
  const statusText = document.getElementById("loading-status-text");
  const tipText = document.getElementById("loading-tip");
  const enterBtn = document.getElementById("enter-app-btn");
  const clickMeText = document.getElementById("click-me-text");

  // --- 2. Set up and attempt to play ambient sound ---
  ambientSound = new Audio(SFX.loadingAmbient);
  ambientSound.loop = true;
  ambientSound.volume = 0.3;
  let ambientNeedsInteraction = false;
  ambientSound.play().catch((e) => {
    console.warn(
      "Ambient sound autoplay was blocked. It will start on the first click."
    );
    ambientNeedsInteraction = true;
  });

  // --- 3. Set up interactive logo with sound fix ---
  if (logoContainer && mainLogo) {
    let isShattered = false;
    logoContainer.addEventListener("click", () => {
      if (ambientNeedsInteraction) {
        ambientSound.play();
        ambientNeedsInteraction = false;
      }
      if (isShattered) return;
      if (clickMeText) clickMeText.style.opacity = "0";
      playSound(SFX.glassBreak);
      isShattered = true;
      mainLogo.style.opacity = "0";
      for (let i = 0; i < 16; i++) {
        const piece = document.createElement("div");
        piece.className = "shatter-piece";
        const row = Math.floor(i / 4);
        const col = i % 4;
        piece.style.left = `${col * 25}%`;
        piece.style.top = `${row * 25}%`;
        piece.style.backgroundPosition = `-${col * 20}px -${row * 20}px`;
        logoContainer.appendChild(piece);
        setTimeout(() => {
          const randomX = (Math.random() - 0.5) * 300;
          const randomY = (Math.random() - 0.5) * 300;
          const randomRot = (Math.random() - 0.5) * 720;
          piece.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`;
          piece.style.opacity = "0";
        }, 10);
      }

      // --- THIS IS THE FIX ---
      setTimeout(() => {
        // Remove only the shatter pieces, leaving the other elements intact.
        logoContainer
          .querySelectorAll(".shatter-piece")
          .forEach((p) => p.remove());

        // Restore the opacity of the main elements.
        mainLogo.style.opacity = "1";
        if (clickMeText) clickMeText.style.opacity = "1";

        isShattered = false;
      }, 900);
    });
  }

  // --- 4. Start the dynamic text animations ---
  let tipIndex = 0;
  tipText.textContent = "Tip: " + loadingTips[tipIndex];
  const tipInterval = setInterval(() => {
    tipIndex = (tipIndex + 1) % loadingTips.length;
    tipText.style.opacity = "0";
    setTimeout(() => {
      tipText.textContent = "Tip: " + loadingTips[tipIndex];
      tipText.style.opacity = "1";
    }, 300);
  }, 3000);
  let statusIndex = 0;
  const cycleStatus = () => {
    if (statusIndex < loadingStatuses.length) {
      statusText.textContent = loadingStatuses[statusIndex++];
      setTimeout(cycleStatus, 900);
    }
  };
  cycleStatus();

  // --- 5. Start the actual data loading ---
  await loadOfflineData();

  // --- 6. Handle the completion state ---
  // Keep animations running, but hide the "Click Me" text

  // THIS IS THE FIX: Swap the "in-progress" div for the "complete" div
  inProgressDiv.classList.add("hidden");
  completeDiv.classList.remove("hidden");

  // Show the enter button
  enterBtn.classList.remove("hidden");
  playSound(SFX.success, 0.8);
}

const ro = new MutationObserver(
  () => (messagesEl.scrollTop = messagesEl.scrollHeight)
);
ro.observe(messagesEl, { childList: true, subtree: true });

window.addEventListener("load", () => setTimeout(() => input.focus(), 250));
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

// 1. Get all the elements we need from the DOM first.
// Add this line with the other constants
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const customAlert = document.getElementById("customAlert");
const authModal = document.getElementById("authModal");
const authCloseBtn = document.getElementById("authCloseBtn");
const authTitle = document.getElementById("authTitle");
const authActionBtn = document.getElementById("authActionBtn");
const pinContainer = document.getElementById("pinContainer");
const pinConfirmGroup = document.getElementById("pinConfirmGroup");
const registerLink = document.getElementById("registerLink");
const authForm = document.getElementById("authForm");
const enterAppBtn = document.getElementById("enter-app-btn");
const welcomeMessageContainer = document.getElementById(
  "welcome-message-container"
);
const welcomeMessageText = document.getElementById("welcome-message-text");
const finalEnterBtn = document.getElementById("final-enter-btn");
const googleLoginBtn = document.getElementById("googleLoginBtn");

let isRegisterMode = false;

// 2. Define all the functions the modal will use.
let alertTimeout; // This will prevent multiple alert timers from running at once
// This function checks if the user's trial is still active.
// Returns true if active, false if expired.
function handleSuccessfulLogin(email) {
  localStorage.setItem("loggedInUser", email);
  closeAuthModal();
  enterAppBtn.classList.add("hidden");

  const username = email.split("@")[0];
  welcomeMessageText.textContent = `Welcome back, ${username}!`;
  welcomeMessageContainer.classList.remove("hidden");
  updateUserInfo();
}

function checkTrialStatus() {
  const startDateString = localStorage.getItem("trialStartDate");
  if (!startDateString) {
    // If there's no start date, the trial is considered active.
    return true;
  }

  const startDate = new Date(startDateString);
  const today = new Date();
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 30;
}

function updateUserInfo() {
  const userEmail = localStorage.getItem("loggedInUser");
  if (!userEmail) return;

  // Update UI elements
  const userInitialEl = document.getElementById("userInitial");
  const userEmailEl = document.getElementById("userEmail");
  const trialStatusEl = document.getElementById("trialStatus");

  if (userInitialEl)
    userInitialEl.textContent = userEmail.charAt(0).toUpperCase();
  if (userEmailEl) userEmailEl.textContent = userEmail;
  // Inside the authForm "submit" event listener

  // Calculate and display trial days
  if (trialStatusEl) {
    let startDateString = localStorage.getItem("trialStartDate");
    if (!startDateString) {
      // Fallback in case it wasn't set on registration
      startDateString = new Date().toISOString();
      localStorage.setItem("trialStartDate", startDateString);
    }
    const startDate = new Date(startDateString);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - diffDays);
    trialStatusEl.textContent = `${daysRemaining} days left`;
  }
}

function showCustomAlert(message, type = "error") {
  clearTimeout(alertTimeout);
  customAlert.textContent = message;

  // Add or remove the 'success' class based on the type
  if (type === "success") {
    customAlert.classList.add("success");
  } else {
    customAlert.classList.remove("success");
  }

  customAlert.classList.remove("hidden");

  // Automatically hide the alert after 4 seconds
  alertTimeout = setTimeout(() => {
    customAlert.classList.add("hidden");
  }, 4000);
}
// Function to open the modal
function showAuthModal() {
  authModal.classList.remove("hidden");
}

// Function to close the modal
function closeAuthModal() {
  authModal.classList.add("hidden");
}

// Function to switch between Login and Register modes
function setAuthMode(isRegister) {
  isRegisterMode = isRegister;
  const btnText = authActionBtn.querySelector(".btn-text");

  if (isRegister) {
    authTitle.textContent = "Create an Account";
    btnText.textContent = "Register";
    pinConfirmGroup.classList.remove("hidden");
    registerLink.innerHTML = "Already have an account? Login";
  } else {
    authTitle.textContent = "Login to AILA";
    btnText.textContent = "Login";
    pinConfirmGroup.classList.add("hidden");
    registerLink.innerHTML = "Don't have an account? Register";
  }
}

// Function to handle the auto-focusing logic for the 4-digit PIN inputs
function setupPinInput(container) {
  const inputs = [...container.children];
  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      // Only allow numbers
      input.value = input.value.replace(/\D/g, "");
      // Move to next input if a digit is entered
      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      // Move to previous input on backspace if current input is empty
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

// Helper function to get the full PIN value from a container
function getPinFromContainer(container) {
  return [...container.children].map((input) => input.value).join("");
}

// 3. Attach all the event listeners last.

// Setup the logic for both PIN containers
setupPinInput(pinContainer);
setupPinInput(pinConfirmContainer);

// Show the modal when the initial "Login / Register" button is clicked
if (enterAppBtn) {
  enterAppBtn.addEventListener("click", showAuthModal);
}

// Close the modal with the 'X' button
if (authCloseBtn) {
  authCloseBtn.addEventListener("click", closeAuthModal);
}

// Toggle between Login and Register modes
if (registerLink) {
  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    setAuthMode(!isRegisterMode);
  });
}

// Handle the form submission (Login or Register)
// Replace the entire authForm event listener with this
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authActionBtn.classList.add("loading");
    authActionBtn.disabled = true;

    const email = document.getElementById("email").value;
    const pin = getPinFromContainer(pinContainer);
    const pinConfirm = getPinFromContainer(pinConfirmContainer);

    // --- Client-Side Validation ---
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      showCustomAlert("Please enter a valid @gmail.com address.");
      authActionBtn.classList.remove("loading");
      authActionBtn.disabled = false;
      return;
    }
    if (pin.length !== 6) {
      showCustomAlert("PIN must be exactly 6 digits.");
      authActionBtn.classList.remove("loading");
      authActionBtn.disabled = false;
      return;
    }
    if (isRegisterMode && pin !== pinConfirm) {
      showCustomAlert("The PINs you entered do not match.");
      authActionBtn.classList.remove("loading");
      authActionBtn.disabled = false;
      return;
    }

    try {
      if (isRegisterMode) {
        // --- REAL REGISTRATION ---
        const { error } = await _supabase.auth.signUp({
          email: email,
          password: pin,
        });
        if (error) throw error;

        showCustomAlert(
          "Registered successfully! Logging you in...",
          "success"
        );
        // Short delay to let the user read the success message
        setTimeout(() => {
          localStorage.setItem("loggedInUser", email);
          closeAuthModal();
          enterAppBtn.classList.add("hidden");
          welcomeMessageText.textContent = `Welcome to AILA, ${
            email.split("@")[0]
          }!`;
          welcomeMessageContainer.classList.remove("hidden");
          updateUserInfo();
        }, 1500);
      } else {
        // --- REAL LOGIN ---
        const { data, error } = await _supabase.auth.signInWithPassword({
          email: email,
          password: pin,
        });
        if (error) throw error;

        // Trial Check from Supabase
        const { data: profile, error: profileError } = await _supabase
          .from("profiles")
          .select("trial_start_date")
          .eq("id", data.user.id)
          .single();
        if (profileError) throw profileError;

        const startDate = new Date(profile.trial_start_date);
        const diffDays = Math.floor(
          (new Date() - startDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 30) {
          showCustomAlert("Your 30-day trial has expired.");
          _supabase.auth.signOut();
          return;
        }

        // --- Proceed with successful login ---
        handleSuccessfulLogin(email);
      }
    } catch (error) {
      // --- CUSTOM ERROR HANDLING ---
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

// Handle the final "Enter AILA" button click
if (finalEnterBtn) {
  finalEnterBtn.addEventListener("click", () => {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (ambientSound) {
      ambientSound.pause();
      ambientSound.currentTime = 0;
    }

    playSound(SFX.whoosh, 0.8);
    loadingOverlay.classList.remove("visible");
    if (chatEl) {
      chatEl.classList.add("entering");
    }

    updateStatus("pending");
    showWelcomeScreen();
  });
}
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = prompt(
      "Please enter your email to receive a password reset link:"
    );

    if (email) {
      showCustomAlert("Sending reset instructions...", "success");
      const { error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href, // Redirects back to your app after reset
      });

      if (error) {
        showCustomAlert(error.message);
      } else {
        showCustomAlert(
          "Password reset instructions have been sent to your email."
        );
      }
    }
  });
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      const { error } = await _supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        showCustomAlert(error.message);
      }
    });
  }
}

// --- END: Authentication Modal Logic ---

// --- START: Navigation Sidebar Logic ---

// Get elements from the DOM
const appContainer = document.querySelector(".app");
const navLogo = document.getElementById("logo");
const navSidebar = document.getElementById("navSidebar");
const newChatBtn = document.getElementById("newChatBtn");
const logoutBtn = document.getElementById("logoutBtn");
const closeNavBtn = document.getElementById("closeNavBtn");

// Function to toggle the navigation sidebar
function toggleNav() {
  appContainer.classList.toggle("nav-open");
}

// Event listener for the AILA header logo
if (navLogo) {
  navLogo.addEventListener("click", toggleNav);
}
// Add this event listener for the new close button
if (closeNavBtn) {
  closeNavBtn.addEventListener("click", toggleNav);
}

// Event listener for the "New Chat" button
if (newChatBtn) {
  newChatBtn.addEventListener("click", () => {
    showWelcomeScreen(); // Re-use this function to clear the chat area
    if (appContainer.classList.contains("nav-open")) {
      toggleNav(); // Close the nav after starting a new chat
    }
  });
}

// Event listener for the "Log Out" button
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser"); // Clear the session
    window.location.reload(); // Reload the page to go back to login
  });
}

// --- END: Navigation Sidebar Logic ---
