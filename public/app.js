const state = {
  dashboard: null,
  projects: [],
  filteredProjects: [],
  feed: [],
  leaderboardRange: "weekly",
  activeProjectId: null,
  selectedProjectId: null
};

const elements = {
  headline: document.getElementById("headline"),
  subheadline: document.getElementById("subheadline"),
  primaryCta: document.getElementById("primaryCta"),
  spotlightTitle: document.getElementById("spotlightTitle"),
  spotlightBody: document.getElementById("spotlightBody"),
  roleChips: document.getElementById("roleChips"),
  statsGrid: document.getElementById("statsGrid"),
  liveCount: document.getElementById("liveCount"),
  pulseText: document.getElementById("pulseText"),
  sprintLaunches: document.getElementById("sprintLaunches"),
  checkInsToday: document.getElementById("checkInsToday"),
  proofPoints: document.getElementById("proofPoints"),
  profileName: document.getElementById("profileName"),
  profileRole: document.getElementById("profileRole"),
  streakValue: document.getElementById("streakValue"),
  joinedMissions: document.getElementById("joinedMissions"),
  completedTasks: document.getElementById("completedTasks"),
  weeklyGoal: document.getElementById("weeklyGoal"),
  focusWindow: document.getElementById("focusWindow"),
  workspaceSummary: document.getElementById("workspaceSummary"),
  taskProgressText: document.getElementById("taskProgressText"),
  taskProgressFill: document.getElementById("taskProgressFill"),
  taskList: document.getElementById("taskList"),
  workspaceNotes: document.getElementById("workspaceNotes"),
  feedList: document.getElementById("feedList"),
  leaderboardList: document.getElementById("leaderboardList"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  resultsText: document.getElementById("resultsText"),
  projectsGrid: document.getElementById("projectsGrid"),
  missionPreviewTitle: document.getElementById("missionPreviewTitle"),
  missionPreviewTagline: document.getElementById("missionPreviewTagline"),
  missionPreviewDescription: document.getElementById("missionPreviewDescription"),
  missionPreviewMeta: document.getElementById("missionPreviewMeta"),
  missionPreviewRoles: document.getElementById("missionPreviewRoles"),
  missionPreviewButton: document.getElementById("missionPreviewButton"),
  challengeList: document.getElementById("challengeList"),
  mentorList: document.getElementById("mentorList"),
  resourceList: document.getElementById("resourceList"),
  launchSprintBtn: document.getElementById("launchSprintBtn"),
  checkInBtn: document.getElementById("checkInBtn"),
  actionStatus: document.getElementById("actionStatus"),
  actionStatusTitle: document.getElementById("actionStatusTitle"),
  actionStatusText: document.getElementById("actionStatusText"),
  focusBtn: document.getElementById("focusBtn"),
  projectDialog: document.getElementById("projectDialog"),
  closeDialogBtn: document.getElementById("closeDialogBtn"),
  dialogTitle: document.getElementById("dialogTitle"),
  dialogTagline: document.getElementById("dialogTagline"),
  dialogDescription: document.getElementById("dialogDescription"),
  dialogMeta: document.getElementById("dialogMeta"),
  dialogJoinBtn: document.getElementById("dialogJoinBtn"),
  projectCardTemplate: document.getElementById("projectCardTemplate")
};

async function request(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function setActionStatus(title, text, type = "") {
  elements.actionStatusTitle.textContent = title;
  elements.actionStatusText.textContent = text;
  elements.actionStatus.classList.remove("is-success", "is-error");
  if (type) {
    elements.actionStatus.classList.add(type);
  }
}

function setButtonLoading(button, loadingText) {
  button.dataset.originalText = button.textContent;
  button.textContent = loadingText;
  button.disabled = true;
}

function restoreButton(button) {
  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function renderOverview(overview) {
  elements.headline.textContent = overview.headline;
  elements.subheadline.textContent = overview.subheadline;
  elements.primaryCta.textContent = overview.ctaPrimary;
  elements.spotlightTitle.textContent = overview.spotlight.title;
  elements.spotlightBody.textContent = overview.spotlight.body;
  elements.liveCount.textContent = formatNumber(overview.stats[1].value);
  elements.sprintLaunches.textContent = formatNumber(overview.sprintLaunches);
  elements.pulseText.textContent = `${overview.featuredCategories.length} active categories. Highest current demand: ${overview.openRoles[0]}.`;

  elements.roleChips.innerHTML = "";
  overview.openRoles.forEach((role) => {
    const chip = document.createElement("span");
    chip.textContent = role;
    elements.roleChips.appendChild(chip);
  });

  elements.statsGrid.innerHTML = "";
  overview.stats.forEach((item) => {
    const stat = document.createElement("div");
    stat.className = "mini-stat";
    stat.innerHTML = `<span class="task-meta">${item.label}</span><strong>${formatNumber(item.value)}</strong>`;
    elements.statsGrid.appendChild(stat);
  });
}

function renderProfile(profile, checkInsToday) {
  elements.profileName.textContent = profile.name;
  elements.profileRole.textContent = profile.role;
  elements.checkInsToday.textContent = formatNumber(checkInsToday);
  elements.proofPoints.textContent = formatNumber(profile.proofPoints);
  elements.streakValue.textContent = `${profile.streak} days`;
  elements.joinedMissions.textContent = formatNumber(profile.joinedMissions);
  elements.completedTasks.textContent = formatNumber(profile.completedTasks);
  elements.weeklyGoal.textContent = formatNumber(profile.weeklyGoal);
}

function renderWorkspace(workspace) {
  elements.focusWindow.textContent = workspace.focusWindow;
  elements.workspaceSummary.textContent = workspace.summary;
  elements.taskProgressText.textContent = `${workspace.progress.completed} of ${workspace.progress.total} complete`;
  elements.taskProgressFill.style.width = `${workspace.progress.percent}%`;

  elements.taskList.innerHTML = "";
  workspace.tasks.forEach((task) => {
    const article = document.createElement("article");
    article.className = `task-item${task.completed ? " is-complete" : ""}`;
    article.innerHTML = `
      <button class="task-toggle" data-task-id="${task.id}" aria-label="Toggle task completion"></button>
      <div>
        <span class="task-title">${task.title}</span>
        <span class="task-meta">${task.mission} | ${task.due}</span>
      </div>
      <span class="task-priority">${task.priority}</span>
    `;
    elements.taskList.appendChild(article);
  });

  elements.workspaceNotes.innerHTML = workspace.notes
    .map(
      (note) => `
        <article class="note-card">
          <strong>${note.title}</strong>
          <p class="support-text">${note.body}</p>
        </article>
      `
    )
    .join("");
}

function renderFeed() {
  elements.feedList.innerHTML = state.feed
    .map(
      (item) => `
        <article class="feed-item">
          <span class="feed-time">${item.time}</span>
          <strong>${item.label}</strong>
          <p class="support-text">${item.detail}</p>
        </article>
      `
    )
    .join("");
}

function renderLeaderboard(entries) {
  elements.leaderboardList.innerHTML = entries
    .map(
      (entry, index) => `
        <article class="leaderboard-item">
          <div>
            <strong class="leaderboard-name">#${index + 1} ${entry.name}</strong>
            <div class="task-meta">${entry.role}</div>
          </div>
          <div>
            <strong>${formatNumber(entry.points)} pts</strong>
            <div class="task-meta">${entry.streak}-day streak</div>
          </div>
        </article>
      `
    )
    .join("");
}

function populateCategories(categories) {
  const currentValue = elements.categoryFilter.value || "All";
  const options = ["All", ...categories];
  elements.categoryFilter.innerHTML = options
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
  elements.categoryFilter.value = options.includes(currentValue) ? currentValue : "All";
}

function renderProjects() {
  elements.projectsGrid.innerHTML = "";
  elements.resultsText.textContent = `${state.filteredProjects.length} missions available`;

  if (!state.filteredProjects.some((project) => project.id === state.selectedProjectId)) {
    state.selectedProjectId = state.filteredProjects[0]?.id || null;
  }

  state.filteredProjects.forEach((project) => {
    const fragment = elements.projectCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".mission-card");
    const category = fragment.querySelector(".mission-category");
    const title = fragment.querySelector(".mission-title");
    const tagline = fragment.querySelector(".mission-tagline");
    const stats = fragment.querySelector(".mission-stats");
    const roles = fragment.querySelector(".mission-roles");
    const detailsButton = fragment.querySelector(".details-button");
    const joinButton = fragment.querySelector(".join-button");

    card.dataset.accent = project.accent;
    card.classList.toggle("is-active", project.id === state.selectedProjectId);
    category.textContent = project.category;
    title.textContent = project.title;
    tagline.textContent = project.tagline;
    stats.textContent = `${project.stage} | ${project.difficulty} | ${project.reward} pts | ${project.teamCount} builders`;
    roles.innerHTML = project.openRoles.map((role) => `<span>${role}</span>`).join("");
    joinButton.textContent = project.joined ? "Joined" : "Join Team";

    card.addEventListener("click", (event) => {
      if (!event.target.closest("button")) {
        selectProject(project.id);
      }
    });
    detailsButton.addEventListener("click", () => openProjectDialog(project.id));
    joinButton.addEventListener("click", () => joinProject(project.id));

    elements.projectsGrid.appendChild(fragment);
  });

  renderMissionPreview();
}

function renderChallenges(challenges) {
  elements.challengeList.innerHTML = "";
  challenges.forEach((challenge) => {
    const article = document.createElement("article");
    article.className = "challenge-card";
    article.innerHTML = `
      <p class="label">${challenge.track}</p>
      <h4>${challenge.title}</h4>
      <p class="support-text">${challenge.description}</p>
      <div class="challenge-footer">
        <div>
          <div class="task-meta">${challenge.deadline}</div>
          <div class="task-meta">${formatNumber(challenge.participants)} participants | ${challenge.reward} pts</div>
        </div>
        <button class="button ${challenge.joined ? "button-secondary" : "button-primary"}" data-challenge-id="${challenge.id}">
          ${challenge.joined ? "Joined" : "Join"}
        </button>
      </div>
    `;
    elements.challengeList.appendChild(article);
  });
}

function renderMentors(mentors) {
  elements.mentorList.innerHTML = mentors
    .map(
      (mentor) => `
        <article class="mentor-card">
          <div>
            <h4>${mentor.name}</h4>
            <div class="mentor-meta">
              <span>${mentor.title}</span>
              <span>${mentor.topic}</span>
            </div>
          </div>
          <span class="status-pill">${mentor.availability}</span>
        </article>
      `
    )
    .join("");
}

function renderResources(resources) {
  elements.resourceList.innerHTML = resources
    .map(
      (resource) => `
        <article class="resource-card">
          <p class="label">${resource.type}</p>
          <h4>${resource.title}</h4>
          <p class="support-text">${resource.description}</p>
          <div class="resource-meta">
            <span>${resource.length}</span>
            <span>Open resource</span>
          </div>
        </article>
      `
    )
    .join("");
}

function applyFilters() {
  const search = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;

  state.filteredProjects = state.projects.filter((project) => {
    const haystack = [project.title, project.tagline, project.category, project.openRoles.join(" ")]
      .join(" ")
      .toLowerCase();

    return (!search || haystack.includes(search)) && (category === "All" || project.category === category);
  });

  renderProjects();
}

function renderMissionPreview() {
  const project = state.projects.find((entry) => entry.id === state.selectedProjectId);

  if (!project) {
    elements.missionPreviewTitle.textContent = "Select a mission";
    elements.missionPreviewTagline.textContent = "Pick a project card to inspect the brief.";
    elements.missionPreviewDescription.textContent = "";
    elements.missionPreviewMeta.innerHTML = "";
    elements.missionPreviewRoles.innerHTML = "";
    elements.missionPreviewButton.disabled = true;
    return;
  }

  elements.missionPreviewTitle.textContent = project.title;
  elements.missionPreviewTagline.textContent = project.tagline;
  elements.missionPreviewDescription.textContent = project.description;
  elements.missionPreviewMeta.innerHTML = [
    `<span>${project.category}</span>`,
    `<span>${project.stage}</span>`,
    `<span>${project.difficulty}</span>`,
    `<span>${project.reward} pts</span>`,
    `<span>${project.teamCount} builders</span>`
  ].join("");
  elements.missionPreviewRoles.innerHTML = project.openRoles.map((role) => `<span>${role}</span>`).join("");
  elements.missionPreviewButton.disabled = false;
}

function selectProject(projectId) {
  state.selectedProjectId = projectId;
  renderProjects();
}

function openProjectDialog(projectId) {
  const project = state.projects.find((entry) => entry.id === projectId);
  if (!project) {
    return;
  }

  state.activeProjectId = projectId;
  elements.dialogTitle.textContent = project.title;
  elements.dialogTagline.textContent = project.tagline;
  elements.dialogDescription.textContent = project.description;
  elements.dialogMeta.innerHTML = [
    `<span>${project.category}</span>`,
    `<span>${project.stage}</span>`,
    `<span>${project.difficulty}</span>`,
    `<span>${project.reward} pts</span>`,
    `<span>${project.teamCount} builders</span>`
  ].join("");
  elements.dialogJoinBtn.textContent = project.joined ? "Already Joined" : "Join this mission";
  if (!elements.projectDialog.open) {
    elements.projectDialog.showModal();
  }
}

function renderDashboard() {
  const { overview, profile, workspace, challenges, mentors, resources, checkInsToday } = state.dashboard;
  renderOverview(overview);
  renderProfile(profile, checkInsToday);
  renderWorkspace(workspace);
  renderChallenges(challenges);
  renderMentors(mentors);
  renderResources(resources);
  populateCategories(overview.featuredCategories);
}

async function loadDashboard() {
  state.dashboard = await request("/api/dashboard");
  renderDashboard();
}

async function loadProjects() {
  const data = await request("/api/projects");
  state.projects = data.projects;
  state.filteredProjects = data.projects;
  renderProjects();
}

async function loadFeed() {
  const data = await request("/api/feed");
  state.feed = data.items;
  renderFeed();
}

async function loadLeaderboard(range = "weekly") {
  const data = await request(`/api/leaderboard?range=${range}`);
  renderLeaderboard(data.entries);
}

async function refreshAppSurface({ reloadProjects = false } = {}) {
  await Promise.all([loadDashboard(), loadFeed(), loadLeaderboard(state.leaderboardRange)]);
  if (reloadProjects) {
    await loadProjects();
  }
  applyFilters();
}

async function toggleTask(taskId) {
  try {
    await request(`/api/tasks/${taskId}/toggle`, { method: "POST" });
    await refreshAppSurface();
  } catch (error) {
    console.error(error);
  }
}

async function joinChallenge(challengeId) {
  try {
    await request(`/api/challenges/${challengeId}/join`, { method: "POST" });
    await refreshAppSurface();
  } catch (error) {
    console.error(error);
  }
}

async function launchSprint() {
  setButtonLoading(elements.launchSprintBtn, "Launching...");
  setActionStatus("Launching sprint", "Creating a new sprint room and updating the live feed.");
  try {
    const data = await request("/api/sprint", { method: "POST" });
    await refreshAppSurface();
    setActionStatus("Sprint launched", data.message || "A new sprint room is now live.", "is-success");
  } catch (error) {
    console.error(error);
    setActionStatus("Sprint failed", "The sprint room could not be launched. Try again.", "is-error");
  } finally {
    restoreButton(elements.launchSprintBtn);
  }
}

async function checkIn() {
  setButtonLoading(elements.checkInBtn, "Checking in...");
  setActionStatus("Saving check-in", "Recording today's progress and updating your streak.");
  try {
    const data = await request("/api/checkin", { method: "POST" });
    await refreshAppSurface();
    setActionStatus(
      "Check-in saved",
      `Your streak is now ${data.profile.streak} days and today's check-ins are updated.`,
      "is-success"
    );
  } catch (error) {
    console.error(error);
    setActionStatus("Check-in failed", "The check-in request did not complete. Try again.", "is-error");
  } finally {
    restoreButton(elements.checkInBtn);
  }
}

async function joinProject(projectId) {
  const currentProject = state.projects.find((project) => project.id === projectId);
  if (!currentProject || currentProject.joined) {
    return;
  }

  try {
    await request(`/api/projects/${projectId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "You" })
    });

    await refreshAppSurface({ reloadProjects: true });
    state.selectedProjectId = projectId;
    renderMissionPreview();

    if (state.activeProjectId === projectId) {
      openProjectDialog(projectId);
    }
  } catch (error) {
    console.error(error);
  }
}

function bindEvents() {
  elements.searchInput.addEventListener("input", applyFilters);
  elements.categoryFilter.addEventListener("change", applyFilters);
  elements.launchSprintBtn.addEventListener("click", launchSprint);
  elements.checkInBtn.addEventListener("click", checkIn);
  elements.focusBtn.addEventListener("click", () => {
    elements.searchInput.value = "backend";
    applyFilters();
    document.getElementById("missions").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.closeDialogBtn.addEventListener("click", () => elements.projectDialog.close());
  elements.dialogJoinBtn.addEventListener("click", () => {
    if (state.activeProjectId) {
      joinProject(state.activeProjectId);
    }
  });
  elements.missionPreviewButton.addEventListener("click", () => {
    if (state.selectedProjectId) {
      openProjectDialog(state.selectedProjectId);
    }
  });

  elements.taskList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-id]");
    if (button) {
      toggleTask(button.dataset.taskId);
    }
  });

  elements.challengeList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-challenge-id]");
    if (button) {
      joinChallenge(button.dataset.challengeId);
    }
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", async () => {
      document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.remove("is-active"));
      button.classList.add("is-active");
      state.leaderboardRange = button.dataset.range;
      await loadLeaderboard(state.leaderboardRange);
    });
  });
}

async function init() {
  try {
    bindEvents();
    await Promise.all([loadDashboard(), loadProjects(), loadFeed(), loadLeaderboard()]);
    applyFilters();
  } catch (error) {
    console.error(error);
    elements.headline.textContent = "CollabForge could not load";
    elements.subheadline.textContent =
      "The backend did not respond. Start the local server and refresh the page.";
  }
}

init();
