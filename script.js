// =================================================================
// ============== CENTRALIZED MODAL QUESTIONS ======================
// == To edit questions/links, just edit them here. ==============
// =================================================================
const modalQuestions = {
  Modules: {
    "Module 1: Understanding the MRP System": {
      "Information Sheet": "nothing",
      "Activity Sheet": "nothing",
      "Performance Checklist": "nothing",
      _DESC_: "TESTING ONLIE",
      "Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLSeIsO_7TlYWT8i6hXBVmTw6-3UFH8kYQ3ipll0lC9KxvOwOFg/viewform",
    },
    "Module 2: Spreadsheet-Based MRP Simulation": {
      "Information Sheet": "nothing",
      "Activity Sheet": "nothing",
      "Performance Checklist": "nothing",

      "Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLScMn2q_BgZrUmJdSQyRqhiHcKNmDY7uxbWg07CZ1G7zajyC8w/viewform?usp=header",
    },
    "Module 3: Data Analysis and Visualization": {
      "Information Sheet": "nothing",
      "Activity Sheet": "nothing",
      "Performance Checklist": "nothing",
      "Assessment Form":
        "https://docs.google.com/forms/d/e/1FAIpQLSexDGWOZ6CLnjh7WbItGeeShHdwzLGgUBa8m0B81_AeNSLOmw/viewform",
    },
  },
  // These other sections remain simple arrays of questions.
  Orientation: [
    "Give me an overview of the Orientation process.",
    "What are the house rules?",
    "Where is the registration form?",
  ],
  "Learning Materials": [
    "Where can I find the MRP spreadsheet template?",
    "Show me the performance checklist.",
    "Is there a manual for the workflow procedure?",
  ],
  Other: [
    "How do I create a pivot table?",
    "Explain the XLOOKUP formula.",
    "Guide me through data connection between sheets.",
  ],
};
// =================================================================

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
  const dropdownBtn = e.target.closest(".module-dropdown-btn");
  if (!dropdownBtn) return; // Exit if the click wasn't on a dropdown button

  dropdownBtn.classList.toggle("active");
  const content = dropdownBtn.nextElementSibling;

  if (content && content.classList.contains("module-dropdown-content")) {
    content.style.display =
      content.style.display === "block" ? "none" : "block";
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
 * Generates HTML for the modal. It handles descriptions (_DESC_), direct links
 * (URLs), and questions for each item in the dropdowns.
 * @param {string} sectionTitle The key to look up in the modalQuestions object.
 * @returns {string} HTML string for the modal's content.
 */
function getPlaceholderContent(sectionTitle) {
  const sectionData = modalQuestions[sectionTitle] || {};
  let contentHTML = "";

  // --- SPECIAL LOGIC FOR MODULES DROPDOWN ---
  if (sectionTitle === "Modules") {
    for (const moduleName in sectionData) {
      const links = sectionData[moduleName];
      let subLinksHTML = "";

      for (const key in links) {
        const value = links[key];

        // Case 1: It's a description
        if (key === "_DESC_") {
          subLinksHTML += `<p class="description">${value}</p>`;
        }
        // Case 2: It's a URL
        else if (
          value &&
          (value.startsWith("http://") || value.startsWith("https://"))
        ) {
          subLinksHTML += `<a href="${value}" target="_blank" onclick="closeModal()">${key}</a>`;
        }
        // Case 3: It's a question
        else {
          const question = value || `${key} for ${moduleName}`;
          subLinksHTML += `<a href="#" onclick="event.preventDefault(); useSuggestion('${question.replace(
            /'/g,
            "\\'"
          )}'); closeModal();">${key}</a>`;
        }
      }

      contentHTML += `
                <div class="module-dropdown">
                    <button class="module-dropdown-btn">
                        <span>${moduleName}</span>
                        <svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <div class="module-dropdown-content">${subLinksHTML}</div>
                </div>
            `;
    }
  }
  // --- FALLBACK LOGIC FOR OTHER SECTIONS (Orientation, etc.) ---
  else {
    const questions = Array.isArray(sectionData) ? sectionData : [];
    if (questions.length > 0) {
      contentHTML += `<h3 style="color: var(--accent1); margin-bottom: 15px;">${sectionTitle} Questions</h3>`;
      contentHTML += questions
        .map(
          (q) =>
            `<a href="#" class="question-link" onclick="useSuggestion('${q.replace(
              /'/g,
              "\\'"
            )}'); closeModal();">${q}</a>`
        )
        .join("");
    }
  }

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
    bodyContent = `
            <div class="tools-nav">
                <button class="tools-nav-btn active" data-target="tools-Modules">Modules</button>
                <button class="tools-nav-btn" data-target="tools-orientation">Orientation</button>
                <button class="tools-nav-btn" data-target="tools-materials">Materials</button>
                <button class="tools-nav-btn" data-target="tools-Other">Others</button>
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
                <div id="tools-Other" class="tools-pane">${getPlaceholderContent(
                  "Other"
                )}</div>
            </div>
        `;
  } else {
    // Logic for the simpler modals that open directly
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
      case "tutorials": // Added the 'tutorials' case
        title = "Tutorials";
        bodyContent = getPlaceholderContent("Tutorials");
        break;
    }
  }

  // Set the content and make the modal visible
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyContent;
  modal.classList.add("visible");

  // If the "Tools" modal was opened, set up its internal navigation
  if (contentType === "tools") {
    const navButtons = modal.querySelectorAll(".tools-nav-btn");
    const panes = modal.querySelectorAll(".tools-pane");

    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Deactivate all buttons and panes
        navButtons.forEach((b) => b.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));

        // Activate the clicked button and its corresponding pane
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-target");
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add("active");
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
const CHAT_WEBHOOK = "https://laict.app.n8n.cloud/webhook/aila-chat";

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
const offlineResponses = {
  // random templated questions //
  picture:
    "TESTING IMAGE https://drive.google.com/file/d/18TLwYfyQ7ODgG3cb7nvFYiK_li54ibMs/view",
  Hi: "Hellow kuys! I'm AILA. Here is a test video to see if it works:  https://drive.google.com/file/d/1NcZ5BYRyabR3HtbeQrcvKkq8jRoehmQ9/view",
  "Orientation to data processing": `Hi kuys!👋
  \n**Orientation to Data Processing**
  \n\n- Ngayon, magbibigay muna ako ng overview tungkol sa process flow ng ating data processing activity. Mayroon na ba sa inyo ang may karanasan sa manufacturing? Pamilyar ba kayo sa role ng isang material planner?
  \n- Ang material planner ay may mahalagang papel: tiyakin na lahat ng raw materials at components ay available sa tamang oras, tamang bilang, at tamang specification upang maiwasan ang delay sa production. Ang kanilang trabaho ay nakabatay sa Bills of Materials (BOM), kasama ang pag-check ng inventory at pag-request ng supply batay sa pangangailangan ng production.
  \n- Sa activity natin, gagayahin natin ang prinsipyong ito. Upang mabuo ang mini conveyor system, gagawa tayo ng structured Material Requirement Planning (MRP). Dito natin ililista at iko-compute ang lahat ng raw materials at components na kailangan. Pagkatapos, makikita natin kung sapat ang inventory o kung kailangan pa ng additional supply para maging tuloy-tuloy ang production flow.
`,
  Hello:
    "Hi kuys👋! I'm AILA, your AI learning assistant. How can I help you today?",
  xlookup: `Hi kuys!👋 **What is XLOOKUP Formula?**
  \n\n- Sa example na ito, gagamit tayo ng XLOOKUP para awtomatikong hanapin ang data sa ibang sheet, na ang pangalan ay **BOM**.
  \n- Formula:
    =XLOOKUP(A2, BOM!$B$2:$B, BOM!$F$2:$F)
  \n- Paano ito gumagana?
      • Ang A2 ay ang hinahanap mong value (hal. item name o code).
      • Sa BOM sheet, hahanapin niya ang value na nasa B2 sa column A.
      • Kapag nahanap iyon, kukunin niya ang katumbas na data sa column F (hal. quantity o price).
  \n- Para itong “search engine” sa Excel: magta-type ka lang ng item, tapos automatic ilalabas ni XLOOKUP ang tamang sagot mula sa ibang sheet — hindi mo na kailangang mag-scroll o mag-manual hanap.
`,
  // templated questions based on buttons //
  // templated  response FAQS //
  Origin: `Hi kuys!👋, here's a little history! 👥
\n
AILA, **Artificial Intelligent Learning Assistant**, developed in the Kaizenset ICT Data Processing Department.
\n
Envisioned on the **9th of October**, accepted as an official project six days later, and fully launched to the public by the end of the month **(October 31, 2025)**.
\n
**Kaiser** envisions **AILA**, and together with others, began pioneering its creation, thankfuly **Josh** came and with his skills he took the lead as AILA’s head developer turning AILA to a powerful tool that solves long term challenges designed to improve efficiency and learning outcomes, making it a reliable support system for both trainees and facilitators.
`,
  Overview: `Hi kuys!👋 AILA, which stands for **Artificial Intelligent Learning Assistant**, is an AI chatbot designed to assist ICT trainees and learning assistants.
\n
It provides guidance by answering questions related to Material Requirement Planning (MRP), spreadsheet concepts, ICT modules, and internal school documents. AILA is capable of understanding natural language, recalling previous conversations, and delivering instant responses, similar to interacting with a tutor.  
\n
It operates under a hybrid framework, offering both offline templated responses and online AI-driven interactivity through automation, ensuring functionality even in limited connectivity environments.
\n
**Purpose:**
- Enhance independent learning
- Improve operational efficiency
- Reduce repetitive inquiries
- Allow facilitators and learning assistants to focus on mentoring and project development
\n
AILA is designed to make learning easier, faster, and more efficient for everyone involved. 💡
`,
  ICT: `Hi kuys!👋 The **ICT (Information and Communication Technology) program** in the Kaizenset ICT Data Processing Department includes various modules and topics aimed at enhancing technical skills and knowledge.  
- **Material Requirement Planning (MRP):** Topics like "What is MRP?" and "Explain the MPS module" are included.
- **Spreadsheet Concepts:** Queries like "How do I use XLOOKUP?" and "What's the Data connection between sheets" are supported.
- **ICT Modules:** Topics such as "How to do dashboard" and "What are the three types of data in MRP" are covered.
\n
**Program Emphasis:**
The ICT program emphasizes vocational training, focusing on hands-on learning, procedural accuracy, safety, and tool use.  
AILA supports this by providing structured, task-based templates and guided flows to deliver procedural clarity in both offline and online modes.  
This approach fosters independent problem-solving and knowledge transfer.
`,
  MRP: `Hi kuys!👋 Material Requirements Planning (MRP) is a systematic approach used in manufacturing to manage inventory and optimize production timelines. It calculates and determines the materials and components needed to manufacture a product, ensuring that they are available at the right time and in the right quantities.

Kuys, MRP helps determine:
- What materials are needed
- How much to order
- When to order them

Inside MRP Sheet, there are several key components:
1. MPS (Master Production Schedule)
2. BOM (Bill of Materials)
3. Inventory
4. PO (Purchase Orders)
5. Dashboard
\n
**[MATERIAL_REQUIREMENTS_PLANNING_20251023](https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=506882268#gid=506882268)**
you can also refer to the given template found in modules for a more detailed understanding of MRP components and their functions.`,
  MPS: `Hi kuys!👋 **MPS (Master Production Schedule)** is a detailed plan in the MRP system that specifies:
\n
  - what products need to be produced,  
  - when they should be produced,  
  - and in what quantities. 
\n
It serves as the starting point for MRP, defines the production schedule, drives material requirement calculations, and ensures production aligns with customer demand and delivery timelines. It also feeds data into other MRP components like the BOM and inventory sheets to calculate material needs and manage stock levels effectively.  
\n
TABLE BASED ON **[MATERIAL_REQUIREMENTS_PLANNING_20251023](https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=506882268#gid=506882268)**
<table border="1">
  <thead>
    <tr>
      <th>Batch Code</th>
      <th>Product Description</th>
      <th>Planned Qty</th>
      <th>Actual Qty</th>
      <th>Schedule Week</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PROD BATCH 1</td>
      <td>Mechatronics Trainer Board</td>
      <td>3</td>
      <td>3</td>
      <td>Week 1</td>
      <td>On Time</td>
    </tr>
    <tr>
      <td>PROD BATCH 2</td>
      <td>Mechatronics Trainer Board</td>
      <td>3</td>
      <td>3</td>
      <td>Week 2</td>
      <td>On-Time</td>
    </tr>
    <tr>
      <td>PROD BATCH 3</td>
      <td>Mechatronics Trainer Board</td>
      <td>3</td>
      <td>1</td>
      <td>Week 3</td>
      <td>Delayed</td>
    </tr>
    <tr>
      <td>PROD BATCH 4</td>
      <td>Mechatronics Trainer Board</td>
      <td>3</td>
      <td>5</td>
      <td>Week 4</td>
      <td>Compensated</td>
    </tr>
  </tbody>
</table>
\n
1️⃣ **Status Formula:** 
=IF(C2=D2, "On Time", IF(D2<C2, "Delayed", "Compensated"))
\n
**Note:**
- Ito ay para sa **mga produkto mismo**, hindi para sa parts or components.
- **Planned Qty** - ang target na dami na kailangang gawin sa isang batch.
- **Actual Qty** - ang totoong dami na nagawa sa batch na iyon.
- **Schedule Week** - ang linggo kung kailan naka-schedule ang production ng batch
- **Status** - nagpapakita kung ang batch ay "On Time", "Delayed", o "Compensated" base sa pagkakaiba ng Planned at Actual Qty.
`,
  BOM: `Hi kuys!👋 **What is BOM?**\n BOM (Bill of Materials) is a product’s recipe, it lists all the materials and quantities needed to build the product.\n
\nTABLE BASED ON **[MATERIAL_REQUIREMENTS_PLANNING_20251023](https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=2038808217#gid=2038808217)**  
<table border="1">
 <thead>
    <tr>
      <th>Product</th>
      <th>Item Code</th>
      <th>Item Description</th>
      <th>Specification</th>
      <th>Unit Price (₱)</th>
      <th>Qty</th>
      <th>UOM</th>
      <th>Safety Stock</th>
      <th>Lead Time (days)</th>
      <th>Approved Supplier</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Mechatronics Training Board</td>
      <td>TB-01</td>
      <td>Terminal Blocks</td>
      <td>12 pairs, 15A</td>
      <td>₱140</td>
      <td>4</td>
      <td>pcs</td>
      <td>15</td>
      <td>3</td>
      <td>RS Philippines</td>
    </tr>
    <tr>
      <td>Mechatronics Training Board</td>
      <td>LS-02</td>
      <td>Limit Switch</td>
      <td>SPDT, 10A</td>
      <td>₱250</td>
      <td>2</td>
      <td>pcs</td>
      <td>10</td>
      <td>5</td>
      <td>Mouser Electronics</td>
    </tr>
    <tr>
      <td>Mechatronics Training Board</td>
      <td>SV-03</td>
      <td>Solenoid Valve</td>
      <td>12V DC, 1/4"</td>
      <td>₱2,500</td>
      <td>1</td>
      <td>pcs</td>
      <td>5</td>
      <td>7</td>
      <td>Automation Direct</td>
    </tr>
    <tr>
      <td>more</td>
      <td>more</td>
      <td>more</td>
      <td>more</td>
      <td>more</td>
      <td>more</td>
      <td>more</td>
      <td>more</td>
      <td>more</td>
      <td>more</td>
    </tr>
  </tbody>
</table>
\n**🟩Important Note:**
- **Safety Stock** - indicates the minimum quantity to keep on hand to avoid stockouts.
- **Lead Time** - is the number of days it takes to receive the item after placing an order.
- **Item code** - unique item code specific to a material
- **Description** - name of the material
- **Unit Price** - is the cost per unit of each item.
- **Qty indicates** - how many units are needed for one Mechatronics Training Board.
- **UOM (Unit of Measure)** - specifies the measurement unit for the quantity (e.g., pieces, set).
- **Approved Supplier** - lists the preferred supplier for each item.
\n**Item code** must be consistent across all sheets for accurate data connection using =XLOOKUP formula.
`,
  Inventory: `Hi kuys!👋 **What is Inventory**?
\n**Inventory** monitors stock levels:  
- Opening balance  
- Purchases received  
- Issued to production  
- Ending balance 
- Reoder status
\n
Inventory refers to the record of all materials or products currently available in stock. It tracks important details such as opening balances, purchases, issues, and ending balances to ensure there are enough materials for production.
\n
TABLE BASED ON **[MATERIAL_REQUIREMENTS_PLANNING_20251023](https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=89080024#gid=89080024)**
\n\n
<table border="1">
  <thead>
    <tr>
      <th>Item Code</th>
      <th>Description</th>
      <th>Opening Stock</th>
      <th>Purchases Received</th>
      <th>Issued to Production</th>
      <th>Ending Balance</th>
      <th>Safety Stock Level</th>
      <th>Reorder Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>TB-01</td>
      <td>Terminal Blocks</td>
      <td>60</td>
      <td>0</td>
      <td>20</td>
      <td>40</td>
      <td>50</td>
      <td>Reorder</td>
    </tr>
    <tr>
      <td>LS-02</td>
      <td>Limit Switch</td>
      <td>30</td>
      <td>10</td>
      <td>5</td>
      <td>35</td>
      <td>20</td>
      <td>Available</td>
    </tr>
    <tr>
      <td>SV-03</td>
      <td>Solenoid Valve</td>
      <td>15</td>
      <td>5</td>
      <td>10</td>
      <td>10</td>
      <td>8</td>
      <td>Available</td>
  </tbody>
</table>
\n\n
Kuys! here are the formulas that we will use:
\n
1️⃣ **Ending Balance Formula:**  
Opening Stock + Purchases Received – Issued to Production
=C2 + D2 - E2
\n
2️⃣ **Safety Stock Lookup (from BOM sheet):**  
=XLOOKUP(A2, BOM!$B$2:$B, BOM!$H$2:$H)
\n
• Finds the Safety Stock Level of each item using **Item Code**  
• Returns Safety Stock value from **BOM sheet column H**
\n
3️⃣ **Reorder Status Formula**  
=IF(F2<G2, "Reorder", "Available")
\n
4️⃣ **Issued to Production Formula** (*Optional*)
=MPS!$D4 * XLOOKUP(A2, BOM! $B$2:$B,BOM!$F$2:$F)
\n
5️⃣ **Unit Cost Formula**
=XLOOKUP(B2, BOM!$B$2:$B, BOM!$E$2:$E)
\n
🟩Important Note:
- **Opening Stock** - the quantity of items available at the ending balance of the previous week in inventory records.
- **Purchases Received** - the quantity of items added to inventory from purchase orders from previous week.
- **Issued to Production** - the quantity of items used in production based on the current week actual quantity in **MPS** and **multiplied by** the targetted material found in **BOM**.
- **Ending Balance** - the remaining quantity after accounting for purchases and production usage.
- **Safety Stock Level** - the minimum quantity to keep on hand to avoid stockouts, looked up from BOM sheet.
- **Reorder Status** - indicates if more items need to be ordered based on whether the ending balance is below the safety stock level.
\n
All materials with **reorder** will be processed in the PO (Purchase Order) sheet.
`,
  PO: `Hi kuys!👋 **PO (Purchase Order)** is used when an item needs to be re-ordered to replenish component stocks.  
It acts as a **formal request sent to the supplier** to restock needed materials.
Role in MRP:  
• Manages the procurement process  
• Tracks delivery status and updates inventory records once materials are received  
\n
It ensures timely replenishment of stock to avoid production delays and maintains accurate records of procurement costs and supplier performanc
\n
TABLE BASED ON **[MATERIAL_REQUIREMENTS_PLANNING_20251023](https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=601851345#gid=601851345)**
\n
<table border="1">
  <thead>
    <tr>
      <th>PO Number</th>
      <th>Item Code</th>
      <th>Description</th>
      <th>Qty Ordered</th>
      <th>Unit Price</th>
      <th>Total Cost</th>
      <th>Order Date</th>
      <th>Lead Time (days)</th>
      <th>Expected Delivery Date</th>
      <th>Supplier</th>
      <th>Actual Delivery Date</th>
      <th>Delivery Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PO-1001</td>
      <td>TB-01</td>
      <td>Terminal Blocks</td>
      <td>20</td>
      <td>₱140</td>
      <td>₱2,800</td>
      <td>2024-10-01</td>
      <td>3</td>
      <td>2024-10-04</td>
      <td>RS Philippines</td>
      <td>2024-10-03</td>
      <td>Delivered</td>
    </tr>
    <tr>
      <td>PO-1002</td>
      <td>LS-02</td>
      <td>Limit Switch</td>
      <td>10</td>
      <td>₱250</td>
      <td>₱2,500</td>
      <td>2024-10-02</td>
      <td>5</td>
      <td>2024-10-07</td>
      <td>Mouser Electronics</td>
      <td></td>
      <td>Pending</td>
    </tr>
    <tr>
      <td>PO-1003</td>
      <td>SV-03</td>
      <td>Solenoid Valve</td>
      <td>5</td>
      <td>₱2,500</td>
      <td>₱12,500</td>
      <td>2024-10-01</td>
      <td>7</td>
      <td>2024-10-08</td>
      <td>Automation Direct</td>
      <td>2024-10-10</td>
      <td>Delayed</td>
    </tr>
  </tbody>
</table>
\n\n
Kuys! here are the formulas that we will use:
\n
1️⃣ **Unit Price Formula:**
=XLOOKUP(B2, BOM!$B$2:$B, BOM!$E$2:$E)
\n
• Finds the Unit Price of each item using **Item Code**
• Returns Unit Price value from **BOM sheet column E**
\n
2️ **Total Cost Formula:**  
=D2 * E2
\n
3️⃣ **Lead Time (days):**
=XLOOKUP(B2, BOM!$B$2:$B, BOM!$I$2:$I)
\n
• Finds the Lead Time of each item using **Item Code**
• Returns Lead Time value from **BOM sheet column I**
\n
4️⃣ **Expected Delivery Date:**  
=G2 + H2
\n
5️⃣ **Delivery Status Formula:**  
=IF(J2="","Pending",IF(J2<=I2,"Delivered","Delayed"))
\n
6️⃣ **QTY ordered formula** (*optional*)
=MPS!$C4*XLOOKUP(B2,BOM!$B$2:$B,BOM!$F$2:$F)
\n
**🟩Important Note:**
\n
1. **Qty Ordered** - the quantity of items being requested from the supplier based on <U style="color:skyblue;">**INVENTORY**</u> (**ending bal** - **safety stock**) + **planned qty** found in next week you are working on in <u style="color:skyblue;">**MPS**</u> **Multiplied By** targetted **material qty** found in <u style="color:skyblue;">**BOM**.</u>
2. **Unit Price** - the cost per unit of each item, looked up from BOM sheet.
3. **Total Cost** - the total expense for the order line, calculated by multiplying Qty Ordered.
4. **Order Date** - the date when the purchase order is created.
5. **Lead Time (days)** - the number of days it takes to receive the item after placing an order, looked up from BOM sheet.
6. **Expected Delivery Date** - the date when the items are expected to arrive, calculated by adding Lead Time to Order Date.
7. **Actual Delivery Date** - the date when the items are actually received.
8. **Delivery Status** - indicates whether the order is **"Pending"**, **"Delivered"**, or **"Delayed"** based on Actual Delivery Date vs Expected Delivery Date.
`,
  dashboard: `Hi kuys!👋 **Data Visualization(Dashboard)** makes data easier to see and understand.
It uses charts and graphs so information becomes clearer and faster to analyze.

*Ang Data Visualization ay ginagamit para mas madali makita at maintindihan ang data.
Gumagamit ito ng charts at graphs para mas malinaw ipakita ang impormasyon at mas madali itong maipresenta sa oral validation.*
\n\n
**Purpose of Data Visualization:**
• Converts raw data into visual insights
• Helps identify patterns and trends
• Makes reports easier to explain and understand
\n
DASHBOARD BASED ON **[MATERIAL_REQUIREMENTS_PLANNING_20251023](https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=677970753#gid=677970753)**
\n
**Steps to Create a Dashboard:**
1. **Pivot MPS Summary**
    - Select all data in mps sheet
    - Insert → Pivot Table → New Sheet → Create
    - In Rows, add Product Description
    - In Values, add Planned Qty and Actual Qty (set to SUM)
    **Creating a chart from Pivot Table:**
      - Select the pivot table data
      - Insert → Chart → Choose chart type (Column Chart)
      - Set the required titles and labels in customization based on the template
2. **Pivot Inventory Status**
    - Select all data in inventory sheet
    - Insert → Pivot Table → New Sheet → Create
    - In Rows, add description
    - In Values, add ending balance and safety stock (set to SUM)
    **Creating a chart from Pivot Table:**
      - Select the pivot table data
      - Insert → Chart → Choose chart type (Column Chart)
      - Set the required titles and labels in customization based on the template
      \n
3. **Pivot Supplier Performance**
    - Select all data in po sheet
    - Insert → Pivot Table → New Sheet → Create
    - In Rows, add Supplier
    - In Values, add lead time (set to AVERAGE)
    - In Values, add Total Cost (set to SUM)
    - In filter, only select the specific supplier depending on supplier's delivery status found in PO sheet
\n
*(Copy the pivot table 2 more times in the same sheet and change the filter to the other suppliers depending on their delivery status):*
- First pivot table name it (delivered)
- Second pivot table name it (pending)
- Third pivot table name it (delayed)
\n
*after doing all that make this table inside the sheet ***below*** the pivot tables:*
**DELIVERY STATUS PERFORMANCE**
<table border="1">
  <thead>
    <tr>
      <th>supplier</th>
      <th> Avg LT (Delivered)</th>
      <th> Cost (Delivered)</th>
      <th> Avg LT (Delayed)</th>
      <th> Cost (Delayed)</th>
      <th> Avg LT (Pending)</th>
      <th> Cost (Pending)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>RS Philippines</td>
      <td>3</td>
      <td>₱2,800</td>
      <td>  </td>
      <td>  </td>
      <td>  </td>
      <td>  </td>
    </tr>
    <tr>
      <td>Automation Direct</td>
      <td>  </td>
      <td>  </td>
      <td>7</td>
      <td>₱12,500</td>
      <td>  </td>
      <td>  </td>
    </tr>
    <tr>
      <td>Mouser Electronics</td>
      <td>  </td>
      <td>  </td>
      <td>  </td>
      <td>  </td>
      <td>5</td>
      <td>₱2,500</td>
    </tr>
  </tbody>
</table>
\n
\n*after making this table yo can now proceed to create the chart:*
  - Select the table data
  - Insert → Chart → Choose chart type (combo chart)
  - scroll down to the setup
    - Click use row as headers
    - Click Use column as labels
\n
**customization settings:**
- go to customize tab
- go to series
  - For Cost (Delivered), set to line chart, put to the right axis.
  - For Cost (Delayed), set to line chart, put to the right axis.
  - For Cost (Pending), set to line chart, put to the right axis.
  - For Avg LT (Delivered), set to column chart
  - For Avg LT (Delayed), set to column chart
  - For Avg LT (Pending), set to column chart
- go to legend
  - click positions
  - select bottom
- Set the required titles and labels in customization based on the template

4. **Dashboard**
    - Add a new sheet
    - Name it Dashboard
    - Select all the chart that you created
    - copy it one by one
    - paste it in the Dashboard sheet
\n
Congrats kuys! tapos kana sa lahat ng modules lalo na sa dashboard!
`,
  pivot: `Hi kuys!👋 A Pivot Table streamlines **data analysis** by summarizing and organizing large amounts of information **quickly and efficiently**. This is helpful to create CHARTS later
  Paano gawin: \n\n\n\n
  1. I-click yung buong sheet na **may mga sulat lang**.
  2. Pumunta sa **Insert**.
  3. Piliin ang **Pivot Table**, tapos **New Worksheet**. 
  5. Click **Create**
  6. Double click to edit
  \n Aral well kuys!`,
  "How can I prepare for oral validation": `Hi kuys!👋, here's how to prepare for oral validation in MRP (Material Requirements Planning):  
\n
1. **Master the MRP Process Flow**: Understand how data moves from **MPS → BOM → Inventory → PO → Dashboard**. Be ready to explain each step.  
\n
2. **Practice Spreadsheet Skills**:  
   - Use formulas correctly (e.g., IFERROR) to calculate requirements.  
   - Link sheets (MPS, BOM, Inventory, PO) without errors.  
   - Format sheets neatly for readability.  
\n
3. **Create Reports**:  
   - Learn to make pivot tables, charts, and dashboards.  
   - Practice explaining insights from these visuals.  
\n
4. **Simulate the Full Workflow**: Integrate all sheets and validate data accuracy.  
\n
5. **Practice Oral Explanation**:  
   - Clearly explain your logic and steps in updating the workbook.  
   - Be ready to answer questions about formulas, formatting, and results.  
\n
Kuys, focus on understanding the *why* and *how* of each step! 📊✨  
Kuys, need more help? Just ask! 😊`,
  "Data connection between sheets": `Hi kuys!👋 **How data flows between MPS, BOM, Inventory, and Purchase Orders**  
In the Material Requirements Planning (MRP) system, the data connection between sheets ensures seamless communication and integration across different stages of production and inventory management. Here’s a detailed breakdown of how the sheets are connected:

\n
📌 **STEP 1 — MPS (Master Production Schedule)**  
\n
In MPS you should base on the last week, there are two types of quantity:  
- **Planned Qty** → the target production (what you plan to make)  
- **Actual Qty** → the quantity actually produced or approved for production  
\n
→ The **Actual Qty** is the basis that will be passed on to the BOM.  
\n
Example in MPS:  
Product: Trainer Board  
Planned Qty: 100  
Actual Qty: 90 (this is what will be used)  
\n
→ The **Actual Qty** is used by BOM to compute required materials.  
\n
📌 **STEP 2 — BOM (Bill of Materials)**  
\n
BOM lists all parts/components needed per product.  
\n
Example in BOM:  
Component: Resistor  
Qty per item (based on the specification): 5 pcs  
\n
MPS Actual Qty = 90 units  
Qty = 90 × 5 = **450 pcs**  
\n
→ BOM uses the **Actual Qty from MPS** to calculate total component requirements.  
\n
📌 **STEP 3 — Inventory**  
\n
Inventory compares the required quantity (from BOM) vs. stock on hand.  
\n
Example in Inventory:  
Beginning Balance = 300 pcs  
Required from BOM = 450 pcs 
\n
→ Inventory detects the shortage using formulas
\n
📌 **STEP 4 — PO (Purchase Order)**  
\n
If there is a shortage in Inventory, a PO is generated.  
\n
Example in PO:  
Item: Resistor  
Qty Ordered: **150 pcs**  
Supplier: Kaizenset Electronics  
\n
When the items arrive:  
→ They are entered in **Qty IN** in Inventory  
→ **Ending Balance** is recalculated automatically.  

\n
🟦 **SUMMARY (to avoid confusion):**  
\n
<table border="1">
  <thead>
    <tr>
      <th>Sheet</th>
      <th>Input from Previous Sheet</th>
      <th>Output Sent to Next Sheet</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>MPS</td>
      <td>Planned / Actual Qty</td>
      <td>Actual Qty → BOM</td>
    </tr>
    <tr>
      <td>BOM</td>
      <td>Actual Qty (from MPS)</td>
      <td>Component Requirements → Inventory</td>
    </tr>
    <tr>
      <td>Inventory</td>
      <td>Required Qty (from BOM)</td>
      <td>Shortage Qty → PO</td>
    </tr>
    <tr>
      <td>PO</td>
      <td>Shortage Qty (from Inventory)</td>
      <td>Qty IN → Inventory update</td>
    </tr>
  </tbody>
</table>
\n
🎯 **Main Concept:**  
\n
> **Whatever quantity is finalized in MPS becomes the basis of computation in BOM.  
> Whatever material requirement is computed in BOM becomes the basis for checking stock in Inventory.  
> Whatever shortage is detected in Inventory becomes the basis for the Purchase Order.**  
\n`,
  "Three types of data": `Hi kuys!👋In the Material Requirements Planning (MRP) system, the three types of data processes; data visualization, data manipulation, and data analysis plays crucial roles in creating the MRP as it is the basis on how each sheet connects
\n
 **Types of Data:**
\n
1. **Data Manipulation** - Involves organizing and modifying data using spreadsheet functions and formulas to ensure accuracy and consistency across the MRP system.
2. **Data Analyzation** - Focuses on interpreting and summarizing data to extract meaningful insights for decision-making, by using pivot table.
3. **Data Visualization** - Helps present data in a visual format, such as charts and dashboards, to make trends, comparisons, and insights easier to understand.
`,
  References: `Hi kuys!👋, to find the resources, click the **program** > **google classroom**
\n*Kuys, tignan mo yung header natin, tapos sa header, hanapin mo yung **Program**. Pag nakita mo na, i-click mo yung **Google Classroom**.*
\n
**If not found please click here according to your need:**
1. **[MATERIAL_REQUIREMENTS_PLANNING_20251023](https://docs.google.com/spreadsheets/d/1y-9QnNwmhOlyjKYf9uaHA5Q4IAy2ANOs/edit?gid=506882268#gid=506882268)**
2. **[ICTDP_PerformanceChecklist](https://docs.google.com/document/d/1mT_NOVLIrPwj0j-V15a1efY-lLXr5Axe/edit)**
3. **[ICTDP_Module_Structure_v2](https://docs.google.com/document/d/1qSm3xFtBFx-AjqxMeWa5ezkMbM7eLQqf/edit)**
4. **[ICTDP_CBLM_Material_Requirement_Plan](https://docs.google.com/document/d/1MVgh48bu-ZktfSaGXjjlR3YdmR8Po6cp/edit)**
5. **[HOUSE R.U.L.E.S](https://docs.google.com/document/d/1TZz8CO69iAF-9vPXgA3spmm-BtpEnnQZ3m_9Z3DFmtM/edit?usp=drive_link)**
6. **[Story: The Flow of Data Through the MRP System](https://docs.google.com/document/d/1ULRv2mg6SUS5LoIe7TLq9VhSenhcA2wPAAmIx6KFP-E/edit?tab=t.0#heading=h.cbftajuzahgw)**
7. **[ICTDP_Orientation_Flow_and_Script](https://docs.google.com/document/d/1HHZM2zfb98M6LV6x_EjpIMr7aUTEdG2gJ-zrEaq5J-Q/edit?tab=t.0)**
8. **[ICTDP_ManualWorkflowProcedure](https://docs.google.com/document/d/1fujX8feo6hE_XFAfuTD0GUVsF44eIPJPI5-LLdWyePg/edit?tab=t.0)**
9. **[MRP_CBLM_Module1_v5a](https://docs.google.com/document/d/1X3f4ADqU1PH8zAFyu-8uKYGElBp4Pv6a/edit?rtpof=true&tab=t.0)**
10. **[MRP_CBLM_Module2_v7a](https://docs.google.com/document/d/167El0U3ZzflufO5kzhORlX8QSDPDolWJ/edit?rtpof=true&tab=t.0)**
11. **[MRP_CBLM_Module3_v1a](https://docs.google.com/document/d/11GaW0TpsAvPxIweMPLmmm3sjFVKN4Hnn/edit#heading=h.stdfr3j453vw)**
12. **[ICTDP_Summary_Rubrics_v3](https://docs.google.com/document/d/1lIIc5dBTBvm33_sG_4dpz0UFXSZ5BSOiSZ_rDff4TFA/edit?tab=t.0#heading=h.560mphxggfmp)**
13. **[ICTDP_MRP_Thesis](https://docs.google.com/document/d/1UDgB-Em5vdru6pNax_fag0Rs528clRn7lt7BgVxfL3Q/edit?tab=t.0)**
14. **[Downloadble EDITABLE SPREEDSHEET(FREE!!! CLICK ME!!! NOW!!!](https://docs.google.com/spreadsheets/d/1HRQK3lJD_GUDZT2ExWX5W_QboVbHsU2X/edit?gid=677970753#gid=677970753)**
\n
**Form submision & quiz Links:**
1. **[Registration](https://docs.google.com/forms/d/e/1FAIpQLScqElds2odcKxVAb4h4-qnC7JxK2UWocsjHYOHu5Ob2J5Yv5A/viewform)**
2. **[Module 1](https://docs.google.com/forms/d/e/1FAIpQLSeIsO_7TlYWT8i6hXBVmTw6-3UFH8kYQ3ipll0lC9KxvOwOFg/viewform)**
3. **[Module 2](https://docs.google.com/forms/d/e/1FAIpQLScMn2q_BgZrUmJdSQyRqhiHcKNmDY7uxbWg07CZ1G7zajyC8w/viewform?usp=header)**
4. **[Module 3](https://docs.google.com/forms/d/e/1FAIpQLSexDGWOZ6CLnjh7WbItGeeShHdwzLGgUBa8m0B81_AeNSLOmw/viewform)**
5. **[Completion Assessment Form](https://docs.google.com/forms/d/1S3P8vaLIJ4qsgMCI9x2TEGsW2enUFgthzEY3H51eEM8/viewform?edit_requested=true)**
`,
  "Main developer of AILA?": `Hi kuys!👋, The main programmer, Full stack dev of AILA is **[Joshua M. Narvasa](https://web.facebook.com/Jomong.things)**
\n**Made this User Interface:**
- As a Full stack developer
*Tools used:*
  - Front End:
    - HTML
    - CSS
    - JS
  - Back End:
    - N8N workflow
    - Pinecone "LLM Assistant"
    - Supabase "database"
  `,
  // module questions area //
  "module 1": `Hi kuys!👋 here's:
**[MRP_CBLM_Module1_v5a](https://docs.google.com/document/d/1X3f4ADqU1PH8zAFyu-8uKYGElBp4Pv6a/edit?rtpof=true&tab=t.0)**
Module 1: Understanding the MRP System is your foundation for learning Material Requirement Planning! Here's what it covers:
\n
**Duration:** 1 hour
**Competency:** Data Manipulation and Analyzation
**Level:** 3 (controlled educational/demonstration)
\n
**Learning Objectives:**
- Identify data relationships and flow in MRP spreadsheets
- Demonstrate interaction between MPS, BOM, Inventory, and Purchase Orders
- Explain how spreadsheet formulas support MRP decisions
- Interpret KPIs from the Dashboard
\n
**Key Terms You'll Learn:**
- **MRP:** System for calculating materials needed for production
- **MPS:** Master Production Schedule - what to make and when
- **BOM:** Bill of Materials - list of components needed
- **Inventory:** Materials on hand and available
- **Lead Time:** Time between ordering and receiving materials
- **Safety Stock:** Extra inventory to prevent shortages
- **Reorder Point:** When to order new stock
- **Purchase Order:** Formal request to suppliers
- **Dashboard:** Visual summary of performance indicators
\n
**The MRP Data Cycle:**
You'll work through a real example - like a client ordering 12 Mechatronics Trainer Boards. The order drives the MPS, which feeds into BOM calculations. Inventory checks material availability, and if needed, Purchase Orders are created. The Dashboard tracks everything and provides insights for better planning.
\n
**Activity:**
You'll analyze the MRP workbook by identifying the purpose of each tab (MPS, BOM, Inventory, Purchase Orders, Dashboard) and how data flows between them.
\n
This module prepares you for deeper MRP applications in the next modules! 📊
\n**[Module 1 Assesment form](https://docs.google.com/forms/d/e/1FAIpQLSeIsO_7TlYWT8i6hXBVmTw6-3UFH8kYQ3ipll0lC9KxvOwOFg/viewform)**
`,
  "How to transfer between modules": `Hi kuys!👋 To transfer between MRP modules, you need to complete the current module first through:
\n
1. **Finish all activities** - Complete all required tasks, quizzes, and outputs for your current module
2. **Pass oral validation** - Learning Assistants will assess your understanding through questioning
3. **Submit outputs** - Hand in your activity sheets and required deliverables  
4. **Get approval** - Once validated, you can proceed to the next module
\n
The modules build on each other:
- Module 1 → Module 2: Focus moves from theory to hands-on spreadsheet work
- Module 2 → Module 3: Advanced analysis and dashboard creation
- Module 3 → Final Presentation: Last and final step after you've finished all modules
\n
Make sure to master each module before moving forward! 📚`,
  "module 2": `Hi kuys!👋 here's:
**[MRP_CBLM_Module2_v7a](https://docs.google.com/document/d/167El0U3ZzflufO5kzhORlX8QSDPDolWJ/edit?rtpof=true&tab=t.0)**
Module 2 is all about working with Material Requirement Planning (MRP) data using spreadsheets! 📊
\n
**Key points:**
- **Duration:** 1 hour (Level 3)
- **Focus:** Spreadsheet-based MRP simulation
- **Main competency:** Data manipulation across different sheets
\n
**What you'll learn:**
- Working with Master Production Schedule (MPS), Bill of Materials (BOM), Inventory, and Purchase Orders
- Applying spreadsheet formulas and formatting for consistency
- Maintaining an audit-ready workbook
\n
**Main activity:**
You'll get a case scenario where a client orders 12 Mechatronics Trainer Boards for delivery in 4 weeks. You need to:
- Set weekly production plans in **MPS**
- Compute material requirements in **BOM**
- Update stock movement in **Inventory**
- Record supplier details and costs in **Purchase Orders**
\n
**Skills covered:**
- Excel tools: Freeze Panes, Filters, Wrap Text, Conditional Formatting
- Lookup functions (XLOOKUP/VLOOKUP)
- Logical formulas (IF statements)
- Summation formulas (SUMIF)
- Basic arithmetic for stock balance calculations
\n
The module prepares you for handling real MRP data used in planning, production, and procurement! 🛠️
**[Free editable workbook here](https://docs.google.com/spreadsheets/d/1HRQK3lJD_GUDZT2ExWX5W_QboVbHsU2X/edit?gid=677970753#gid=677970753)**
\n**[Module 2 Assesment Form](https://docs.google.com/forms/d/e/1FAIpQLScMn2q_BgZrUmJdSQyRqhiHcKNmDY7uxbWg07CZ1G7zajyC8w/viewform?usp=header)**
`,
  "module 3": `Hi kuys!👋 here's:
  **[MRP_CBLM_Module3_v1a](https://docs.google.com/document/d/11GaW0TpsAvPxIweMPLmmm3sjFVKN4Hnn/edit#heading=h.stdfr3j453vw)**
  \nModule 3 is all about **Data Analysis and Visualization** in MRP! 
  📊\n**Key points:** 
  \n- **Duration:**: 1-2hours 
  \n- **Focus:** Data sheets and tables 
  \n- **Main competency:** Data Visualization and Data Analyzation
  \n\nHere's what you'll learn:
  \n\n**Main Focus:** Analyzing and visualizing MRP data to help production and procurement decisions.
  \n\n**Key Topics:**\n- Creating pivot tables from MRP data (Inventory, Purchase Orders, Master Production Schedule)
  \n- Building charts and dashboards to show supplier performance, production progress, and material costs\n- Interpreting reports to find trends and areas for improvement\n\n**Activities You'll Do:**\n- Summarize MRP workbook data with pivot tables\n- Create charts showing supplier performance (lead time vs cost, etc.)\n- Build dashboards that visualize production output vs plan and inventory status\n\n**Assessment Criteria:**\n- Pivot table accuracy\n- Chart design and data representation\n- Dashboard integration and presentation\n- Analytical interpretation of results\n\nThis module helps management monitor important data like lead time, costs, and fulfillment rates to make better decisions for continuous improvement! 😊",
\n**[Module 3 Assesment Form](https://docs.google.com/forms/d/e/1FAIpQLSexDGWOZ6CLnjh7WbItGeeShHdwzLGgUBa8m0B81_AeNSLOmw/viewform)**
`,
  "add more": "addmore",
};

