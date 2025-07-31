const searchInput = document.getElementById("search");
const facultyInput = document.getElementById("faculty-input");
const facultyList = document.getElementById("faculty-list");
const cardContainer = document.getElementById("card-container");
const downloadHeader = document.getElementById("dynamic-header");
const footerText = document.getElementById("footer-text");
const noResultsMessage = document.getElementById("no-results");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const paginationControls = document.getElementById("pagination-controls");

const rowsPerPage = 20;
let allData = [];
let filteredData = [];
let currentPage = 1;

fetch("faculty.json")
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch faculty.json");
    return response.json();
  })
  .then(data => {
    allData = data;
    populateFacultyList(data);
    filterAndDisplayData();
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });

function populateFacultyList(data) {
  const facultyNames = [...new Set(data.map(item => item["Faculty Name"]).filter(Boolean))];
  facultyNames.sort();
  facultyNames.forEach(faculty => {
    const option = document.createElement("option");
    option.value = faculty;
    facultyList.appendChild(option);
  });
}

function filterAndDisplayData() {
  const faculty = facultyInput.value.trim().toLowerCase();
  const query = searchInput.value.trim().toLowerCase();

  if (faculty) {
    downloadHeader.textContent = `[${facultyInput.value}]`;
  } else {
    downloadHeader.textContent = "[Faculty Name]";
  }

  filteredData = allData.filter(item => {
    const nameMatch = item["Faculty Name"]?.toLowerCase().includes(faculty);
    const queryMatch = !query || Object.values(item).some(val =>
      String(val).toLowerCase().includes(query)
    );
    return (!faculty || nameMatch) && queryMatch;
  });

  currentPage = 1;
  displayCards(filteredData);
}

function displayCards(data) {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = data.slice(start, end);

  cardContainer.innerHTML = "";

  if (pageData.length === 0) {
    noResultsMessage.style.display = "block";
    cardContainer.style.display = "none";
    paginationControls.style.display = "none";
  } else {
    noResultsMessage.style.display = "none";
    cardContainer.style.display = "grid";
    paginationControls.style.display = "flex";

    pageData.forEach(item => {
      const card = `
        <div class="card">
          <h3>${item["Faculty Name"] || "TBA Faculty"}</h3>
          <p><strong>Designation:</strong> ${item["Designation"] || "N/A"}</p>
          <p><strong>Room No:</strong> ${item["Room No"] || "N/A"}</p>
          <p><strong>Department:</strong> ${item["Department"] || "N/A"}</p>
          <p><strong>Email:</strong> ${item["Email"] || "N/A"}</p>
        </div>
      `;
      cardContainer.innerHTML += card;
    });

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = end >= data.length;
  }
}

facultyInput.addEventListener("input", filterAndDisplayData);
searchInput.addEventListener("input", filterAndDisplayData);

prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayCards(filteredData);
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage * rowsPerPage < filteredData.length) {
    currentPage++;
    displayCards(filteredData);
  }
});

document.getElementById("download-btn").addEventListener("click", () => {
  const downloadArea = document.getElementById("download-area");
  downloadArea.classList.add("landscape-download");

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }

  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  const formattedDate = `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  const time = now.toLocaleTimeString();

  footerText.textContent = `Generated from FARHAN-DEV, Downloaded on ${formattedDate} at ${time}.`;

  html2canvas(downloadArea, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  }).then(canvas => {
    downloadArea.classList.remove("landscape-download");
    const link = document.createElement("a");
    link.download = "faculty-directory.png";
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  });
});
