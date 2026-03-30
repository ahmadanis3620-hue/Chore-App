const CHORE_STORAGE_KEY = "cross-creek-chores";
const USER_STORAGE_KEY = "cross-creek-user";

const seedData = [
  {
    id: crypto.randomUUID(),
    name: "Alicia",
    neighborhood: "Cross Creek",
    title: "Lawn mowing help",
    details: "Need front lawn mowed before Sunday lunch.",
    budget: 30,
    date: "2026-04-05",
    interestCount: 0
  },
  {
    id: crypto.randomUUID(),
    name: "Sam",
    neighborhood: "Cross Creek",
    title: "Leaf cleanup",
    details: "Need leaves bagged from front yard this Friday.",
    budget: 20,
    date: "2026-04-03",
    interestCount: 0
  }
];

const authCard = document.getElementById("auth-card");
const authForm = document.getElementById("auth-form");
const appShell = document.getElementById("app-shell");
const welcomeText = document.getElementById("welcome-text");
const logoutBtn = document.getElementById("logout");
const modeRequestBtn = document.getElementById("mode-request");
const modeHelperBtn = document.getElementById("mode-helper");
const modeNote = document.getElementById("mode-note");
const postSection = document.getElementById("post-section");
const browseSection = document.getElementById("browse-section");
const browseHeading = document.getElementById("browse-heading");
const form = document.getElementById("chore-form");
const searchInput = document.getElementById("search");
const maxBudgetInput = document.getElementById("max-budget");
const listEl = document.getElementById("chore-list");
const template = document.getElementById("chore-item-template");

let currentUser = loadUser();
let currentMode = null;
let chores = loadChores();

function loadChores() {
  const raw = localStorage.getItem(CHORE_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(CHORE_STORAGE_KEY, JSON.stringify(seedData));
    return [...seedData];
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(CHORE_STORAGE_KEY, JSON.stringify(seedData));
    return [...seedData];
  }
}

function saveChores(nextChores) {
  localStorage.setItem(CHORE_STORAGE_KEY, JSON.stringify(nextChores));
}

function loadUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

function showApp() {
  authCard.classList.add("hidden");
  appShell.classList.remove("hidden");
  welcomeText.textContent = `Welcome, ${currentUser.name} (${currentUser.neighborhood})`;

  if (!currentMode) {
    modeNote.textContent = "Choose one option above to continue.";
    postSection.classList.add("hidden");
    browseSection.classList.add("hidden");
  }
}

function showAuth() {
  appShell.classList.add("hidden");
  authCard.classList.remove("hidden");
}

function setMode(mode) {
  currentMode = mode;

  if (mode === "request") {
    modeNote.textContent = "Great. Post chores and browse helpers interested in your tasks.";
    browseHeading.textContent = "All posted chores";
    postSection.classList.remove("hidden");
    browseSection.classList.remove("hidden");
  } else {
    modeNote.textContent = "Great. Browse chore requests and mark the jobs you're interested in.";
    browseHeading.textContent = "Available chores near you";
    postSection.classList.add("hidden");
    browseSection.classList.remove("hidden");
  }

  renderChores();
}

function renderChores() {
  const query = searchInput.value.trim().toLowerCase();
  const maxBudget = Number(maxBudgetInput.value);

  const filtered = chores.filter((item) => {
    const haystack = `${item.title} ${item.details}`.toLowerCase();
    const matchesText = !query || haystack.includes(query);
    const matchesBudget = !maxBudgetInput.value || item.budget <= maxBudget;
    return matchesText && matchesBudget;
  });

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No chores match your filters yet.";
    listEl.append(empty);
    return;
  }

  for (const chore of filtered) {
    const node = template.content.cloneNode(true);

    node.querySelector(".chore-title").textContent = chore.title;
    node.querySelector(".badge").textContent = chore.neighborhood;
    node.querySelector(".chore-details").textContent = chore.details;
    node.querySelector(".budget").textContent = `$${chore.budget}`;
    node.querySelector(".date").textContent = `Needed by: ${chore.date}`;
    node.querySelector(".posted-by").textContent = `Posted by ${chore.name}`;
    node.querySelector(".interest").textContent = `Interested helpers: ${chore.interestCount ?? 0}`;

    const interestBtn = node.querySelector(".interest-btn");
    interestBtn.addEventListener("click", () => {
      chores = chores.map((item) => {
        if (item.id === chore.id) {
          return { ...item, interestCount: (item.interestCount ?? 0) + 1 };
        }
        return item;
      });
      saveChores(chores);
      renderChores();
    });

    if (currentMode === "request") {
      interestBtn.classList.add("hidden");
    }

    listEl.append(node);
  }
}

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("auth-name").value.trim();
  const neighborhood = document.getElementById("auth-neighborhood").value.trim();

  currentUser = { name, neighborhood };
  saveUser(currentUser);
  showApp();
});

logoutBtn.addEventListener("click", () => {
  clearUser();
  currentUser = null;
  currentMode = null;
  showAuth();
  authForm.reset();
});

modeRequestBtn.addEventListener("click", () => setMode("request"));
modeHelperBtn.addEventListener("click", () => setMode("helper"));

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const newChore = {
    id: crypto.randomUUID(),
    name: currentUser.name,
    neighborhood: currentUser.neighborhood,
    title: document.getElementById("title").value.trim(),
    details: document.getElementById("details").value.trim(),
    budget: Number(document.getElementById("budget").value),
    date: document.getElementById("date").value,
    interestCount: 0
  };

  chores = [newChore, ...chores];
  saveChores(chores);
  form.reset();
  renderChores();
});

searchInput.addEventListener("input", renderChores);
maxBudgetInput.addEventListener("input", renderChores);

if (currentUser) {
  showApp();
} else {
  showAuth();
}
