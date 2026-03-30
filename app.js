const STORAGE_KEY = "cross-creek-chores";

const seedData = [
  {
    role: "Parent",
    name: "Alicia",
    title: "Lawn mowing help",
    details: "Need front lawn mowed before Sunday lunch.",
    budget: 30,
    date: "2026-04-05"
  },
  {
    role: "Kid",
    name: "Evan",
    title: "Dog walking partner",
    details: "Can walk dogs after school 4-6 PM on weekdays.",
    budget: 15,
    date: "2026-04-02"
  }
];

function loadChores() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return [...seedData];
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return [...seedData];
  }
}

function saveChores(chores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chores));
}

const form = document.getElementById("chore-form");
const searchInput = document.getElementById("search");
const maxBudgetInput = document.getElementById("max-budget");
const listEl = document.getElementById("chore-list");
const template = document.getElementById("chore-item-template");

let chores = loadChores();

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
    node.querySelector(".badge").textContent = chore.role;
    node.querySelector(".chore-details").textContent = chore.details;
    node.querySelector(".budget").textContent = `$${chore.budget}`;
    node.querySelector(".date").textContent = `Needed by: ${chore.date}`;
    node.querySelector(".posted-by").textContent = `Posted by ${chore.name}`;

    listEl.append(node);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const newChore = {
    role: document.getElementById("role").value,
    name: document.getElementById("name").value.trim(),
    title: document.getElementById("title").value.trim(),
    details: document.getElementById("details").value.trim(),
    budget: Number(document.getElementById("budget").value),
    date: document.getElementById("date").value
  };

  chores = [newChore, ...chores];
  saveChores(chores);
  form.reset();
  renderChores();
});

searchInput.addEventListener("input", renderChores);
maxBudgetInput.addEventListener("input", renderChores);

renderChores();
