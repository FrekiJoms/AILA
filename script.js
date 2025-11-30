const iconMap = {
  "docs.google.com/document": "icons/docs.png",
  "docs.google.com/spreadsheets": "icons/sheets.png",
  "drive.google.com": "icons/drive.png",
  "forms.gle": "icons/forms.png",
  "docs.google.com/forms": "icons/forms.png",
  "classroom.google.com": "icons/classroom.png",
  "sites.google.com": "icons/sites.png",
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
      _DESC_3_: "➡ wala muna",
      "Information Sheet": "Information Sheet",
      "Activity Sheet": "Activity Sheet",
      _DESC_1_: "➡ This is the tool for the LA's",
      "Performance Checklist": "Performance Checklist",
      _DESC_2_:
        "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
      "Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLSeIsO_7TlYWT8i6hXBVmTw6-3UFH8kYQ3ipll0lC9KxvOwOFg/viewform",
    },
    "Data Processing Using Spreadsheet Formulas and Tools": {
      _DESC_3_: "➡ wala muna",
      "Information Sheet": "nothing",
      "Activity Sheet": "nothing",
      _DESC_1_: "➡ This is the tool for the LA's",
      "Performance Checklist": "nothing",
      _DESC_2_:
        "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
      "Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLScMn2q_BgZrUmJdSQyRqhiHcKNmDY7uxbWg07CZ1G7zajyC8w/viewform?usp=header",
    },
    "Spreadsheet Data Analysis Using Pivot Tables and Charts": {
      _DESC_3_: "➡ wala muna",
      "Information Sheet": "nothing",
      "Activity Sheet": "nothing",
      _DESC_1_: "➡ This is the tool for the LA's",
      "Performance Checklist": "nothing",
      _DESC_2_:
        "➡ Submit your completed MRP workbook, validate through oral questioning, and accomplish the self-check quiz here.",
      "Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLSexDGWOZ6CLnjh7WbItGeeShHdwzLGgUBa8m0B81_AeNSLOmw/viewform",
    },
  },
  Orientation: [
    "Give me an overview of the Orientation process.",
    "What are the house rules?",
    "Where is the registration form?",
  ],
  "Learning Materials": [
    {
      "Google Sheets Get Started":
        "https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=506882268#gid=506882268",
    },
    "Show me the performance checklist.",
    "Is there a manual for the workflow procedure?",
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
    contentHTML || `<p>Coming soon.</p>`
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

// N8N chat webhook link constant
const CHAT_WEBHOOK = "https://levercrafter.app.n8n.cloud/webhook/aila-chat";
const OFFLINE_DATA_URL = "https://script.google.com/macros/s/AKfycbxyBAMvcSxdV_Gbc8JIKB1yJRPw0ocQKpczfZ8KLp4Gln2LgWTTbFar3ugjODGrqjiE/exec";
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

/* Marked + DOMPurify */
marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderSafeMarkdown(mdText) {
  if (typeof mdText !== "string") mdText = String(mdText || "");

  // THIS IS THE NEW LINE: It finds all "\\n" text and replaces it with a real newline.
  const correctedText = mdText.replace(/\\n/g, '\n');

  // 1. Let marked.js create the basic HTML from the corrected markdown text.
  const rawHtml = marked.parse(correctedText);

  // 2. Use a regular expression to find every link and add the icon.
  const processedHtml = rawHtml.replace(/<a href="([^"]+)">(.+?)<\/a>/gs, (match, href, text) => {
      const iconSrc = getIconForUrl(href);
      return `<a href="${href}" target="_blank" rel="noopener noreferrer"><img src="${iconSrc}" class="link-icon" alt="">${text}</a>`;
  });

  // 3. Sanitize the final HTML to ensure it's safe to display.
  return DOMPurify.sanitize(processedHtml, {
      ADD_TAGS: ['img'],
      ADD_ATTR: ['target', 'rel', 'style', 'src', 'alt', 'class'],
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
      <button class="welcome-btn" onclick="openModal('orientation')">
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
  messagesEl.innerHTML = "";
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
}
function hideTyping() {
  const t = document.getElementById("typingIndicator");
  if (t) t.remove();
  logoArea.classList.remove("logo-glow");
}

function onFaqClick(btn, question) {
  btn.classList.add("sending");
  setTimeout(() => btn.classList.remove("sending"), 600);

  appendMessage(question, "user");
  const parentFaq = btn.closest(".faq-buttons");
  if (parentFaq) parentFaq.remove();

  sendToBackend(question, true);
}

/* send to backend; use offlineResponses if offline or network fails */
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
    const foundKey = Object.keys(offlineResponses).find((k) =>
      q.toLowerCase().includes(k.toLowerCase())
    );
    // This is the full offline message.
    return foundKey
      ? offlineResponses[foundKey]
      : `🔴OFFLINE: 
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
      if (!res.ok) { throw new Error(`...`); }
      const data = await res.json().catch(() => ({}));
      const reply = data.reply;
      if (reply) {
        appendMessage(reply, "bot");
      } else {
        appendMessage("...", "bot");
      }
      pulseLogoOnce();
      updateStatus(true); // <-- ADD THIS LINE
    })
    .catch((err) => {
      hideTyping();
      console.warn("Offline mode triggered:", err);
      const offlineReply = getOfflineAnswer(text);
      appendMessage(offlineReply, "bot", true);
      updateStatus(false); // <-- ADD THIS LINE
    });
}

function sendMessage() {
  const t = input.value.trim();
  if (!t) return;
  const welcomeScreen = messagesEl.querySelector(".welcome-screen");
  if (welcomeScreen) {
    messagesEl.innerHTML = "";
  }

  appendMessage(t, "user");
  input.value = "";
  // Manually trigger the input event to swap the send button back to the voice button
  input.dispatchEvent(new Event("input", { bubbles: true }));
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
      stopListening();
    } else {
      // Clear previous state and start recognition
      input.value = "";
      try {
        recognition.start();

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
        statusIndicator.dataset.tooltip = "Status: Pending. Send a message to check connection.";
    } else if (status === true) {
        statusIndicator.classList.add("online");
        statusIndicator.dataset.tooltip = "AILA is Online";
    } else { // status === false
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
      throw new Error('Failed to load offline data');
    }
    const data = await response.json();
    offlineResponses = data; // Populate our variable with the fetched data
    console.log("Offline responses loaded successfully from Google Sheet.");
  } catch (error) {
    console.error("Could not load offline data:", error);
    // Optional: You could have a hardcoded fallback here if the sheet fails to load
    offlineResponses = { "Error": "Offline responses could not be loaded. Please check the connection." };
  }
}

/**
 * Initializes the app: shows a loading screen with a random tip,
 * loads data, then shows the main UI. Includes an interactive shatter effect.
 */
async function initializeApp() {
    const loadingTips = [
        "Tip: Ask about specific modules like MRP, BOM, or MPS.",
        "Did you know? AILA can understand and display formatted tables.",
        "Tip: Use 'Quick Actions' for common questions and modules.",
        "You can find learning materials in the 'Tools & Resources' menu.",
        "AILA is designed to work offline with pre-set answers."
    ];

    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingTipElement = document.getElementById('loading-tip');
    const logoContainer = document.getElementById('loading-logo-container');
    const mainLogo = document.getElementById('loading-logo');

    // --- 1. Set the loading tip ---
    const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
    if (loadingTipElement) {
        loadingTipElement.textContent = "Tip: " + randomTip;
    }

    // --- 2. Create the shatter effect on click ---
    if (logoContainer && mainLogo) {
        let isShattered = false;

        logoContainer.addEventListener('click', () => {
            if (isShattered) return;
            isShattered = true;
            mainLogo.style.opacity = '0'; // Hide the main logo

            // Create and animate the pieces
            for (let i = 0; i < 16; i++) {
                const piece = document.createElement('div');
                piece.className = 'shatter-piece';
                
                const row = Math.floor(i / 4);
                const col = i % 4;

                piece.style.left = `${col * 25}%`;
                piece.style.top = `${row * 25}%`;
                piece.style.backgroundPosition = `-${col * 20}px -${row * 20}px`;
                
                logoContainer.appendChild(piece);

                // Animate outwards
                setTimeout(() => {
                    const randomX = (Math.random() - 0.5) * 300;
                    const randomY = (Math.random() - 0.5) * 300;
                    const randomRot = (Math.random() - 0.5) * 720;
                    piece.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`;
                    piece.style.opacity = '0';
                }, 10);
            }

            // Restore after animation
            setTimeout(() => {
                mainLogo.style.opacity = '1';
                logoContainer.innerHTML = ''; // Remove all pieces
                logoContainer.appendChild(mainLogo); // Put the main logo back
                isShattered = false;
            }, 900); // Must be longer than the CSS transition
        });
    }

    // --- 3. Load the offline data and start the app ---
    await loadOfflineData();
    
    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.remove('visible');
        updateStatus("pending");
        showWelcomeScreen();
    }, 500);
}
const ro = new MutationObserver(
  () => (messagesEl.scrollTop = messagesEl.scrollHeight)
);
ro.observe(messagesEl, { childList: true, subtree: true });

window.addEventListener("load", () => setTimeout(() => input.focus(), 250));
// Start the application by calling our new initializer function.
initializeApp();