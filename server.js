const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const state = {
  overview: {
    headline: "Build portfolio-grade work with teams that actually ship.",
    subheadline:
      "CollabForge is a student builder network for finding missions, managing sprint tasks, joining guided challenges, and earning visible proof through shipped work.",
    ctaPrimary: "Browse Missions",
    ctaSecondary: "Start Daily Check-in",
    spotlight: {
      title: "High-signal work is happening tonight",
      body:
        "AI, climate, and civic product teams are opening short sprint windows for frontend, backend, product, and research contributors."
    },
    stats: [
      { label: "Active missions", value: 128 },
      { label: "Builders online", value: 1842 },
      { label: "Sprint completions", value: 9120 },
      { label: "Proof points earned", value: 243500 }
    ]
  },
  sprintLaunches: 42,
  checkInsToday: 186,
  profile: {
    name: "You",
    role: "Full-stack collaborator",
    streak: 12,
    joinedMissions: 2,
    completedTasks: 2,
    proofPoints: 420,
    weeklyGoal: 5
  },
  workspace: {
    focusWindow: "Focus window: 6:00 PM to 9:30 PM",
    summary:
      "You are aligned with two live teams. One backend task is blocking Aurora AI Mentor, and one polish task is ready in PulseBoard.",
    notes: [
      {
        title: "Standup note",
        body: "Aurora moved API review earlier because the mentor room reached capacity."
      },
      {
        title: "Design note",
        body: "PulseBoard needs cleaner empty states before the Friday demo recording."
      },
      {
        title: "Ops note",
        body: "Community moderators want a reusable contributor onboarding checklist."
      }
    ],
    tasks: [
      {
        id: "task-api",
        title: "Finalize mentor feedback endpoint",
        mission: "Aurora AI Mentor",
        due: "Today, 8:30 PM",
        priority: "High",
        completed: false
      },
      {
        id: "task-ui",
        title: "Clean up weekly digest empty state",
        mission: "PulseBoard",
        due: "Tomorrow, 10:00 AM",
        priority: "Medium",
        completed: true
      },
      {
        id: "task-research",
        title: "Summarize campus energy user interviews",
        mission: "Campus Grid",
        due: "Tomorrow, 6:00 PM",
        priority: "Medium",
        completed: false
      },
      {
        id: "task-ops",
        title: "Write contributor onboarding checklist",
        mission: "Civic Loop",
        due: "Friday, 5:00 PM",
        priority: "Low",
        completed: true
      }
    ]
  },
  challenges: [
    {
      id: "build-sprint",
      title: "48 Hour Build Sprint",
      track: "AI + Product",
      description: "Form a small team, ship a real demo, and present a two minute walkthrough.",
      deadline: "Closes in 18 hours",
      reward: 250,
      participants: 142,
      joined: false
    },
    {
      id: "community-stack",
      title: "Campus Impact Stack",
      track: "Civic + Ops",
      description: "Turn one recurring campus problem into a transparent action board and launch plan.",
      deadline: "Starts tomorrow",
      reward: 180,
      participants: 88,
      joined: false
    },
    {
      id: "ux-burst",
      title: "UX Crit Burst",
      track: "Design + Research",
      description: "Trade structured critiques, rebuild one weak flow, and submit before-and-after notes.",
      deadline: "Three seats left",
      reward: 120,
      participants: 64,
      joined: false
    }
  ],
  mentors: [
    {
      name: "Rhea Menon",
      title: "Product and GTM",
      availability: "Open in 1 hour",
      topic: "Pitch clarity and fast user feedback loops"
    },
    {
      name: "Kabir Shah",
      title: "Backend Systems",
      availability: "Tomorrow at 7:30 PM",
      topic: "APIs, observability, and production handoff"
    },
    {
      name: "Tara Joseph",
      title: "Design Lead",
      availability: "Today at 9:15 PM",
      topic: "Interaction polish and high-contrast UI reviews"
    }
  ],
  resources: [
    {
      id: "brief-template",
      title: "Sprint Brief Template",
      type: "Playbook",
      length: "6 min read",
      description: "A concise format for turning messy ideas into build-ready mission briefs."
    },
    {
      id: "ship-checklist",
      title: "Ship Readiness Checklist",
      type: "Checklist",
      length: "12 items",
      description: "A launch checklist for demos, test coverage, docs, and contributor handoff."
    },
    {
      id: "feedback-script",
      title: "Mentor Feedback Script",
      type: "Guide",
      length: "4 min read",
      description: "Questions that produce useful critique instead of vague encouragement."
    },
    {
      id: "proof-kit",
      title: "Proof of Work Kit",
      type: "Template Pack",
      length: "3 templates",
      description: "Turn commits, designs, and decisions into visible contribution proof."
    }
  ],
  projects: [
    {
      id: "aurora-ai",
      title: "Aurora AI Mentor",
      category: "AI Systems",
      tagline: "Create a mentor that reviews student work and suggests next actions.",
      reward: 85,
      difficulty: "Advanced",
      stage: "Building",
      teamCount: 6,
      joined: false,
      openRoles: ["Frontend", "Prompt Design", "Backend"],
      accent: "violet",
      description:
        "The team is shipping a mentor workspace with rubric scoring, voice feedback, and a sprint recap stream for student projects."
    },
    {
      id: "campus-grid",
      title: "Campus Grid",
      category: "Climate Tech",
      tagline: "Map energy usage and turn conservation into campus-level challenges.",
      reward: 60,
      difficulty: "Intermediate",
      stage: "Research",
      teamCount: 4,
      joined: false,
      openRoles: ["Data Viz", "Research", "UX"],
      accent: "emerald",
      description:
        "Students are building dashboards, challenges, and community incentives to cut waste in labs, hostels, and classrooms."
    },
    {
      id: "pulse-board",
      title: "PulseBoard",
      category: "Creator Tools",
      tagline: "Convert messy student updates into one sharp weekly team brief.",
      reward: 45,
      difficulty: "Beginner Friendly",
      stage: "Prototype",
      teamCount: 5,
      joined: false,
      openRoles: ["Copy", "Product", "Frontend"],
      accent: "orange",
      description:
        "This mission focuses on async collaboration, smart summaries, and visible contribution proof for cross-campus teams."
    },
    {
      id: "relay-xr",
      title: "Relay XR Lab",
      category: "Spatial Computing",
      tagline: "Prototype immersive simulations for engineering and healthcare practice.",
      reward: 95,
      difficulty: "Advanced",
      stage: "Testing",
      teamCount: 8,
      joined: false,
      openRoles: ["Unity", "3D", "Interaction"],
      accent: "cyan",
      description:
        "Teams are testing quick scenario-based simulations with telemetry, task replay, and mentor review checkpoints."
    },
    {
      id: "civic-loop",
      title: "Civic Loop",
      category: "Public Impact",
      tagline: "Turn local student issues into transparent, trackable action boards.",
      reward: 55,
      difficulty: "Intermediate",
      stage: "Shipping",
      teamCount: 7,
      joined: false,
      openRoles: ["Backend", "Community", "Ops"],
      accent: "rose",
      description:
        "The group is building intake flows, public status tracking, and lightweight governance tools for campus communities."
    },
    {
      id: "finlit-os",
      title: "FinLit OS",
      category: "Fintech",
      tagline: "Help first-time earners plan money, save consistently, and learn by doing.",
      reward: 70,
      difficulty: "Intermediate",
      stage: "Designing",
      teamCount: 3,
      joined: false,
      openRoles: ["UI", "Content", "Data"],
      accent: "amber",
      description:
        "Students are designing habit loops, scenario simulators, and simple budget tools for part-time workers and founders."
    }
  ],
  leaderboard: {
    weekly: [
      { name: "Aarav S.", role: "Systems Builder", points: 3840, streak: 9 },
      { name: "Mira J.", role: "Design Lead", points: 3560, streak: 7 },
      { name: "Ishan K.", role: "Backend Engineer", points: 3190, streak: 8 },
      { name: "Nila P.", role: "Research Ops", points: 2980, streak: 6 }
    ],
    monthly: [
      { name: "Mira J.", role: "Design Lead", points: 13240, streak: 24 },
      { name: "Aarav S.", role: "Systems Builder", points: 12780, streak: 21 },
      { name: "Sofia R.", role: "Community Lead", points: 11860, streak: 19 },
      { name: "Ishan K.", role: "Backend Engineer", points: 11420, streak: 20 }
    ]
  },
  feed: [
    {
      time: "2m ago",
      label: "Sprint room live",
      detail: "Aurora AI Mentor just opened a backend pairing session for API feedback."
    },
    {
      time: "14m ago",
      label: "New proof unlocked",
      detail: "Campus Grid shipped a working prototype and gained 180 proof points."
    },
    {
      time: "28m ago",
      label: "Skill match",
      detail: "Three new design students matched with PulseBoard for weekly brief polish."
    },
    {
      time: "1h ago",
      label: "Hot streak",
      detail: "Relay XR Lab has closed 11 tasks in the last 24 hours."
    }
  ]
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function getTaskProgress() {
  const total = state.workspace.tasks.length;
  const completed = state.workspace.tasks.filter((task) => task.completed).length;
  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
}

function getOverviewPayload() {
  return {
    ...state.overview,
    sprintLaunches: state.sprintLaunches,
    featuredCategories: [...new Set(state.projects.map((project) => project.category))],
    openRoles: state.projects.flatMap((project) => project.openRoles).slice(0, 8)
  };
}

function getDashboardPayload() {
  return {
    overview: getOverviewPayload(),
    profile: state.profile,
    workspace: {
      ...state.workspace,
      progress: getTaskProgress()
    },
    challenges: state.challenges,
    mentors: state.mentors,
    resources: state.resources,
    checkInsToday: state.checkInsToday
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch {
    return {};
  }
}

function filterProjects(search, category) {
  return state.projects.filter((project) => {
    const matchesSearch =
      !search ||
      [project.title, project.tagline, project.category, project.openRoles.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(search);
    const matchesCategory = !category || category === "All" || project.category === category;
    return matchesSearch && matchesCategory;
  });
}

function pushFeed(label, detail) {
  state.feed.unshift({
    time: "just now",
    label,
    detail
  });
  state.feed = state.feed.slice(0, 8);
}

async function serveStatic(reqPath, res) {
  const normalizedPath = reqPath === "/" ? "/index.html" : reqPath;
  const filePath = path.join(PUBLIC_DIR, path.normalize(normalizedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  } catch {
    sendText(res, 404, "Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (req.method === "GET" && pathname === "/api/dashboard") {
    sendJson(res, 200, getDashboardPayload());
    return;
  }

  if (req.method === "GET" && pathname === "/api/overview") {
    sendJson(res, 200, getOverviewPayload());
    return;
  }

  if (req.method === "GET" && pathname === "/api/projects") {
    const search = requestUrl.searchParams.get("search")?.trim().toLowerCase() || "";
    const category = requestUrl.searchParams.get("category")?.trim() || "";
    sendJson(res, 200, {
      projects: filterProjects(search, category),
      total: state.projects.length
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/leaderboard") {
    const range = requestUrl.searchParams.get("range") === "monthly" ? "monthly" : "weekly";
    sendJson(res, 200, {
      range,
      entries: state.leaderboard[range]
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/feed") {
    sendJson(res, 200, {
      items: state.feed,
      liveCount: state.feed.length + state.sprintLaunches + state.checkInsToday
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/checkin") {
    state.checkInsToday += 1;
    state.profile.streak += 1;
    state.profile.proofPoints += 10;
    pushFeed("Daily check-in saved", `${state.profile.name} checked in and extended a ${state.profile.streak}-day streak.`);
    sendJson(res, 200, {
      ok: true,
      checkInsToday: state.checkInsToday,
      profile: state.profile
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/sprint") {
    state.sprintLaunches += 1;
    state.profile.proofPoints += 15;
    pushFeed(
      "Sprint launched",
      `A new cross-skill sprint room opened. Total launches today: ${state.sprintLaunches}.`
    );
    sendJson(res, 200, {
      ok: true,
      sprintLaunches: state.sprintLaunches,
      profile: state.profile,
      message: "Sprint room launched. A new update has been pushed to the live feed."
    });
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/tasks/") && pathname.endsWith("/toggle")) {
    const taskId = pathname.split("/")[3];
    const task = state.workspace.tasks.find((entry) => entry.id === taskId);

    if (!task) {
      sendJson(res, 404, { error: "Task not found" });
      return;
    }

    task.completed = !task.completed;
    if (task.completed) {
      state.profile.completedTasks += 1;
      state.profile.proofPoints += 25;
      pushFeed("Task completed", `${task.title} was marked complete in ${task.mission}.`);
    } else {
      state.profile.completedTasks = Math.max(0, state.profile.completedTasks - 1);
      state.profile.proofPoints = Math.max(0, state.profile.proofPoints - 25);
      pushFeed("Task reopened", `${task.title} was moved back into the active queue.`);
    }

    sendJson(res, 200, {
      ok: true,
      task,
      profile: state.profile,
      progress: getTaskProgress()
    });
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/challenges/") && pathname.endsWith("/join")) {
    const challengeId = pathname.split("/")[3];
    const challenge = state.challenges.find((entry) => entry.id === challengeId);

    if (!challenge) {
      sendJson(res, 404, { error: "Challenge not found" });
      return;
    }

    if (!challenge.joined) {
      challenge.joined = true;
      challenge.participants += 1;
      state.profile.proofPoints += 20;
      pushFeed("Challenge joined", `${state.profile.name} joined ${challenge.title}.`);
    }

    sendJson(res, 200, {
      ok: true,
      challenge,
      profile: state.profile
    });
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/projects/") && pathname.endsWith("/join")) {
    const projectId = pathname.split("/")[3];
    const project = state.projects.find((entry) => entry.id === projectId);

    if (!project) {
      sendJson(res, 404, { error: "Project not found" });
      return;
    }

    const payload = await readBody(req);
    if (!project.joined) {
      project.joined = true;
      project.teamCount += 1;
      state.profile.joinedMissions += 1;
      state.profile.proofPoints += 30;
      pushFeed(
        "New teammate joined",
        `${payload.name || "A builder"} joined ${project.title} for ${project.openRoles[0]} support.`
      );
    }

    sendJson(res, 200, {
      ok: true,
      project,
      profile: state.profile,
      message: `You joined ${project.title}. The squad has been updated.`
    });
    return;
  }

  await serveStatic(pathname, res);
});

server.listen(PORT, () => {
  console.log(`CollabForge listening on http://localhost:${PORT}`);
});