const messagesEl = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const logoArea = document.getElementById("logo");

function convertMediaLinks(text) {
  let processedText = text;

  // Regex for image URLs ending in common formats
  const imageUrlRegex = /(https?:\/\/[^\s<>()]+?\.(?:png|jpg|jpeg|gif|webp))/gi;

  // Regex for video URLs (YouTube, Google Drive)
  const videoUrlRegex =
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/|drive\.google\.com\/file\/d\/)[\w-]+(?:[\/?][\w-.=&]*)?/g;

  // First, process image URLs and turn them into HTML <img> tags
  processedText = processedText.replace(imageUrlRegex, (url) => {
    return `<img src="${url}" alt="Embedded Image from AILA" style="max-width: 100%; border-radius: 12px; margin-top: 10px;" />`;
  });

  // Next, process video URLs into Markdown-style links
  processedText = processedText.replace(videoUrlRegex, (url) => {
    // If the URL is already inside an <img> tag we just created, don't touch it.
    if (processedText.includes(`src="${url}"`)) {
      return url;
    }

    let linkText = "[Click to watch video]";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      linkText = "[Click to watch YouTube video]";
    } else if (url.includes("drive.google.com")) {
      linkText = "[Click to watch Google Drive video]";
    }
    // This creates a Markdown link, which our sanitizer will turn into a safe, clickable <a> tag.
    return `\n${linkText}(${url})\n`;
  });

  return processedText;

  // Replace Google Drive links
  processedText = processedText.replace(gdriveRegex, (match, fileId) => {
    console.log("[AILA Debug] Found Google Drive video. ID:", fileId); // DEBUG
    if (!fileId) return match;
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    console.log("[AILA Debug] Constructed Google Drive Embed URL:", embedUrl); // DEBUG
    return `<div class="video-container"><iframe src="${embedUrl}"></iframe></div>`;
  });

  return processedText;
}

/* Marked + DOMPurify */
marked.setOptions({ breaks: true, gfm: true });
function renderSafeMarkdown(mdText) {
  if (typeof mdText !== "string") mdText = String(mdText || "");

  // The 'marked' library will handle link parsing automatically.
  const raw = marked.parse(mdText);

  // UPDATED: Allow 'img' tags for pictures, but keep 'iframe' disallowed for safety.
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ["img"],
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

  // Convert video/image links before rendering
  let contentToRender = text;
  if (who === "bot") {
    contentToRender = convertMediaLinks(text);
  }

  wrap.innerHTML = renderSafeMarkdown(contentToRender);

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
function sendToBackend(text, askSuggestions = false) {
  showTyping();
  const payload = {
    message: text,
    sessionId: "guest_" + Date.now(),
    name: "Guest",
    email: null,
    askForSuggestions: !!askSuggestions,
  };

  // a function where it get's answer when offline mode is triggered
  function getOfflineAnswer(q) {
    const foundKey = Object.keys(offlineResponses).find((k) =>
      q.toLowerCase().includes(k.toLowerCase())
    );
    return foundKey
      ? offlineResponses[foundKey]
      : `🔴OFFLINE: 
      Kuys! tulog pa si AILA, click mo nalang yung button for more common questions.
      \n<h5>We're still looking forward to the day that the already-prepared online version (GISING NA SI AILA), gets approved, even if it comes with a small fee, because it will allow us to help more LA and incoming trainees in the future.</h5>
      \n- *AILA can still response in templated answers given below, CLICK THE BUTTON*
      `;
  }
  // N8N fetch url
  fetch("https://laict.app.n8n.cloud/webhook/aila-chat", {
    // put your chatwebhook url here
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      hideTyping();
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json().catch(() => ({}));
      const reply = data && data.reply ? data.reply : getOfflineAnswer(text);

      const suggestions = Array.isArray(data?.suggestions)
        ? data.suggestions
        : generateSuggestionsFromBoth(text, reply);

      appendMessage(reply, "bot", false, suggestions);
      pulseLogoOnce();
    })
    .catch((err) => {
      hideTyping();
      console.warn("Offline mode triggered:", err);
      const reply = getOfflineAnswer(text);
      appendMessage(reply, "bot", true);
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
showWelcomeScreen();

const ro = new MutationObserver(
  () => (messagesEl.scrollTop = messagesEl.scrollHeight)
);
ro.observe(messagesEl, { childList: true, subtree: true });

window.addEventListener("load", () => setTimeout(() => input.focus(), 250));
