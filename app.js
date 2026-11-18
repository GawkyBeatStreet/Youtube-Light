import {
  LEARNING_GOALS,
  INITIAL_CHANNELS,
  INITIAL_VIDEOS,
  calmTitleTransform
} from './data.js';

const STORAGE_KEY = 'focustube_state_v1';
const WEEKDAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MON_TO_SUN_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const DEPRECATED_GEMINI_MODEL_MAP = {
  'gemini-2.5-flash': 'gemini-3.5-flash-lite',
  'gemini-2.5-pro': 'gemini-3.8-flash'
};

function normalizeGeminiModel(model) {
  const m = String(model || '').trim();
  if (!m) return DEFAULT_GEMINI_MODEL;
  return DEPRECATED_GEMINI_MODEL_MAP[m] || m;
}

// --- HILFSFUNKTIONEN ---
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCurrentWeekDates() {
  const now = new Date();
  const day = now.getDay(); // 0=So .. 6=Sa
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday);

  return MON_TO_SUN_ORDER.map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return {
      key: getDateKey(d),
      label: WEEKDAY_NAMES[d.getDay()],
      isToday: getDateKey(d) === getDateKey(now),
      isFuture: d > now && getDateKey(d) !== getDateKey(now)
    };
  });
}

const LEGACY_SEEDED_DAY_PAIRS = new Set([
  '2520:720',
  '3300:1080',
  '2280:600',
  '3840:900',
  '2940:1140',
  '1920:840'
]);

function prepareDailyLogs(existingLogs = {}, alreadyCleaned = false) {
  const logs = { ...existingLogs };
  const today = getDateKey();

  if (!alreadyCleaned) {
    Object.keys(logs).forEach((dateKey) => {
      if (dateKey === today) return;
      const entry = logs[dateKey];
      if (!entry) return;
      const sig = `${entry.learningSec}:${entry.entertainmentSec}`;
      if (LEGACY_SEEDED_DAY_PAIRS.has(sig)) {
        delete logs[dateKey];
      }
    });
  }

  if (!logs[today]) {
    logs[today] = { learningSec: 0, entertainmentSec: 0 };
  }
  return logs;
}

function parseIsoDuration(iso = '') {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

function extractChaptersFromDescription(desc = '') {
  const lines = desc.split('\n');
  const chapters = [];
  const regex = /(?:^|\s)((?:\d{1,2}:)?\d{1,2}:\d{2})\s+[-–|]?\s*(.+)$/;
  for (const line of lines) {
    const m = line.trim().match(regex);
    if (m) {
      const parts = m[1].split(':').map((n) => parseInt(n, 10));
      let timeSec = 0;
      if (parts.length === 3) timeSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else timeSec = parts[0] * 60 + parts[1];
      const label = m[2].trim().slice(0, 80);
      if (label) chapters.push({ timeSec, label });
    }
  }
  return chapters.slice(0, 12);
}

// --- STATE ---
function loadState() {
  const fallback = {
    mode: 'learning',
    activeTab: 'algorithm',
    calmTitles: true,
    calmThumbnails: true,
    floodBrake: true,
    filterAiSlop: true,
    hideWatched: true,
    hideWatchedDefaultV2: true,
    densityPreference: 'dense',
    activeGoals: LEARNING_GOALS.map((g) => g.id),
    customGoals: [],
    channels: INITIAL_CHANNELS.map((c) => ({ ...c })),
    videos: INITIAL_VIDEOS.map((v) => ({ ...v })),
    watchedIds: [],
    playbackProgress: {},
    blockedShorts: [],
    notesByVideo: {},
    aiSummaries: {},
    discoveryResults: [],
    discoveryCache: {},
    blockedDiscoveryChannels: [],
    budgets: {
      learningGoalMin: 45,
      entertainmentLimitMin: 30
    },
    entertainmentLimit30V1: true,
    entertainmentGrace: null,
    realStatsV1: true,
    lastFeedSyncAt: 0,
    dailyLogs: prepareDailyLogs({}, true),
    obsidianConfig: {
      vaultName: '',
      folder: 'YouTube'
    },
    playerPrefs: {
      captionsEnabled: false,
      quality: 'default'
    },
    apiConfig: {
      clientId: '',
      apiKey: '',
      geminiKey: '',
      geminiModel: DEFAULT_GEMINI_MODEL
    }
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const mergedApiConfig = { ...fallback.apiConfig, ...(parsed.apiConfig || {}) };
    mergedApiConfig.geminiModel = normalizeGeminiModel(mergedApiConfig.geminiModel);
    const mergedBudgets = { ...fallback.budgets, ...(parsed.budgets || {}) };
    if (!parsed.entertainmentLimit30V1 && mergedBudgets.entertainmentLimitMin === 20) {
      mergedBudgets.entertainmentLimitMin = 30;
    }
    return {
      ...fallback,
      ...parsed,
      hideWatched: parsed.hideWatchedDefaultV2 ? parsed.hideWatched : true,
      hideWatchedDefaultV2: true,
      customGoals: Array.isArray(parsed.customGoals) ? parsed.customGoals : [],
      playbackProgress:
        parsed.playbackProgress && typeof parsed.playbackProgress === 'object' ? parsed.playbackProgress : {},
      blockedShorts: Array.isArray(parsed.blockedShorts) ? parsed.blockedShorts : [],
      budgets: mergedBudgets,
      entertainmentLimit30V1: true,
      entertainmentGrace:
        parsed.entertainmentGrace && parsed.entertainmentGrace.dateKey === getDateKey() ? parsed.entertainmentGrace : null,
      obsidianConfig: { ...fallback.obsidianConfig, ...(parsed.obsidianConfig || {}) },
      playerPrefs: { ...fallback.playerPrefs, ...(parsed.playerPrefs || {}) },
      apiConfig: mergedApiConfig,
      realStatsV1: true,
      dailyLogs: prepareDailyLogs(parsed.dailyLogs || {}, Boolean(parsed.realStatsV1))
    };
  } catch {
    return fallback;
  }
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignorieren, falls Storage im Privatmodus voll ist
  }
}

// --- RUNTIME PLAYER & TIMER VARIABLEN ---
let ytPlayer = null;
let ytApiReady = false;
let pendingVideoToLoad = null;
let pendingVideoStartSec = 0;
let activeVideoId = null;
let isVideoPlaying = false;
let manualTimerActive = false;
let playbackRate = 1;
let scrubberPollTimer = null;
let lastVideoDuration = 0;
let lastProgressSavedAt = 0;
let endScreenTriggered = false;
let controlsHideTimer = null;
let isControlsHovered = false;
let oauthAccessToken = null;
let tokenClient = null;
let obsidianDirHandle = null;

// --- DOM REFERENZEN ---
const els = {
  body: document.body,
  btnBrandHome: document.getElementById('btn-brand-home'),
  globalSearchForm: document.getElementById('global-search-form'),
  globalSearchInput: document.getElementById('global-search-input'),
  btnModeLearning: document.getElementById('btn-mode-learning'),
  btnModeEntertainment: document.getElementById('btn-mode-entertainment'),
  liveTimerPill: document.getElementById('live-timer-pill'),
  timerPillText: document.getElementById('timer-pill-text'),
  timerStateBadge: document.getElementById('timer-state-badge'),
  navTabs: document.querySelectorAll('.nav-tab'),
  tabPanels: document.querySelectorAll('.tab-panel'),
  toggleCalmTitles: document.getElementById('toggle-calm-titles'),
  toggleCalmThumbs: document.getElementById('toggle-calm-thumbs'),
  toggleFloodBrake: document.getElementById('toggle-flood-brake'),
  toggleFilterAi: document.getElementById('toggle-filter-ai'),
  toggleHideWatched: document.getElementById('toggle-hide-watched'),
  learningGoalsChips: document.getElementById('learning-goals-chips'),
  btnToggleAddGoal: document.getElementById('btn-toggle-add-goal'),
  btnResetGoals: document.getElementById('btn-reset-goals'),
  formAddGoal: document.getElementById('form-add-goal'),
  inputNewGoal: document.getElementById('input-new-goal'),
  algoSearchInput: document.getElementById('algo-search-input'),
  algoDensityMode: document.getElementById('algo-density-mode'),
  algoDurationFilter: document.getElementById('algo-duration-filter'),
  btnRefreshAlgo: document.getElementById('btn-refresh-algo'),
  continueWatchingSection: document.getElementById('continue-watching-section'),
  continueWatchingGrid: document.getElementById('continue-watching-grid'),
  algorithmVideoGrid: document.getElementById('algorithm-video-grid'),
  entertainmentLockNotice: document.getElementById('entertainment-lock-notice'),
  // Wissens-Entdecker
  discoverQueryInput: document.getElementById('discover-query-input'),
  discoverLengthPref: document.getElementById('discover-length-pref'),
  discoverLangPref: document.getElementById('discover-lang-pref'),
  btnRunDiscovery: document.getElementById('btn-run-discovery'),
  discoverGoalPills: document.getElementById('discover-goal-pills'),
  discoverDirectUrl: document.getElementById('discover-direct-url'),
  btnOpenDirectUrl: document.getElementById('btn-open-direct-url'),
  discoverStatusBox: document.getElementById('discover-status-box'),
  discoverResultsGrid: document.getElementById('discover-results-grid'),
  statDiscoverCount: document.getElementById('stat-discover-count'),
  statDiscoverBlocked: document.getElementById('stat-discover-blocked'),
  feedLockNotice: document.getElementById('feed-lock-notice'),
  feedVideoGrid: document.getElementById('feed-video-grid'),
  feedChannelFilter: document.getElementById('feed-channel-filter'),
  btnRefreshFeed: document.getElementById('btn-refresh-feed'),
  feedSyncMeta: document.getElementById('feed-sync-meta'),
  feedModeDescription: document.getElementById('feed-mode-description'),
  // Player Workspace
  playerWorkspace: document.getElementById('player-workspace'),
  playerStage: document.getElementById('player-stage'),
  customControls: document.querySelector('.custom-controls'),
  playerShield: document.getElementById('player-shield'),
  focusOverlay: document.getElementById('focus-overlay'),
  overlayBadge: document.getElementById('overlay-badge'),
  overlayHeading: document.getElementById('overlay-heading'),
  overlaySubtext: document.getElementById('overlay-subtext'),
  overlayNoteBox: document.getElementById('overlay-note-box'),
  overlayQuickNote: document.getElementById('overlay-quick-note'),
  btnOverlaySaveNote: document.getElementById('btn-overlay-save-note'),
  btnOverlayResume: document.getElementById('btn-overlay-resume'),
  btnOverlayBack: document.getElementById('btn-overlay-back'),
  playerCategoryBadge: document.getElementById('player-category-badge'),
  playerVideoTitle: document.getElementById('player-video-title'),
  playerChannelName: document.getElementById('player-channel-name'),
  playerTopic: document.getElementById('player-topic'),
  playerDurationLabel: document.getElementById('player-duration-label'),
  btnToggleWatched: document.getElementById('btn-toggle-watched'),
  btnClosePlayer: document.getElementById('btn-close-player'),
  ctrlCurrentTime: document.getElementById('ctrl-current-time'),
  ctrlTotalTime: document.getElementById('ctrl-total-time'),
  ctrlScrubber: document.getElementById('ctrl-scrubber'),
  ctrlPlayPause: document.getElementById('ctrl-play-pause'),
  ctrlBack15: document.getElementById('ctrl-back-15'),
  ctrlFwd15: document.getElementById('ctrl-fwd-15'),
  ctrlMute: document.getElementById('ctrl-mute'),
  ctrlCaptions: document.getElementById('ctrl-captions'),
  ctrlQuality: document.getElementById('ctrl-quality'),
  ctrlFullscreen: document.getElementById('ctrl-fullscreen'),
  speedButtons: document.querySelectorAll('.speed-btn'),
  playerChaptersList: document.getElementById('player-chapters-list'),
  companionNoteInput: document.getElementById('companion-note-input'),
  btnSaveCompanionNote: document.getElementById('btn-save-companion-note'),
  noteTimestampPreview: document.getElementById('note-timestamp-preview'),
  playerNotesList: document.getElementById('player-notes-list'),
  btnPlayerObsidian: document.getElementById('btn-player-obsidian'),
  btnPlayerObsidianFile: document.getElementById('btn-player-obsidian-file'),
  btnPlayerCopyMd: document.getElementById('btn-player-copy-md'),
  playerObsidianStatus: document.getElementById('player-obsidian-status'),
  aiTranscriptInput: document.getElementById('ai-transcript-input'),
  btnAiSummarize: document.getElementById('btn-ai-summarize'),
  aiSummaryOutput: document.getElementById('ai-summary-output'),
  // Dashboard
  btnDashTimerToggle: document.getElementById('btn-dash-timer-toggle'),
  kpiFocusRatio: document.getElementById('kpi-focus-ratio'),
  kpiWeekLearning: document.getElementById('kpi-week-learning'),
  kpiTodayLearning: document.getElementById('kpi-today-learning'),
  kpiWeekEntertainment: document.getElementById('kpi-week-entertainment'),
  kpiTodayEntertainment: document.getElementById('kpi-today-entertainment'),
  kpiBlockedCount: document.getElementById('kpi-blocked-count'),
  weeklyChart: document.getElementById('weekly-chart'),
  btnResetStats: document.getElementById('btn-reset-stats'),
  inputLearningGoal: document.getElementById('input-learning-goal'),
  inputEntertainmentLimit: document.getElementById('input-entertainment-limit'),
  btnSaveBudgets: document.getElementById('btn-save-budgets'),
  blockedShortsList: document.getElementById('blocked-shorts-list'),
  // Channels
  btnSyncSubsNow: document.getElementById('btn-sync-subs-now'),
  channelSummaryBadges: document.getElementById('channel-summary-badges'),
  formAddChannel: document.getElementById('form-add-channel'),
  newChannelName: document.getElementById('new-channel-name'),
  newChannelHandle: document.getElementById('new-channel-handle'),
  newChannelCategory: document.getElementById('new-channel-category'),
  newChannelTopic: document.getElementById('new-channel-topic'),
  goalTopicsDatalist: document.getElementById('goal-topics-datalist'),
  channelManagerList: document.getElementById('channel-manager-list'),
  // Notes
  notesCountBadge: document.getElementById('notes-count-badge'),
  allNotesContainer: document.getElementById('all-notes-container'),
  btnExportNotes: document.getElementById('btn-export-notes'),
  btnExportObsidianAll: document.getElementById('btn-export-obsidian-all'),
  // Sync Modal
  btnOpenSync: document.getElementById('btn-open-sync'),
  btnCloseSync: document.getElementById('btn-close-sync'),
  syncModal: document.getElementById('sync-modal'),
  syncStatusDot: document.getElementById('sync-status-dot'),
  syncStatusText: document.getElementById('sync-status-text'),
  inputOauthClientId: document.getElementById('input-oauth-client-id'),
  inputYtApiKey: document.getElementById('input-yt-api-key'),
  inputGeminiApiKey: document.getElementById('input-gemini-api-key'),
  selectGeminiModel: document.getElementById('select-gemini-model'),
  inputObsidianVault: document.getElementById('input-obsidian-vault'),
  inputObsidianFolder: document.getElementById('input-obsidian-folder'),
  btnPickObsidianDir: document.getElementById('btn-pick-obsidian-dir'),
  obsidianDirStatus: document.getElementById('obsidian-dir-status'),
  btnSaveApiConfig: document.getElementById('btn-save-api-config'),
  btnGoogleLogin: document.getElementById('btn-google-login'),
  btnFetchUuUploads: document.getElementById('btn-fetch-uu-uploads')
};

// --- KANAL- UND VIDEODATEN-AUFBEREITUNG ---
function getChannelCategory(handle) {
  const ch = state.channels.find((c) => c.handle.toLowerCase() === String(handle).toLowerCase());
  return ch ? ch.category : 'learning';
}

function getChannelQualityBase(handle) {
  const ch = state.channels.find((c) => c.handle.toLowerCase() === String(handle).toLowerCase());
  return ch ? ch.qualityBase || 80 : 75;
}

function getDisplayTitle(video) {
  if (state.calmTitles) {
    return video.calmTitle || calmTitleTransform(video.originalTitle);
  }
  return video.originalTitle || video.calmTitle;
}

function findVideoById(videoId) {
  return (
    state.videos.find((v) => v.id === videoId) ||
    (state.discoveryResults || []).find((v) => v.id === videoId) ||
    null
  );
}

function hasClickbaitSignals(title = '') {
  const exclamations = (title.match(/[!？?🔥⚠️😱🤯🚀💰]/g) || []).length;
  const upperWords = (title.match(/\b[A-ZÄÖÜ]{4,}\b/g) || []).length;
  return exclamations >= 2 || upperWords >= 2;
}

const AI_EXPLICIT_PATTERNS = [
  /\belevenlabs\b/i,
  /\binvideo\b/i,
  /\bheygen\b/i,
  /\bsynthesia\b/i,
  /\bnotebooklm\b/i,
  /\bplay\.ht\b/i,
  /\bmurf\.ai\b/i,
  /\bpictory\b/i,
  /\bfliki\b/i,
  /\btext[- ]to[- ]speech\b/i,
  /\btts voice\b/i,
  /\bai[- ]voice\b/i,
  /\bai narrator\b/i,
  /\bai[- ]generated\b/i,
  /\bgenerated (?:by|with) ai\b/i,
  /\bmade with ai\b/i,
  /\bcreated with ai\b/i,
  /\bsynthetic voice\b/i,
  /\bfaceless (?:channel|ai|automation)\b/i,
  /\bki[- ]stimme\b/i,
  /\bki[- ]sprecher\b/i,
  /\bki[- ]generiert\b/i,
  /\bmit ki erstellt\b/i,
  /\bautomatisch vertont\b/i,
  /\bsynthetische stimme\b/i
];

const AI_SOFT_PATTERNS = [
  /everything you need to know in \d+ min/i,
  /alles was du wissen musst in \d+ min/i,
  /\bcomplete history of .+ in \d+ minutes\b/i,
  /\bai summary\b/i,
  /\bki[- ]zusammenfassung\b/i
];

function detectAiVoiceSignals(video) {
  const tags = Array.isArray(video?.tags) ? video.tags.join(' ') : '';
  const text = `${video?.originalTitle || ''} ${video?.channelName || ''} ${video?.description || ''} ${tags}`;
  const isExplicitAi = AI_EXPLICIT_PATTERNS.some((rx) => rx.test(text));
  const softHits = AI_SOFT_PATTERNS.filter((rx) => rx.test(text)).length;
  return {
    isExplicitAi,
    suspicionScore: (isExplicitAi ? 45 : 0) + softHits * 18
  };
}

function computeDensityBonus(durationSec, pref = state.densityPreference || 'dense') {
  if (!durationSec || durationSec < 60) return 0;
  if (pref === 'dense') {
    if (durationSec >= 360 && durationSec <= 1320) return 22; // 6–22 Min.: maximale Dichte
    if (durationSec > 1320 && durationSec <= 1920) return 12; // 22–32 Min.
    if (durationSec > 1920 && durationSec <= 2700) return 4; // 32–45 Min.
    if (durationSec > 2700) return -6; // Überlänge leicht abwerten
    return 6;
  }
  if (pref === 'balanced') {
    if (durationSec >= 600 && durationSec <= 2100) return 20;
    if (durationSec >= 360 && durationSec <= 2880) return 11;
    return 3;
  }
  // deepdive
  if (durationSec >= 1500 && durationSec <= 5400) return 20;
  if (durationSec >= 720) return 12;
  return 4;
}

function getAllGoals() {
  return [...LEARNING_GOALS.map((g) => ({ ...g, isCustom: false })), ...(state.customGoals || []).map((g) => ({ ...g, isCustom: true }))];
}

function addCustomGoal(rawLabel) {
  const label = String(rawLabel || '').trim().slice(0, 50);
  if (!label) return false;
  const all = getAllGoals();
  const existing = all.find(
    (g) => g.id.toLowerCase() === label.toLowerCase() || g.label.toLowerCase() === label.toLowerCase()
  );

  if (existing) {
    if (!state.activeGoals.includes(existing.id)) {
      state.activeGoals.push(existing.id);
      saveState();
    }
    return true;
  }

  const newGoal = {
    id: label,
    label,
    description: `Eigenes Interesse: ${label}`,
    isCustom: true
  };
  state.customGoals = [...(state.customGoals || []), newGoal];
  state.activeGoals = [...(state.activeGoals || []), newGoal.id];
  saveState();
  return true;
}

function removeCustomGoal(goalId) {
  state.customGoals = (state.customGoals || []).filter((g) => g.id !== goalId);
  state.activeGoals = (state.activeGoals || []).filter((id) => id !== goalId);
  saveState();
}

function recordBlockedShort({ id, title, channelName, durationSec }) {
  if (!id) return;
  const current = Array.isArray(state.blockedShorts) ? state.blockedShorts : [];
  if (current.some((item) => item.id === id)) return;
  state.blockedShorts = [
    {
      id,
      title: title || 'YouTube Short',
      channelName: channelName || 'Unbekannter Kanal',
      durationSec: Math.max(1, Math.round(durationSec || 0)),
      blockedAt: new Date().toLocaleDateString('de-DE')
    },
    ...current
  ].slice(0, 50);
  saveState();
}

function matchesActiveGoals(video) {
  const active = state.activeGoals || [];
  if (active.length === 0) return false;
  if (active.includes(video.topic)) return true;

  const haystack = `${video.originalTitle || ''} ${video.calmTitle || ''} ${video.topic || ''} ${video.channelName || ''}`.toLowerCase();
  const goalMap = new Map(getAllGoals().map((g) => [g.id, g.label]));

  return active.some((goalId) => {
    const label = goalMap.get(goalId) || goalId;
    const tokens = String(label)
      .toLowerCase()
      .split(/[\s,&/\-–]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3);
    return tokens.some((tok) => haystack.includes(tok));
  });
}

function computeFocusScore(video) {
  const base = getChannelQualityBase(video.channelHandle);
  const chapters = Array.isArray(video.chapters) ? video.chapters : [];
  const hasChapters = chapters.length >= 2;
  const goalMatch = matchesActiveGoals(video);

  if (state.mode === 'entertainment') {
    const chapterBonus = hasChapters ? 10 : 0;
    return Math.min(99, Math.round(base * 0.8 + chapterBonus));
  }

  const goalBonus = goalMatch ? 22 : 0;
  const densityBonus = computeDensityBonus(video.durationSec);
  const chaptersPer10Min = video.durationSec > 0 ? chapters.length / Math.max(1, video.durationSec / 600) : 0;
  const structureBonus = chaptersPer10Min >= 2.2 ? 18 : hasChapters ? 11 : 0;
  const clickbaitPenalty = hasClickbaitSignals(video.originalTitle || '') ? -10 : 0;
  const aiPenalty = state.filterAiSlop ? -Math.min(45, detectAiVoiceSignals(video).suspicionScore) : 0;

  let raw = Math.round(base * 0.42 + goalBonus + densityBonus + structureBonus + clickbaitPenalty + aiPenalty);
  if (typeof video.aiDensityScore === 'number') {
    raw = Math.round(raw * 0.55 + video.aiDensityScore * 0.45);
  }
  return Math.max(10, Math.min(99, raw));
}

function getFilteredVideos({ applyFloodBrake = true, sortByScore = true, channelFilter = 'all' } = {}) {
  const query = ((els.globalSearchInput?.value || els.algoSearchInput?.value) || '').trim().toLowerCase();
  const durationFilter = els.algoDurationFilter?.value || 'all';

  let list = state.videos
    .map((v) => {
      const channelCat = getChannelCategory(v.channelHandle);
      return {
        ...v,
        effectiveCategory: channelCat,
        focusScore: computeFocusScore(v)
      };
    })
    .filter((v) => {
      if (v.effectiveCategory === 'muted') return false;
      if (v.effectiveCategory !== state.mode) return false;
      if (v.durationSec > 0 && v.durationSec < 60) return false; // Shorts hart blocken
      if (state.hideWatched && state.watchedIds.includes(v.id)) return false;
      if (channelFilter !== 'all' && v.channelHandle !== channelFilter) return false;

      if (sortByScore && query) {
        const haystack = `${v.calmTitle} ${v.originalTitle} ${v.channelName} ${v.topic}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (sortByScore && durationFilter !== 'all') {
        if (durationFilter === 'compact' && (v.durationSec < 360 || v.durationSec > 22 * 60)) return false;
        if (durationFilter === 'medium' && (v.durationSec <= 22 * 60 || v.durationSec > 38 * 60)) return false;
        if (durationFilter === 'long' && v.durationSec <= 38 * 60) return false;
      }

      return true;
    });

  if (sortByScore) {
    list.sort((a, b) => b.focusScore - a.focusScore);
  } else {
    list.sort((a, b) => {
      const tA = a.publishedAt ? Date.parse(a.publishedAt) || 0 : 0;
      const tB = b.publishedAt ? Date.parse(b.publishedAt) || 0 : 0;
      if (tA !== tB) return tB - tA;
      return (a.publishedOrder ?? 999) - (b.publishedOrder ?? 999);
    });
  }

  if (applyFloodBrake && state.floodBrake && channelFilter === 'all') {
    const counts = {};
    list = list.filter((v) => {
      const key = v.channelHandle.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
      return counts[key] <= 2;
    });
  }

  return list;
}

function getGraceVideoIdForToday() {
  const today = getDateKey();
  if (state.entertainmentGrace && state.entertainmentGrace.dateKey === today) {
    return state.entertainmentGrace.videoId || null;
  }
  return null;
}

function isEntertainmentUsedUpFor(candidateVideoId = null) {
  const today = getDateKey();
  const used = state.dailyLogs[today]?.entertainmentSec || 0;
  const limit = state.budgets.entertainmentLimitMin * 60;
  if (used < limit) return false;
  if (candidateVideoId && candidateVideoId === getGraceVideoIdForToday()) return false;
  return true;
}

function isEntertainmentLocked() {
  return state.mode === 'entertainment' && isEntertainmentUsedUpFor(activeVideoId);
}

// --- LIVE TIMER & BUDGET LOGIK ---
function updateTimerUI() {
  const today = getDateKey();
  const log = state.dailyLogs[today] || { learningSec: 0, entertainmentSec: 0 };
  const isRunning = isVideoPlaying || manualTimerActive;

  if (els.liveTimerPill) {
    els.liveTimerPill.classList.remove('learning', 'entertainment', 'running', 'expired');
    els.liveTimerPill.classList.add(state.mode);
    if (isRunning) els.liveTimerPill.classList.add('running');

    if (state.mode === 'learning') {
      const goalSec = state.budgets.learningGoalMin * 60;
      els.timerPillText.textContent = `Lernzeit heute: ${formatMMSS(log.learningSec)} / ${formatMMSS(goalSec)} Ziel`;
    } else {
      const limitSec = state.budgets.entertainmentLimitMin * 60;
      const remaining = Math.max(0, limitSec - log.entertainmentSec);
      els.timerPillText.textContent =
        remaining > 0
          ? `Unterhaltung heute: ${formatMMSS(remaining)} verbleibend`
          : `Unterhaltungs-Limit (${state.budgets.entertainmentLimitMin} Min.) erreicht`;
      if (remaining === 0) {
        els.liveTimerPill.classList.add('expired');
      }
    }
  }

  if (els.timerStateBadge) {
    if (manualTimerActive) {
      els.timerStateBadge.textContent = 'Läuft';
    } else if (isVideoPlaying) {
      els.timerStateBadge.textContent = 'Video';
    } else {
      els.timerStateBadge.textContent = 'Pause';
    }
  }

  if (els.btnDashTimerToggle) {
    els.btnDashTimerToggle.textContent = manualTimerActive
      ? '⏸ Session-Timer pausieren'
      : '▶ Session-Timer starten';
  }
}

setInterval(() => {
  if (!isVideoPlaying && !manualTimerActive) return;

  const today = getDateKey();
  if (!state.dailyLogs[today]) {
    state.dailyLogs[today] = { learningSec: 0, entertainmentSec: 0 };
  }

  if (state.mode === 'learning') {
    state.dailyLogs[today].learningSec += 1;
  } else {
    state.dailyLogs[today].entertainmentSec += 1;
    const limitSec = state.budgets.entertainmentLimitMin * 60;
    if (state.dailyLogs[today].entertainmentSec >= limitSec) {
      const graceId = getGraceVideoIdForToday();
      const finishingGraceVideo = isVideoPlaying && activeVideoId && activeVideoId === graceId;
      if (!finishingGraceVideo) {
        manualTimerActive = false;
        state.entertainmentGrace = null;
        renderAllViews();
      }
    }
  }

  saveState();
  updateTimerUI();
  if (state.activeTab === 'dashboard') {
    renderDashboard();
  }
}, 1000);

// --- YOUTUBE IFRAME PLAYER & SCHUTZSCHILD ---
function loadYouTubeIframeApi() {
  if (window.YT && window.YT.Player) {
    ytApiReady = true;
    return;
  }
  if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  ytApiReady = true;
  if (pendingVideoToLoad) {
    const id = pendingVideoToLoad;
    const startSec = pendingVideoStartSec || 0;
    pendingVideoToLoad = null;
    pendingVideoStartSec = 0;
    initOrLoadYtPlayer(id, startSec);
  }
};

function getResumeSeconds(videoId, videoDuration = 0) {
  if (!videoId || (state.watchedIds || []).includes(videoId)) return 0;
  const entry = state.playbackProgress?.[videoId];
  if (!entry || typeof entry.currentSec !== 'number' || entry.currentSec < 5) return 0;
  const dur = entry.durationSec || videoDuration || 0;
  if (dur > 15 && entry.currentSec >= dur - 10) return 0;
  return Math.floor(entry.currentSec);
}

function savePlaybackProgress(videoId, currentSec, durationSec = 0, forcePersist = false) {
  if (!videoId || typeof currentSec !== 'number' || Number.isNaN(currentSec)) return;
  if (!state.playbackProgress || typeof state.playbackProgress !== 'object') {
    state.playbackProgress = {};
  }

  const dur = durationSec > 0 ? durationSec : state.playbackProgress[videoId]?.durationSec || 0;
  if (dur > 15 && currentSec >= dur - 10) {
    if (state.playbackProgress[videoId]) {
      delete state.playbackProgress[videoId];
      saveState();
    }
    return;
  }

  if (currentSec < 5) {
    if (forcePersist && state.playbackProgress[videoId]) {
      delete state.playbackProgress[videoId];
      saveState();
    }
    return;
  }

  state.playbackProgress[videoId] = {
    currentSec: Math.floor(currentSec),
    durationSec: Math.round(dur),
    updatedAt: Date.now()
  };

  const now = Date.now();
  if (forcePersist || now - lastProgressSavedAt >= 3000) {
    lastProgressSavedAt = now;
    saveState();
  }
}

function clearPlaybackProgress(videoId) {
  if (!videoId || !state.playbackProgress?.[videoId]) return;
  delete state.playbackProgress[videoId];
  saveState();
}

function saveActiveVideoProgress(forcePersist = true) {
  if (!activeVideoId || !ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
  try {
    const current = ytPlayer.getCurrentTime() || 0;
    const duration = ytPlayer.getDuration() || lastVideoDuration || 0;
    savePlaybackProgress(activeVideoId, current, duration, forcePersist);
  } catch {
    // Player evtl. nicht bereit
  }
}

function renderThumbProgressHtml(video) {
  const resumeSec = getResumeSeconds(video.id, video.durationSec);
  if (resumeSec <= 0) return '';
  const totalDur = video.durationSec || state.playbackProgress?.[video.id]?.durationSec || 0;
  const pct = totalDur > 0 ? Math.min(98, Math.max(4, Math.round((resumeSec / totalDur) * 100))) : 15;
  return `
    <span class="resume-badge">Weiter ${formatMMSS(resumeSec)}</span>
    <div class="thumb-progress-track"><div class="thumb-progress-fill" style="width:${pct}%"></div></div>
  `;
}

const QUALITY_LABELS = {
  highres: '4K',
  hd2160: '2160p',
  hd1440: '1440p',
  hd1080: '1080p',
  hd720: '720p',
  large: '480p',
  medium: '360p',
  small: '240p',
  tiny: '144p',
  auto: 'Auto',
  default: 'Auto'
};

function updateCaptionsUi() {
  if (!els.ctrlCaptions) return;
  const enabled = Boolean(state.playerPrefs?.captionsEnabled);
  els.ctrlCaptions.textContent = enabled ? 'CC An' : 'CC Aus';
  els.ctrlCaptions.classList.toggle('active', enabled);
}

function applyCaptionsSetting(player) {
  if (!player) return;
  const enabled = Boolean(state.playerPrefs?.captionsEnabled);
  try {
    if (!enabled) {
      if (typeof player.setOption === 'function') {
        player.setOption('captions', 'track', {});
      }
      if (typeof player.unloadModule === 'function') {
        player.unloadModule('captions');
      }
    } else {
      if (typeof player.loadModule === 'function') {
        player.loadModule('captions');
      }
      if (typeof player.getOption === 'function' && typeof player.setOption === 'function') {
        const tracks = player.getOption('captions', 'tracklist');
        if (Array.isArray(tracks) && tracks.length > 0) {
          const preferred =
            tracks.find((t) => t.languageCode === 'de') ||
            tracks.find((t) => t.languageCode === 'en') ||
            tracks[0];
          if (preferred?.languageCode) {
            player.setOption('captions', 'track', { languageCode: preferred.languageCode });
          }
        }
      }
    }
  } catch {
    // Modul noch nicht geladen
  }
}

function refreshAvailableQualityLevels(player) {
  if (!els.ctrlQuality || !player || typeof player.getAvailableQualityLevels !== 'function') return;
  try {
    const levels = player.getAvailableQualityLevels() || [];
    if (!Array.isArray(levels) || levels.length === 0) return;
    const filtered = levels.filter((lvl) => lvl !== 'auto');
    const options = ['default', ...filtered];
    const currentPref = state.playerPrefs?.quality || 'default';
    els.ctrlQuality.innerHTML = options
      .map((q) => `<option value="${escapeHtml(q)}">${escapeHtml(QUALITY_LABELS[q] || q)}</option>`)
      .join('');
    if (options.includes(currentPref)) {
      els.ctrlQuality.value = currentPref;
    } else {
      els.ctrlQuality.value = 'default';
    }
  } catch {
    // Fallback auf Standardoptionen
  }
}

function applyQualitySetting(player) {
  if (!player) return;
  const q = state.playerPrefs?.quality || 'default';
  try {
    if (q !== 'default' && typeof player.setPlaybackQuality === 'function') {
      player.setPlaybackQuality(q);
    }
  } catch {
    // Ignorieren
  }
}

function initOrLoadYtPlayer(videoId, startSec = 0) {
  const cleanStart = Math.max(0, Math.floor(startSec || 0));
  if (!ytApiReady || !window.YT || !window.YT.Player) {
    pendingVideoToLoad = videoId;
    pendingVideoStartSec = cleanStart;
    loadYouTubeIframeApi();
    return;
  }

  const preferredQuality = state.playerPrefs?.quality || 'default';

  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    const loadOpts = { videoId };
    if (cleanStart > 0) loadOpts.startSeconds = cleanStart;
    if (preferredQuality !== 'default') loadOpts.suggestedQuality = preferredQuality;
    ytPlayer.loadVideoById(loadOpts);
    ytPlayer.setPlaybackRate(playbackRate);
    applyCaptionsSetting(ytPlayer);
    applyQualitySetting(ytPlayer);
    return;
  }

  const playerVars = {
    controls: 0,
    rel: 0,
    modestbranding: 1,
    iv_load_policy: 3,
    cc_load_policy: 0,
    disablekb: 1,
    fs: 0,
    playsinline: 1
  };
  if (cleanStart > 0) {
    playerVars.start = cleanStart;
  }
  if (window.location.protocol.startsWith('http')) {
    playerVars.origin = window.location.origin;
  }

  ytPlayer = new window.YT.Player('yt-player-container', {
    videoId,
    playerVars,
    events: {
      onReady: (e) => {
        e.target.setPlaybackRate(playbackRate);
        applyCaptionsSetting(e.target);
        applyQualitySetting(e.target);
        e.target.playVideo();
      },
      onApiChange: (e) => {
        applyCaptionsSetting(e.target);
        refreshAvailableQualityLevels(e.target);
        applyQualitySetting(e.target);
      },
      onStateChange: handlePlayerStateChange,
      onError: () => {
        showFocusOverlay('ended', 'Einbetten vom Kanal deaktiviert', 'Dieses Video erlaubt kein externes Einbetten. Du kannst es direkt über deinen YouTube-Tab ansehen und Notizen trotzdem hier festhalten.');
      }
    }
  });
}

function clearControlsHideTimer() {
  if (controlsHideTimer) {
    clearTimeout(controlsHideTimer);
    controlsHideTimer = null;
  }
  if (els.playerStage) {
    els.playerStage.classList.remove('controls-hidden');
  }
}

function scheduleControlsHide() {
  if (controlsHideTimer) {
    clearTimeout(controlsHideTimer);
    controlsHideTimer = null;
  }
  if (!isVideoPlaying || isControlsHovered) return;
  controlsHideTimer = setTimeout(() => {
    if (isVideoPlaying && !isControlsHovered && els.playerStage) {
      els.playerStage.classList.add('controls-hidden');
    }
  }, 10000);
}

function showPlayerControlsTemporarily() {
  if (els.playerStage) {
    els.playerStage.classList.remove('controls-hidden');
  }
  scheduleControlsHide();
}

function handlePlayerStateChange(event) {
  const YTState = window.YT?.PlayerState;
  if (!YTState) return;

  if (event.data === YTState.PLAYING) {
    isVideoPlaying = true;
    endScreenTriggered = false;
    hideFocusOverlay();
    els.ctrlPlayPause.textContent = '⏸ Pause';
    applyCaptionsSetting(event.target);
    refreshAvailableQualityLevels(event.target);
    applyQualitySetting(event.target);
    startScrubberPoll();
    updateTimerUI();
    showPlayerControlsTemporarily();
  } else if (event.data === YTState.PAUSED) {
    isVideoPlaying = false;
    els.ctrlPlayPause.textContent = '▶ Play';
    stopScrubberPoll();
    clearControlsHideTimer();
    saveActiveVideoProgress(true);
    updateTimerUI();
    if (!endScreenTriggered) {
      showFocusOverlay('pause', 'Pausiert', '');
    }
  } else if (event.data === YTState.ENDED) {
    isVideoPlaying = false;
    endScreenTriggered = true;
    els.ctrlPlayPause.textContent = '▶ Play';
    stopScrubberPoll();
    clearControlsHideTimer();
    if (activeVideoId === getGraceVideoIdForToday()) {
      const today = getDateKey();
      const used = state.dailyLogs[today]?.entertainmentSec || 0;
      if (used >= state.budgets.entertainmentLimitMin * 60) {
        state.entertainmentGrace = null;
      }
    }
    clearPlaybackProgress(activeVideoId);
    markVideoWatched(activeVideoId, true);
    showFocusOverlay(
      'ended',
      'Video beendet',
      'Notiz speichern oder direkt zurück zur Startseite.'
    );
    updateTimerUI();
  }
}

function showFocusOverlay(mode, heading, subtext) {
  const isPause = mode === 'pause';
  els.focusOverlay.classList.toggle('pause-minimal', isPause);
  if (els.overlayBadge) {
    els.overlayBadge.classList.toggle('hidden', isPause);
    els.overlayBadge.textContent = '✓ Video beendet';
  }
  if (els.overlayNoteBox) {
    els.overlayNoteBox.classList.toggle('hidden', isPause);
  }
  els.overlayHeading.textContent = heading;
  els.overlaySubtext.textContent = subtext || '';
  els.overlaySubtext.classList.toggle('hidden', !subtext);
  els.focusOverlay.classList.remove('hidden');
}

function hideFocusOverlay() {
  els.focusOverlay.classList.add('hidden');
}

function startScrubberPoll() {
  stopScrubberPoll();
  scrubberPollTimer = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
    const current = ytPlayer.getCurrentTime() || 0;
    const duration = ytPlayer.getDuration() || lastVideoDuration || 0;
    lastVideoDuration = duration;

    els.ctrlCurrentTime.textContent = formatMMSS(current);
    els.ctrlTotalTime.textContent = formatMMSS(duration);
    els.noteTimestampPreview.textContent = formatMMSS(current);

    if (duration > 0) {
      els.ctrlScrubber.value = String((current / duration) * 100);
    }

    savePlaybackProgress(activeVideoId, current, duration, false);

    // Aktives Kapitel hervorheben
    highlightActiveChapter(current);

    // WICHTIG: 1.5s vor Ende abfangen, damit YouTube niemals Endscreen-Empfehlungen rendert
    if (duration > 5 && duration - current <= 1.5 && !endScreenTriggered) {
      endScreenTriggered = true;
      isVideoPlaying = false;
      try {
        ytPlayer.pauseVideo();
      } catch {
        // Ignore
      }
      clearControlsHideTimer();
      clearPlaybackProgress(activeVideoId);
      if (activeVideoId === getGraceVideoIdForToday()) {
        const today = getDateKey();
        const used = state.dailyLogs[today]?.entertainmentSec || 0;
        if (used >= state.budgets.entertainmentLimitMin * 60) {
          state.entertainmentGrace = null;
        }
      }
      markVideoWatched(activeVideoId, true);
      showFocusOverlay(
        'ended',
        'Video beendet',
        'Notiz speichern oder direkt zurück zur Startseite.'
      );
      updateTimerUI();
    }
  }, 250);
}

function stopScrubberPoll() {
  if (scrubberPollTimer) {
    clearInterval(scrubberPollTimer);
    scrubberPollTimer = null;
  }
}

function highlightActiveChapter(currentSec) {
  const buttons = els.playerChaptersList.querySelectorAll('.chapter-item');
  let activeIdx = -1;
  buttons.forEach((btn, idx) => {
    const start = parseFloat(btn.dataset.timeSec || '0');
    if (currentSec >= start) activeIdx = idx;
  });
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === activeIdx);
  });
}

function openVideoInWorkspace(videoId) {
  const video = findVideoById(videoId);
  if (!video) return;

  if (activeVideoId && activeVideoId !== video.id) {
    saveActiveVideoProgress(true);
  }

  const effectiveCat = video.isDiscovery ? 'learning' : getChannelCategory(video.channelHandle);
  if (effectiveCat === 'entertainment') {
    if (isEntertainmentUsedUpFor(video.id)) {
      alert(
        `Dein Unterhaltungs-Limit (${state.budgets.entertainmentLimitMin} Min.) ist für heute erreicht. Neue Unterhaltungsvideos sind bis morgen gesperrt — du kannst jederzeit weiter im Lern-Modus schauen.`
      );
      return;
    }
    state.entertainmentGrace = { dateKey: getDateKey(), videoId: video.id };
    saveState();
  } else {
    const today = getDateKey();
    const used = state.dailyLogs[today]?.entertainmentSec || 0;
    if (used >= state.budgets.entertainmentLimitMin * 60) {
      state.entertainmentGrace = null;
      saveState();
    }
  }

  // Falls Nutzer direkt aus dem Abo-Manager o. ä. ein Video eines anderen Modus öffnet, Modus angleichen
  if (effectiveCat === 'learning' || effectiveCat === 'entertainment') {
    if (state.mode !== effectiveCat) {
      setMode(effectiveCat);
    }
  }

  const resumeSec = getResumeSeconds(video.id, video.durationSec);
  activeVideoId = video.id;
  lastVideoDuration = video.durationSec || 0;
  endScreenTriggered = false;

  els.playerWorkspace.classList.remove('hidden');
  els.playerCategoryBadge.className = `category-badge ${effectiveCat}`;
  els.playerCategoryBadge.textContent = effectiveCat === 'learning' ? '🎓 Lernen' : '🍿 Unterhaltung';
  els.playerVideoTitle.textContent = getDisplayTitle(video);
  els.playerChannelName.textContent = video.channelName;
  els.playerTopic.textContent = video.topic;
  els.playerDurationLabel.textContent = video.durationText || formatMMSS(video.durationSec);
  els.ctrlCurrentTime.textContent = formatMMSS(resumeSec);
  els.ctrlTotalTime.textContent = video.durationText || '00:00';
  els.ctrlScrubber.value =
    video.durationSec > 0 && resumeSec > 0 ? String(Math.min(99, (resumeSec / video.durationSec) * 100)) : '0';
  els.noteTimestampPreview.textContent = formatMMSS(resumeSec);
  if (els.playerObsidianStatus) els.playerObsidianStatus.textContent = '';
  if (els.aiTranscriptInput) els.aiTranscriptInput.value = '';
  renderAiSummaryBox(video.id);

  updateWatchedButtonUI();
  renderPlayerChapters(video);
  renderPlayerNotes(video.id);
  hideFocusOverlay();
  clearControlsHideTimer();

  initOrLoadYtPlayer(video.id, resumeSec);
  els.playerWorkspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closePlayerWorkspace() {
  saveActiveVideoProgress(true);
  if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
    try {
      ytPlayer.pauseVideo();
    } catch {
      // Ignore
    }
  }
  isVideoPlaying = false;
  isControlsHovered = false;
  stopScrubberPoll();
  clearControlsHideTimer();
  hideFocusOverlay();
  els.playerWorkspace.classList.add('hidden');
  activeVideoId = null;

  const today = getDateKey();
  const used = state.dailyLogs[today]?.entertainmentSec || 0;
  if (used >= state.budgets.entertainmentLimitMin * 60) {
    state.entertainmentGrace = null;
    saveState();
  }

  updateTimerUI();
  renderVideoViews();
  renderDiscoveryResults();
}

function togglePlayPause() {
  if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;
  const YTState = window.YT?.PlayerState;
  const st = ytPlayer.getPlayerState();
  if (st === YTState?.PLAYING) {
    ytPlayer.pauseVideo();
  } else {
    const duration = ytPlayer.getDuration() || lastVideoDuration || 0;
    const current = ytPlayer.getCurrentTime() || 0;
    if (duration > 5 && duration - current <= 2) {
      ytPlayer.seekTo(0, true);
    }
    endScreenTriggered = false;
    hideFocusOverlay();
    ytPlayer.playVideo();
  }
}

function seekRelative(deltaSec) {
  if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
  const current = ytPlayer.getCurrentTime() || 0;
  const duration = ytPlayer.getDuration() || lastVideoDuration || 0;
  const target = Math.max(0, Math.min(duration || current + deltaSec, current + deltaSec));
  ytPlayer.seekTo(target, true);
  els.ctrlCurrentTime.textContent = formatMMSS(target);
  if (activeVideoId) {
    savePlaybackProgress(activeVideoId, target, duration, true);
  }
}

function markVideoWatched(videoId, forceWatched = null) {
  if (!videoId) return;
  const exists = state.watchedIds.includes(videoId);
  const shouldWatch = forceWatched !== null ? forceWatched : !exists;
  if (shouldWatch && !exists) {
    state.watchedIds.push(videoId);
    if (state.playbackProgress?.[videoId]) {
      delete state.playbackProgress[videoId];
    }
  } else if (!shouldWatch && exists) {
    state.watchedIds = state.watchedIds.filter((id) => id !== videoId);
  }
  saveState();
  updateWatchedButtonUI();
  renderVideoViews();
  renderDiscoveryResults();
}

function updateWatchedButtonUI() {
  const watched = activeVideoId && state.watchedIds.includes(activeVideoId);
  els.btnToggleWatched.textContent = watched ? '✓ Gesehen (Rückgängig)' : '✓ Als gesehen markieren';
}

function renderPlayerChapters(video) {
  const chapters = video.chapters && video.chapters.length > 0
    ? video.chapters
    : [{ timeSec: 0, label: 'Vollständiges Video' }];

  els.playerChaptersList.innerHTML = chapters
    .map(
      (ch) => `
      <li>
        <button class="chapter-item" data-time-sec="${ch.timeSec}">
          <span class="chapter-time">${formatMMSS(ch.timeSec)}</span>
          <span>${escapeHtml(ch.label)}</span>
        </button>
      </li>
    `
    )
    .join('');

  els.playerChaptersList.querySelectorAll('.chapter-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sec = parseFloat(btn.dataset.timeSec || '0');
      if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
        endScreenTriggered = false;
        hideFocusOverlay();
        ytPlayer.seekTo(sec, true);
        ytPlayer.playVideo();
      }
    });
  });
}

// --- NOTIZEN ---
function addNoteForActiveVideo(text) {
  const trimmed = (text || '').trim();
  if (!trimmed || !activeVideoId) return;

  let timeSec = 0;
  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    timeSec = Math.floor(ytPlayer.getCurrentTime() || 0);
  }

  if (!state.notesByVideo[activeVideoId]) {
    state.notesByVideo[activeVideoId] = [];
  }

  state.notesByVideo[activeVideoId].push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timeSec,
    text: trimmed,
    createdAt: new Date().toISOString()
  });

  state.notesByVideo[activeVideoId].sort((a, b) => a.timeSec - b.timeSec);
  saveState();
  renderPlayerNotes(activeVideoId);
  renderAllNotesTab();
}

function deleteNote(videoId, noteId) {
  if (!state.notesByVideo[videoId]) return;
  state.notesByVideo[videoId] = state.notesByVideo[videoId].filter((n) => n.id !== noteId);
  if (state.notesByVideo[videoId].length === 0) {
    delete state.notesByVideo[videoId];
  }
  saveState();
  if (activeVideoId === videoId) renderPlayerNotes(videoId);
  renderAllNotesTab();
}

function renderPlayerNotes(videoId) {
  const notes = state.notesByVideo[videoId] || [];
  if (notes.length === 0) {
    els.playerNotesList.innerHTML = `<li class="panel-hint">Noch keine Notizen zu diesem Video.</li>`;
    return;
  }

  els.playerNotesList.innerHTML = notes
    .map(
      (n) => `
      <li class="note-item">
        <button class="note-jump-btn" data-jump-sec="${n.timeSec}">${formatMMSS(n.timeSec)}</button>
        <span class="note-text">${escapeHtml(n.text)}</span>
        <button class="note-delete-btn" data-del-note="${n.id}" title="Notiz löschen">✕</button>
      </li>
    `
    )
    .join('');

  els.playerNotesList.querySelectorAll('[data-jump-sec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sec = parseInt(btn.dataset.jumpSec || '0', 10);
      if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
        endScreenTriggered = false;
        hideFocusOverlay();
        ytPlayer.seekTo(sec, true);
        ytPlayer.playVideo();
      }
    });
  });

  els.playerNotesList.querySelectorAll('[data-del-note]').forEach((btn) => {
    btn.addEventListener('click', () => deleteNote(videoId, btn.dataset.delNote));
  });
}

function renderAllNotesTab() {
  const entries = Object.entries(state.notesByVideo);
  const totalCount = entries.reduce((sum, [, arr]) => sum + arr.length, 0);
  els.notesCountBadge.textContent = String(totalCount);

  if (totalCount === 0) {
    els.allNotesContainer.innerHTML = `
      <div class="panel-card">
        <h3>Noch keine Lern-Notizen vorhanden</h3>
        <p class="panel-hint">Öffne ein Video und speichere Erkenntnisse direkt neben dem Player mit Zeitstempel.</p>
      </div>
    `;
    return;
  }

  els.allNotesContainer.innerHTML = entries
    .map(([videoId, notes]) => {
      const video = findVideoById(videoId);
      const title = video ? getDisplayTitle(video) : `Video ${videoId}`;
      const channel = video ? video.channelName : '';
      return `
        <div class="note-group-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <h3>${escapeHtml(title)}</h3>
              <p class="panel-hint">${escapeHtml(channel)}</p>
            </div>
            <button class="btn btn-obsidian" style="padding:4px 8px; font-size:0.75rem;" data-obsidian-video="${escapeHtml(videoId)}">🟣 Obsidian</button>
          </div>
          <ul class="notes-list">
            ${notes
              .map(
                (n) => `
              <li class="note-item">
                <button class="note-jump-btn" data-open-video="${videoId}" data-jump-sec="${n.timeSec}">
                  ${formatMMSS(n.timeSec)}
                </button>
                <span class="note-text">${escapeHtml(n.text)}</span>
                <button class="note-delete-btn" data-del-video="${videoId}" data-del-id="${n.id}">✕</button>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      `;
    })
    .join('');

  els.allNotesContainer.querySelectorAll('[data-open-video]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const vId = btn.dataset.openVideo;
      const sec = parseInt(btn.dataset.jumpSec || '0', 10);
      openVideoInWorkspace(vId);
      setTimeout(() => {
        if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
          ytPlayer.seekTo(sec, true);
        }
      }, 600);
    });
  });

  els.allNotesContainer.querySelectorAll('[data-del-id]').forEach((btn) => {
    btn.addEventListener('click', () => deleteNote(btn.dataset.delVideo, btn.dataset.delId));
  });

  els.allNotesContainer.querySelectorAll('[data-obsidian-video]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = findVideoById(btn.dataset.obsidianVideo);
      if (!v) return;
      const md = buildVideoObsidianMarkdown(v);
      openInObsidianUri(sanitizeFilename(getDisplayTitle(v)), md, v.channelName);
    });
  });
}

// --- RENDERING DER VIEWS ---
function setMode(mode) {
  state.mode = mode;
  els.body.classList.toggle('mode-learning', mode === 'learning');
  els.body.classList.toggle('mode-entertainment', mode === 'entertainment');
  els.btnModeLearning.classList.toggle('active', mode === 'learning');
  els.btnModeEntertainment.classList.toggle('active', mode === 'entertainment');
  saveState();
  updateTimerUI();
  renderVideoViews();
  renderFeedChannelFilter();
}

function setTab(tabName) {
  state.activeTab = tabName;
  els.navTabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabName));
  els.tabPanels.forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${tabName}`));
  saveState();

  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'channels') renderChannelManager();
  if (tabName === 'notes') renderAllNotesTab();
}

function renderGoalTopicsDatalist() {
  if (!els.goalTopicsDatalist) return;
  const all = getAllGoals();
  els.goalTopicsDatalist.innerHTML = all
    .map((g) => `<option value="${escapeHtml(g.id)}">${escapeHtml(g.label)}</option>`)
    .join('');
}

function renderLearningGoals() {
  els.learningGoalsChips.innerHTML = getAllGoals()
    .map((goal) => {
      const active = state.activeGoals.includes(goal.id);
      const chipBtn = `
        <button type="button" class="goal-chip ${active ? 'active' : ''}" data-goal-id="${escapeHtml(goal.id)}" title="${escapeHtml(goal.description || goal.label)}">
          ${active ? '✓ ' : ''}${escapeHtml(goal.label)}
        </button>
      `;
      if (!goal.isCustom) return chipBtn;
      return `
        <span class="goal-chip-wrap">
          ${chipBtn}
          <button type="button" class="goal-chip-remove" data-remove-goal="${escapeHtml(goal.id)}" title="Eigenes Interesse entfernen">×</button>
        </span>
      `;
    })
    .join('');

  els.learningGoalsChips.querySelectorAll('.goal-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.goalId;
      if (state.activeGoals.includes(id)) {
        state.activeGoals = state.activeGoals.filter((g) => g !== id);
      } else {
        state.activeGoals.push(id);
      }
      saveState();
      renderLearningGoals();
      renderVideoViews();
    });
  });

  els.learningGoalsChips.querySelectorAll('[data-remove-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeCustomGoal(btn.dataset.removeGoal);
      renderLearningGoals();
      renderDiscoverGoalPills();
      renderGoalTopicsDatalist();
      renderVideoViews();
    });
  });
}

function createVideoCardHtml(video) {
  const isWatched = state.watchedIds.includes(video.id);
  const title = getDisplayTitle(video);
  const thumbUrl = video.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`;

  return `
    <article class="video-card ${isWatched ? 'watched' : ''}" data-video-id="${escapeHtml(video.id)}">
      <div class="video-thumb" data-play-video="${escapeHtml(video.id)}">
        <img src="${thumbUrl}" alt="${escapeHtml(title)}" loading="lazy" />
        <span class="duration-badge">${escapeHtml(video.durationText || formatMMSS(video.durationSec))}</span>
        ${!isWatched ? renderThumbProgressHtml(video) : ''}
      </div>
      <div class="video-body">
        <h3 class="video-title" data-play-video="${escapeHtml(video.id)}">${escapeHtml(title)}</h3>
        <div class="video-footer">
          <span>
            <button type="button" class="video-channel-link" data-filter-channel="${escapeHtml(video.channelHandle)}" title="Videos dieses Kanals anzeigen">
              ${escapeHtml(video.channelName)}
            </button>
            · ${escapeHtml(video.topic)}${video.publishedText ? ` · ${escapeHtml(video.publishedText)}` : ''}
          </span>
          <button class="btn-link" data-mark-watched="${escapeHtml(video.id)}">
            ${isWatched ? '✓ Gesehen' : 'Als gesehen'}
          </button>
        </div>
      </div>
    </article>
  `;
}

function attachVideoCardHandlers(container) {
  container.querySelectorAll('[data-play-video]').forEach((el) => {
    el.addEventListener('click', () => openVideoInWorkspace(el.dataset.playVideo));
  });
  container.querySelectorAll('[data-mark-watched]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      markVideoWatched(btn.dataset.markWatched);
    });
  });
  container.querySelectorAll('[data-filter-channel]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const handle = btn.dataset.filterChannel;
      if (!handle) return;
      const chCat = getChannelCategory(handle);
      if (chCat === 'learning' || chCat === 'entertainment') {
        if (state.mode !== chCat) setMode(chCat);
      }
      renderFeedChannelFilter();
      if (els.feedChannelFilter) {
        els.feedChannelFilter.value = handle;
      }
      setTab('feed');
      renderVideoViews();
    });
  });
}

function renderLockNoticeHtml() {
  return `
    <h2>⏱️ Tagesbudget für Unterhaltung erreicht</h2>
    <p>
      Dein eingestelltes Unterhaltungs-Limit (${state.budgets.entertainmentLimitMin} Min.) ist für heute aufgebraucht.
      Zeit für eine Pause oder gezielten Wissensaufbau im Lern-Modus.
    </p>
    <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
      <button class="btn btn-primary" data-lock-switch-learning>🎓 Zu Lernen wechseln</button>
      <button class="btn btn-secondary" data-lock-open-dashboard>Limit im Dashboard anpassen</button>
    </div>
  `;
}

function bindLockHandlers(container) {
  container.querySelector('[data-lock-switch-learning]')?.addEventListener('click', () => setMode('learning'));
  container.querySelector('[data-lock-open-dashboard]')?.addEventListener('click', () => setTab('dashboard'));
}

function renderVideoViews() {
  const locked = isEntertainmentLocked();

  // 1. Startseite (Weiterschauen + Haupt-Grid)
  if (locked) {
    els.entertainmentLockNotice.innerHTML = renderLockNoticeHtml();
    els.entertainmentLockNotice.classList.remove('hidden');
    bindLockHandlers(els.entertainmentLockNotice);
    if (els.continueWatchingSection) els.continueWatchingSection.classList.add('hidden');
    els.algorithmVideoGrid.innerHTML = '';
  } else {
    els.entertainmentLockNotice.classList.add('hidden');
    const query = ((els.globalSearchInput?.value || els.algoSearchInput?.value) || '').trim();
    const inProgress = !query
      ? state.videos
          .filter((v) => {
            const cat = getChannelCategory(v.channelHandle);
            return cat === state.mode && getResumeSeconds(v.id, v.durationSec) > 0;
          })
          .sort((a, b) => (state.playbackProgress?.[b.id]?.updatedAt || 0) - (state.playbackProgress?.[a.id]?.updatedAt || 0))
          .slice(0, 4)
      : [];

    if (els.continueWatchingSection && els.continueWatchingGrid) {
      if (inProgress.length > 0) {
        els.continueWatchingSection.classList.remove('hidden');
        els.continueWatchingGrid.innerHTML = inProgress.map((v) => createVideoCardHtml(v)).join('');
        attachVideoCardHandlers(els.continueWatchingGrid);
      } else {
        els.continueWatchingSection.classList.add('hidden');
        els.continueWatchingGrid.innerHTML = '';
      }
    }

    const inProgressIds = new Set(inProgress.map((v) => v.id));
    const algoVideos = getFilteredVideos({ applyFloodBrake: true, sortByScore: true }).filter(
      (v) => !inProgressIds.has(v.id)
    );

    if (algoVideos.length === 0 && inProgress.length === 0) {
      els.algorithmVideoGrid.innerHTML = `<div class="panel-card"><h3>Keine Treffer</h3><p class="panel-hint">Passe Interessen, Suche oder Filter an — oder drücke oben Enter, um auf YouTube danach zu suchen.</p></div>`;
    } else {
      els.algorithmVideoGrid.innerHTML = algoVideos.map((v) => createVideoCardHtml(v)).join('');
      attachVideoCardHandlers(els.algorithmVideoGrid);
    }
  }

  // 2. Chronologischer Abo-Feed
  if (locked) {
    els.feedLockNotice.innerHTML = renderLockNoticeHtml();
    els.feedLockNotice.classList.remove('hidden');
    bindLockHandlers(els.feedLockNotice);
    els.feedVideoGrid.innerHTML = '';
  } else {
    els.feedLockNotice.classList.add('hidden');
    const channelFilter = els.feedChannelFilter.value || 'all';
    const feedVideos = getFilteredVideos({ applyFloodBrake: true, sortByScore: false, channelFilter });
    els.feedModeDescription.textContent =
      state.mode === 'learning'
        ? 'Chronologische Uploads deiner Lern-Kanäle (Shorts sind dauerhaft blockiert).'
        : 'Chronologische Uploads deiner Unterhaltungs-Kanäle innerhalb deines Tageslimits.';

    if (feedVideos.length === 0) {
      els.feedVideoGrid.innerHTML = `<div class="panel-card"><h3>Keine Videos in diesem Filter</h3><p class="panel-hint">Prüfe die Kanal-Auswahl oder schalte stummgeschaltete Kanäle im Abo-Manager wieder frei.</p></div>`;
    } else {
      els.feedVideoGrid.innerHTML = feedVideos.map((v) => createVideoCardHtml(v, false)).join('');
      attachVideoCardHandlers(els.feedVideoGrid);
    }
  }
}

function renderFeedChannelFilter() {
  const channelsInMode = state.channels.filter((c) => c.category === state.mode);
  const currentVal = els.feedChannelFilter.value;
  els.feedChannelFilter.innerHTML =
    `<option value="all">Alle Kanäle im Modus (${channelsInMode.length})</option>` +
    channelsInMode
      .map((c) => `<option value="${escapeHtml(c.handle)}">${escapeHtml(c.name)} (${escapeHtml(c.topic)})</option>`)
      .join('');
  if (channelsInMode.some((c) => c.handle === currentVal)) {
    els.feedChannelFilter.value = currentVal;
  } else {
    els.feedChannelFilter.value = 'all';
  }
}

// --- WOCHEN-DASHBOARD ---
function renderDashboard() {
  const week = getCurrentWeekDates();
  const todayKey = getDateKey();

  let weekLearnSec = 0;
  let weekEntSec = 0;
  const dayData = week.map((d) => {
    const log = state.dailyLogs[d.key] || { learningSec: 0, entertainmentSec: 0 };
    weekLearnSec += log.learningSec;
    weekEntSec += log.entertainmentSec;
    return { ...d, ...log };
  });

  const totalWeekSec = weekLearnSec + weekEntSec;
  const ratio = totalWeekSec > 0 ? Math.round((weekLearnSec / totalWeekSec) * 100) : 100;

  const todayLog = state.dailyLogs[todayKey] || { learningSec: 0, entertainmentSec: 0 };
  els.kpiFocusRatio.textContent = `${ratio}%`;
  els.kpiWeekLearning.textContent = `${Math.round(weekLearnSec / 60)} Min.`;
  els.kpiTodayLearning.textContent = `Heute: ${formatMMSS(todayLog.learningSec)} / ${state.budgets.learningGoalMin} Min.`;
  els.kpiWeekEntertainment.textContent = `${Math.round(weekEntSec / 60)} Min.`;
  els.kpiTodayEntertainment.textContent = `Heute: ${formatMMSS(todayLog.entertainmentSec)} / ${state.budgets.entertainmentLimitMin} Min.`;

  const maxMinutes = Math.max(
    60,
    ...dayData.map((d) => Math.max(Math.ceil(d.learningSec / 60), Math.ceil(d.entertainmentSec / 60)))
  );

  els.weeklyChart.innerHTML = dayData
    .map((d) => {
      const lMin = Math.round(d.learningSec / 60);
      const eMin = Math.round(d.entertainmentSec / 60);
      const lHeight = Math.max(3, Math.round((lMin / maxMinutes) * 165));
      const eHeight = Math.max(3, Math.round((eMin / maxMinutes) * 165));
      return `
        <div class="chart-day ${d.isToday ? 'today' : ''}">
          <span class="chart-day-mins">${lMin}/${eMin}m</span>
          <div class="chart-bars">
            <div class="bar learning" style="height:${lHeight}px" title="${d.label}: ${lMin} Min. Lernen"></div>
            <div class="bar entertainment" style="height:${eHeight}px" title="${d.label}: ${eMin} Min. Unterhaltung"></div>
          </div>
          <span class="chart-day-label">${d.label}${d.isToday ? ' •' : ''}</span>
        </div>
      `;
    })
    .join('');

  els.inputLearningGoal.value = String(state.budgets.learningGoalMin);
  els.inputEntertainmentLimit.value = String(state.budgets.entertainmentLimitMin);

  const blocked = state.blockedShorts || [];
  if (els.kpiBlockedCount) {
    els.kpiBlockedCount.textContent = `${blocked.length} Shorts + 100% Endscreens`;
  }

  if (blocked.length === 0) {
    els.blockedShortsList.innerHTML =
      '<li><small>Noch keine Shorts in geladenen YouTube-Feeds aufgetaucht — der Shorts-Filter (&lt; 60 Sek.) ist aktiv.</small></li>';
  } else {
    els.blockedShortsList.innerHTML = blocked
      .slice(0, 8)
      .map(
        (s) => `
      <li>
        <strong>${escapeHtml(s.title)}</strong>
        <small>${escapeHtml(s.channelName)} · ${escapeHtml(String(s.durationSec))}s Short blockiert (${escapeHtml(s.blockedAt || '')})</small>
      </li>
    `
      )
      .join('');
  }
}

// --- ABO-MANAGER ---
function renderChannelManager() {
  const counts = { learning: 0, entertainment: 0, muted: 0 };
  state.channels.forEach((c) => {
    counts[c.category] = (counts[c.category] || 0) + 1;
  });

  els.channelSummaryBadges.innerHTML = `
    <span class="category-badge learning">🎓 ${counts.learning} Lernen</span>
    <span class="category-badge entertainment">🍿 ${counts.entertainment} Unterhaltung</span>
    <span class="toggle-chip">🔇 ${counts.muted} Stumm</span>
  `;

  els.channelManagerList.innerHTML = state.channels
    .map(
      (ch) => `
      <div class="channel-card ${ch.category === 'muted' ? 'muted' : ''}">
        <div class="channel-head">
          <div>
            <div class="channel-name">${escapeHtml(ch.name)}</div>
            <div class="channel-handle">${escapeHtml(ch.handle)} · ${escapeHtml(ch.topic)}</div>
          </div>
          <span class="category-badge ${ch.category === 'learning' ? 'learning' : 'entertainment'}">
            ${ch.category === 'learning' ? '🎓' : ch.category === 'entertainment' ? '🍿' : '🔇'}
          </span>
        </div>
        <p class="channel-desc">${escapeHtml(ch.description || 'Abonnierter YouTube-Kanal')}</p>
        <div class="channel-topic-row">
          <input
            type="text"
            class="channel-topic-input"
            list="goal-topics-datalist"
            data-channel-topic="${escapeHtml(ch.handle)}"
            value="${escapeHtml(ch.topic || '')}"
            placeholder="Interesse / Thema zuordnen…"
            title="Thema oder Interesse für diesen Kanal anpassen"
          />
        </div>
        <div class="channel-controls">
          <select data-channel-category="${escapeHtml(ch.handle)}" class="select-input">
            <option value="learning" ${ch.category === 'learning' ? 'selected' : ''}>🎓 Lernen</option>
            <option value="entertainment" ${ch.category === 'entertainment' ? 'selected' : ''}>🍿 Unterhaltung</option>
            <option value="muted" ${ch.category === 'muted' ? 'selected' : ''}>🔇 Stummschalten</option>
          </select>
          <a
            href="https://www.youtube.com/${escapeHtml(ch.handle.startsWith('@') ? ch.handle : 'channel/' + ch.handle)}"
            target="_blank"
            rel="noopener"
            class="btn btn-ghost"
            title="Kanal auf YouTube öffnen"
          >↗</a>
          <button
            type="button"
            class="btn btn-ghost"
            data-remove-channel="${escapeHtml(ch.handle)}"
            title="Kanal entfernen / auf YouTube deabonnieren"
          >🗑️</button>
        </div>
      </div>
    `
    )
    .join('');

  els.channelManagerList.querySelectorAll('[data-channel-topic]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const handle = inp.dataset.channelTopic;
      const newTopic = inp.value.trim() || 'Allgemein & Wissen';
      const target = state.channels.find((c) => c.handle === handle);
      if (target) {
        target.topic = newTopic;
        state.videos.forEach((v) => {
          if (v.channelHandle === handle) v.topic = newTopic;
        });
        saveState();
        renderChannelManager();
        renderFeedChannelFilter();
        renderVideoViews();
      }
    });
  });

  els.channelManagerList.querySelectorAll('[data-channel-category]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const handle = sel.dataset.channelCategory;
      const target = state.channels.find((c) => c.handle === handle);
      if (target) {
        target.category = sel.value;
        saveState();
        renderChannelManager();
        renderFeedChannelFilter();
        renderVideoViews();
      }
    });
  });

  els.channelManagerList.querySelectorAll('[data-remove-channel]').forEach((btn) => {
    btn.addEventListener('click', () => removeOrUnsubscribeChannel(btn.dataset.removeChannel));
  });
}

function updateFeedSyncMetaUi() {
  if (!els.feedSyncMeta) return;
  if (!state.lastFeedSyncAt) {
    els.feedSyncMeta.textContent = '';
    return;
  }
  const timeStr = new Date(state.lastFeedSyncAt).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
  els.feedSyncMeta.textContent = `Stand: ${timeStr} Uhr`;
}

// --- GOOGLE OAUTH 2.0 & YOUTUBE DATA API V3 (UU-PLAYLIST-TRICK) ---
function updateSyncUi() {
  const connected = Boolean(oauthAccessToken);
  const hasYtApi = connected || Boolean((state.apiConfig.apiKey || '').trim());
  const hasAnyApi = hasYtApi || Boolean(state.apiConfig.geminiKey);
  els.syncStatusDot.className = `status-indicator ${hasAnyApi ? 'online' : 'offline'}`;
  els.btnFetchUuUploads.disabled = !hasYtApi;
  updateFeedSyncMetaUi();
  els.inputOauthClientId.value = state.apiConfig.clientId || '';
  els.inputYtApiKey.value = state.apiConfig.apiKey || '';
  if (els.inputGeminiApiKey) els.inputGeminiApiKey.value = state.apiConfig.geminiKey || '';
  if (els.selectGeminiModel) els.selectGeminiModel.value = normalizeGeminiModel(state.apiConfig.geminiModel);
  if (els.inputObsidianVault) els.inputObsidianVault.value = state.obsidianConfig.vaultName || '';
  if (els.inputObsidianFolder) els.inputObsidianFolder.value = state.obsidianConfig.folder || 'YouTube';
  if (els.obsidianDirStatus) {
    els.obsidianDirStatus.textContent = obsidianDirHandle
      ? `Verknüpft mit lokalem Ordner: ${obsidianDirHandle.name}`
      : 'Kein lokaler Ordner verknüpft (Standard: obsidian:// URI & .md Download)';
  }
}

async function ytApiFetch(url) {
  const headers = {};
  if (oauthAccessToken) {
    headers.Authorization = `Bearer ${oauthAccessToken}`;
  }
  const sep = url.includes('?') ? '&' : '?';
  const fullUrl = state.apiConfig.apiKey ? `${url}${sep}key=${encodeURIComponent(state.apiConfig.apiKey)}` : url;
  const res = await fetch(fullUrl, { headers });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`YouTube API Fehler (${res.status}): ${errText.slice(0, 140)}`);
  }
  return res.json();
}

async function removeOrUnsubscribeChannel(handle) {
  const ch = state.channels.find((c) => c.handle === handle);
  if (!ch) return;

  if (oauthAccessToken && ch.subscriptionId) {
    try {
      await fetch(`https://www.googleapis.com/youtube/v3/subscriptions?id=${encodeURIComponent(ch.subscriptionId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${oauthAccessToken}` }
      });
    } catch {
      // Lokal trotzdem entfernen
    }
  }

  state.channels = state.channels.filter((c) => c.handle !== handle);
  state.videos = state.videos.filter(
    (v) =>
      v.channelHandle.toLowerCase() !== handle.toLowerCase() &&
      (v.channelName || '').toLowerCase() !== (ch.name || '').toLowerCase()
  );
  saveState();
  renderChannelManager();
  renderFeedChannelFilter();
  renderVideoViews();
}

async function syncSubscriptionsFromApi() {
  els.syncStatusText.textContent = 'Gleiche deine echten Abonnements über YouTube Data API v3 ab…';
  try {
    let pageToken = '';
    const fetched = [];
    let totalResults = null;
    for (let page = 0; page < 15; page++) {
      const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50${
        pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''
      }`;
      const data = await ytApiFetch(url);
      if (totalResults === null && typeof data.pageInfo?.totalResults === 'number') {
        totalResults = data.pageInfo.totalResults;
      }
      (data.items || []).forEach((item) => {
        const snip = item.snippet;
        const channelId = snip?.resourceId?.channelId;
        if (!channelId) return;
        fetched.push({
          subscriptionId: item.id,
          channelId,
          name: snip.title,
          description: snip.description || ''
        });
      });
      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }

    const remoteIds = new Set(fetched.map((r) => r.channelId));
    const remoteNames = new Set(fetched.map((r) => (r.name || '').trim().toLowerCase()));

    let added = 0;
    fetched.forEach((remote) => {
      const existing = state.channels.find(
        (c) =>
          c.channelId === remote.channelId ||
          c.handle === remote.channelId ||
          (c.name || '').trim().toLowerCase() === (remote.name || '').trim().toLowerCase()
      );
      if (existing) {
        existing.channelId = remote.channelId;
        existing.subscriptionId = remote.subscriptionId;
      } else {
        state.channels.push({
          handle: remote.channelId,
          channelId: remote.channelId,
          subscriptionId: remote.subscriptionId,
          name: remote.name,
          category: 'learning',
          topic: 'Allgemein & Wissen',
          qualityBase: 80,
          description: remote.description.slice(0, 120)
        });
        added += 1;
      }
    });

    // Auf YouTube deabonnierte Kanäle und deren Videos sauber entfernen
    let removed = 0;
    if (fetched.length > 0 || totalResults === 0) {
      const removedHandles = new Set();
      const removedNames = new Set();
      state.channels = state.channels.filter((c) => {
        const isStillSub =
          (c.channelId && remoteIds.has(c.channelId)) ||
          remoteIds.has(c.handle) ||
          remoteNames.has((c.name || '').trim().toLowerCase());
        if (!isStillSub) {
          removed += 1;
          removedHandles.add((c.handle || '').toLowerCase());
          removedNames.add((c.name || '').trim().toLowerCase());
        }
        return isStillSub;
      });

      if (removed > 0) {
        state.videos = state.videos.filter(
          (v) =>
            !removedHandles.has((v.channelHandle || '').toLowerCase()) &&
            !removedNames.has((v.channelName || '').trim().toLowerCase())
        );
      }
    }

    saveState();
    renderChannelManager();
    renderFeedChannelFilter();
    renderVideoViews();
    els.syncStatusText.textContent = `Synchronisiert! ${fetched.length} aktive Abos (+${added} neu, -${removed} deabonniert). Lade neueste Videos…`;
    await fetchLiveUploadsViaUuTrick({ silent: true });
  } catch (err) {
    els.syncStatusText.textContent = err.message;
  }
}

let isFeedRefreshing = false;

function setFeedRefreshButtonsLoading(loading) {
  const label = loading ? '⏳ Aktualisiere…' : '🔄 Aktualisieren';
  if (els.btnRefreshAlgo) {
    els.btnRefreshAlgo.disabled = loading;
    els.btnRefreshAlgo.textContent = label;
  }
  if (els.btnRefreshFeed) {
    els.btnRefreshFeed.disabled = loading;
    els.btnRefreshFeed.textContent = loading ? '⏳ Aktualisiere…' : '🔄 Feed aktualisieren';
  }
  if (els.btnFetchUuUploads) {
    els.btnFetchUuUploads.disabled = loading || !(oauthAccessToken || (state.apiConfig.apiKey || '').trim());
  }
}

async function fetchLiveUploadsViaUuTrick({ silent = false } = {}) {
  if (isFeedRefreshing) return;

  const hasYtCreds = Boolean(oauthAccessToken || (state.apiConfig.apiKey || '').trim());
  if (!hasYtCreds) {
    if (!silent) {
      updateSyncUi();
      els.syncModal.classList.remove('hidden');
      els.syncStatusText.textContent = 'Bitte zuerst deinen YouTube Data API v3 Key eintragen oder über Google anmelden.';
    }
    return;
  }

  const channelsWithId = state.channels.filter((c) => c.channelId && c.channelId.startsWith('UC') && c.category !== 'muted');
  if (channelsWithId.length === 0) {
    const msg = 'Keine synchronisierten Kanäle mit UC-Channel-ID gefunden. Bitte einmal „Live-Abos abgleichen“ ausführen.';
    if (els.syncStatusText) els.syncStatusText.textContent = msg;
    if (els.feedSyncMeta) els.feedSyncMeta.textContent = 'Erst Abos abgleichen';
    return;
  }

  isFeedRefreshing = true;
  setFeedRefreshButtonsLoading(true);
  if (els.syncStatusText) {
    els.syncStatusText.textContent = `Lade neueste Uploads von ${channelsWithId.length} Kanälen…`;
  }
  if (els.feedSyncMeta) {
    els.feedSyncMeta.textContent = 'Aktualisiere…';
  }

  try {
    const rawItems = [];
    const batchSize = 5;
    for (let i = 0; i < channelsWithId.length; i += batchSize) {
      const slice = channelsWithId.slice(i, i + batchSize);
      await Promise.all(
        slice.map(async (ch) => {
          const uuPlaylistId = `UU${ch.channelId.slice(2)}`;
          try {
            const data = await ytApiFetch(
              `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(
                uuPlaylistId
              )}&maxResults=3`
            );
            (data.items || []).forEach((it) => {
              const vidId = it.contentDetails?.videoId || it.snippet?.resourceId?.videoId;
              if (!vidId) return;
              rawItems.push({
                id: vidId,
                channelHandle: ch.handle,
                channelName: ch.name,
                category: ch.category,
                topic: ch.topic,
                publishedAt: it.snippet?.publishedAt || ''
              });
            });
          } catch {
            // Einzelne leere Upload-Playlists überspringen
          }
        })
      );
    }

    if (rawItems.length === 0) {
      if (els.syncStatusText) els.syncStatusText.textContent = 'Keine neuen Uploads gefunden.';
      updateFeedSyncMetaUi();
      return;
    }

    // Video-Details (Länge & Beschreibung für Kapitel) in 50er-Batches abfragen
    const detailMap = {};
    for (let i = 0; i < rawItems.length; i += 50) {
      const idsChunk = rawItems
        .slice(i, i + 50)
        .map((v) => v.id)
        .join(',');
      const details = await ytApiFetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${encodeURIComponent(idsChunk)}`
      );
      (details.items || []).forEach((d) => {
        detailMap[d.id] = d;
      });
    }

    let importedCount = 0;
    rawItems.forEach((base, idx) => {
      const d = detailMap[base.id];
      if (!d) return;
      const durationSec = parseIsoDuration(d.contentDetails?.duration || '');
      if (durationSec > 0 && durationSec < 60) {
        recordBlockedShort({
          id: base.id,
          title: d.snippet?.title || 'YouTube Short',
          channelName: base.channelName,
          durationSec
        });
        return; // Shorts herausfiltern
      }

      const rawTitle = d.snippet?.title || '';
      const chapters = extractChaptersFromDescription(d.snippet?.description || '');
      const publishedAt = base.publishedAt || d.snippet?.publishedAt || '';
      const videoObj = {
        id: base.id,
        originalTitle: rawTitle,
        calmTitle: calmTitleTransform(rawTitle),
        channelHandle: base.channelHandle,
        channelName: base.channelName,
        durationSec,
        durationText: formatMMSS(durationSec),
        publishedAt,
        publishedText: publishedAt ? new Date(publishedAt).toLocaleDateString('de-DE') : 'Aktuell',
        publishedOrder: -100 + idx,
        category: base.category,
        topic: base.topic,
        qualityScore: 85,
        whyRecommended:
          chapters.length >= 2
            ? 'Live über deinen Account geladen — enthält strukturierte Kapitel.'
            : 'Aktueller Upload aus deinem synchronisierten Abo-Feed.',
        chapters
      };

      const existingIdx = state.videos.findIndex((v) => v.id === videoObj.id);
      if (existingIdx >= 0) {
        state.videos[existingIdx] = { ...state.videos[existingIdx], ...videoObj };
      } else {
        state.videos.unshift(videoObj);
        importedCount += 1;
      }
    });

    state.lastFeedSyncAt = Date.now();
    saveState();
    renderVideoViews();
    updateFeedSyncMetaUi();
    if (els.syncStatusText) {
      els.syncStatusText.textContent = `Fertig! ${importedCount} neue Live-Videos ohne Shorts importiert (${channelsWithId.length} Kanäle geprüft).`;
    }
  } catch (err) {
    if (els.syncStatusText) els.syncStatusText.textContent = err.message;
    if (els.feedSyncMeta) els.feedSyncMeta.textContent = 'Fehler beim Abruf (API Key prüfen)';
  } finally {
    isFeedRefreshing = false;
    setFeedRefreshButtonsLoading(false);
  }
}

async function subscribeChannelViaApiIfPossible(handleOrId) {
  if (!oauthAccessToken) return false;
  if (!handleOrId.startsWith('UC')) return false;
  try {
    const res = await fetch('https://www.googleapis.com/youtube/v3/subscriptions?part=snippet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oauthAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          resourceId: {
            kind: 'youtube#channel',
            channelId: handleOrId
          }
        }
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- OBSIDIAN INTEGRATION (URI + FILE SYSTEM ACCESS API + MARKDOWN) ---
function sanitizeFilename(name = 'FocusTube-Notiz') {
  return String(name)
    .replace(/[\\/:*?"<>|#^\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'FocusTube-Notiz';
}

async function idbPutObsidianDir(handle) {
  if (typeof indexedDB === 'undefined') return;
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('focustube_handles_v1', 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('handles')) {
          req.result.createObjectStore('handles');
        }
      };
      req.onsuccess = () => {
        const tx = req.result.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(handle, 'obsidian_dir');
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      };
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbGetObsidianDir() {
  if (typeof indexedDB === 'undefined') return null;
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('focustube_handles_v1', 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('handles')) {
          req.result.createObjectStore('handles');
        }
      };
      req.onsuccess = () => {
        const tx = req.result.transaction('handles', 'readonly');
        const getReq = tx.objectStore('handles').get('obsidian_dir');
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function buildVideoObsidianMarkdown(video) {
  const title = getDisplayTitle(video);
  const notes = state.notesByVideo[video.id] || [];
  const aiSummary = state.aiSummaries[video.id]?.markdown || '';
  const channelLink = sanitizeFilename(video.channelName || 'Unbekannt');
  const topicTag = String(video.topic || 'wissen')
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/gi, '-')
    .replace(/^-|-$/g, '');

  const lines = [
    `[[YouTube]] · [[${channelLink}]]${topicTag ? ` · #${topicTag}` : ''}`,
    '',
    `https://www.youtube.com/watch?v=${video.id}`,
    ''
  ];

  if (aiSummary) {
    lines.push('## Kernaussagen', '', aiSummary, '');
  }

  if (notes.length > 0) {
    lines.push('## Notizen', '');
    notes.forEach((n) => {
      lines.push(`- [${formatMMSS(n.timeSec)}](https://youtu.be/${video.id}?t=${n.timeSec}) ${n.text}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

function buildAllNotesObsidianMarkdown() {
  const lines = ['[[YouTube]]', '', `# YouTube Lern-Notizen (${getDateKey()})`, ''];

  const allIds = Array.from(
    new Set([...Object.keys(state.notesByVideo), ...Object.keys(state.aiSummaries)])
  );
  allIds.forEach((vidId) => {
    const video = findVideoById(vidId);
    const notes = state.notesByVideo[vidId] || [];
    const ai = state.aiSummaries[vidId]?.markdown || '';
    const chLink = video ? ` · [[${sanitizeFilename(video.channelName || '')}]]` : '';
    lines.push(`## ${video ? getDisplayTitle(video) : vidId}${chLink}`);
    lines.push(`https://www.youtube.com/watch?v=${vidId}`, '');
    if (ai) {
      lines.push(ai, '');
    }
    if (notes.length > 0) {
      notes.forEach((n) => lines.push(`- [${formatMMSS(n.timeSec)}](https://youtu.be/${vidId}?t=${n.timeSec}) ${n.text}`));
      lines.push('');
    }
  });
  return lines.join('\n');
}

function openInObsidianUri(baseFilename, markdownContent, subFolder = '') {
  const rootFolder = (state.obsidianConfig.folder || 'YouTube').replace(/^\/+|\/+$/g, '');
  const cleanSub = subFolder ? sanitizeFilename(subFolder) : '';
  const pathParts = [rootFolder, cleanSub, baseFilename].filter(Boolean);
  const filePath = pathParts.join('/');

  // Wichtig: encodeURIComponent statt URLSearchParams, damit Leerzeichen als %20 statt + ankommen
  const queryParts = [];
  if (state.obsidianConfig.vaultName) {
    queryParts.push(`vault=${encodeURIComponent(state.obsidianConfig.vaultName)}`);
  }
  queryParts.push(`file=${encodeURIComponent(filePath)}`);
  queryParts.push(`content=${encodeURIComponent(markdownContent)}`);

  window.location.href = `obsidian://new?${queryParts.join('&')}`;
}

function downloadMarkdownFile(filename, markdownContent) {
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

async function saveMarkdownToVaultOrDownload(baseFilename, markdownContent) {
  const safeFile = `${sanitizeFilename(baseFilename)}.md`;
  if (obsidianDirHandle) {
    try {
      const perm = await obsidianDirHandle.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        const fileHandle = await obsidianDirHandle.getFileHandle(safeFile, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(markdownContent);
        await writable.close();
        return { method: 'vault', filename: safeFile };
      }
    } catch {
      // Fallback zu Download
    }
  }
  downloadMarkdownFile(safeFile, markdownContent);
  return { method: 'download', filename: safeFile };
}

// --- GEMINI REST API HELPER (DIRECT CORS FROM BROWSER) ---
async function sendGeminiRequest(targetModel, promptText, { expectJson = false, temperature = 0.3, apiKey }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const generationConfig = {
    ...(expectJson ? { responseMimeType: 'application/json' } : {}),
    ...(targetModel.startsWith('gemini-2.') ? { temperature } : {})
  };

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      ...(Object.keys(generationConfig).length > 0 ? { generationConfig } : {})
    })
  });
}

const GEMINI_FALLBACK_ORDER = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash'];

async function callGeminiApi(promptText, { expectJson = false, temperature = 0.3 } = {}) {
  const apiKey = (state.apiConfig.geminiKey || '').trim();
  if (!apiKey) {
    throw new Error('Kein Gemini API Key hinterlegt. Bitte im Modal „⚙ Sync & Filter“ eintragen.');
  }
  const preferred = normalizeGeminiModel(state.apiConfig.geminiModel);
  const candidates = [preferred, ...GEMINI_FALLBACK_ORDER.filter((m) => m !== preferred)];

  let res = null;
  let lastStatus = 0;
  let lastErrText = '';

  for (let i = 0; i < candidates.length; i++) {
    const targetModel = candidates[i];
    res = await sendGeminiRequest(targetModel, promptText, { expectJson, temperature, apiKey });
    if (res.ok) {
      if (i > 0 && res.status === 200 && lastStatus === 404 && targetModel === DEFAULT_GEMINI_MODEL) {
        state.apiConfig.geminiModel = targetModel;
        saveState();
        updateSyncUi();
      }
      break;
    }

    lastStatus = res.status;
    lastErrText = await res.text();
    if (res.status === 404 || res.status === 503 || res.status === 429) {
      if (i < candidates.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
        continue;
      }
    } else {
      break;
    }
  }

  if (!res || !res.ok) {
    throw new Error(`Gemini API Fehler (${lastStatus || res?.status || 0}): ${lastErrText.slice(0, 180)}`);
  }

  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('\n').trim();
  if (!text) {
    throw new Error('Gemini hat keine Antwort geliefert.');
  }

  if (!expectJson) return text;

  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

function renderAiSummaryBox(videoId) {
  if (!els.aiSummaryOutput) return;
  const saved = state.aiSummaries[videoId];
  if (!saved || !saved.markdown) {
    els.aiSummaryOutput.classList.add('hidden');
    els.aiSummaryOutput.textContent = '';
    return;
  }
  els.aiSummaryOutput.textContent = saved.markdown;
  els.aiSummaryOutput.classList.remove('hidden');
}

async function generateAiSummaryForActiveVideo() {
  if (!activeVideoId) return;
  const video = findVideoById(activeVideoId);
  if (!video) return;

  const extraInput = (els.aiTranscriptInput?.value || '').trim();
  const notes = (state.notesByVideo[video.id] || []).map((n) => `[${formatMMSS(n.timeSec)}] ${n.text}`).join('\n');
  const chapters = (video.chapters || []).map((c) => `[${formatMMSS(c.timeSec)}] ${c.label}`).join('\n');

  els.btnAiSummarize.disabled = true;
  els.btnAiSummarize.textContent = '⏳ Gemini analysiert…';

  try {
    const prompt = [
      'Du bist ein präziser Lern-Assistent. Erstelle auf Deutsch eine extrem informationsdichte, sachliche Lernnotiz für Obsidian (Markdown, kein Smalltalk).',
      `Videotitel: ${video.originalTitle || video.calmTitle}`,
      `Kanal: ${video.channelName}`,
      `Thema: ${video.topic}`,
      `Länge: ${video.durationText || formatMMSS(video.durationSec)}`,
      video.description ? `Beschreibung:\n${video.description.slice(0, 2000)}` : '',
      chapters ? `Kapitel:\n${chapters}` : '',
      notes ? `Meine Zeitstempel-Notizen:\n${notes}` : '',
      extraInput ? `Vom Nutzer eingefügtes Transkript / Stichpunkte:\n${extraInput.slice(0, 14000)}` : '',
      '',
      'Formatiere exakt mit diesen drei Abschnitten:',
      '### Kernaussagen (max. 5 dichte Bulletpoints)',
      '### Mentale Modelle / Konkrete Anwendung',
      '### Active-Recall-Check (2 Verständnisfragen ohne Lösung, um selbst nachzudenken)'
    ]
      .filter(Boolean)
      .join('\n');

    const md = await callGeminiApi(prompt, { expectJson: false, temperature: 0.25 });
    state.aiSummaries[video.id] = {
      markdown: md,
      updatedAt: new Date().toISOString()
    };
    saveState();
    renderAiSummaryBox(video.id);
  } catch (err) {
    els.aiSummaryOutput.textContent = err.message;
    els.aiSummaryOutput.classList.remove('hidden');
  } finally {
    els.btnAiSummarize.disabled = false;
    els.btnAiSummarize.textContent = '✨ Kernaussagen für Obsidian generieren';
  }
}

// --- WISSENS-ENTDECKER (GEMINI + YOUTUBE DISCOVERY AUSSERHALB DER ABOS) ---
function renderDiscoverGoalPills() {
  if (!els.discoverGoalPills) return;
  els.discoverGoalPills.innerHTML = getAllGoals()
    .map(
      (g) => `<button type="button" class="goal-chip" data-discover-goal="${escapeHtml(g.label)}">${escapeHtml(g.label)}</button>`
    )
    .join('');

  els.discoverGoalPills.querySelectorAll('[data-discover-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      els.discoverQueryInput.value = btn.dataset.discoverGoal;
      runKnowledgeDiscovery();
    });
  });
}

function setDiscoverStatus(html, isVisible = true) {
  if (!els.discoverStatusBox) return;
  els.discoverStatusBox.innerHTML = html;
  els.discoverStatusBox.classList.toggle('hidden', !isVisible);
}

function renderDiscoveryResults() {
  if (!els.discoverResultsGrid) return;
  const watchedSet = new Set(state.watchedIds || []);
  const list = (state.discoveryResults || []).filter((v) => !watchedSet.has(v.id));
  if (els.statDiscoverCount) els.statDiscoverCount.textContent = String(list.length);
  if (els.statDiscoverBlocked) els.statDiscoverBlocked.textContent = String((state.blockedDiscoveryChannels || []).length);

  if (list.length === 0) {
    els.discoverResultsGrid.innerHTML = `
      <div class="panel-card">
        <h3>Noch keine Discovery-Suche gestartet</h3>
        <p class="panel-hint">
          Gib oben ein Thema ein oder klicke auf ein Lernziel. Gemini sucht &amp; bewertet maximal 5 kompakte, informationsdichte Videos außerhalb deiner Abos — ohne Endlos-Scrollen.
        </p>
      </div>
    `;
    return;
  }

  els.discoverResultsGrid.innerHTML = list
    .map((v) => {
      const title = getDisplayTitle(v);
      const thumbUrl = v.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg`;
      const isAlreadySub = state.channels.some(
        (c) =>
          (v.channelId && c.channelId === v.channelId) ||
          c.name.toLowerCase() === (v.channelName || '').toLowerCase()
      );

      return `
        <article class="video-card" data-discover-id="${escapeHtml(v.id)}">
          <div class="video-thumb" data-play-video="${escapeHtml(v.id)}">
            <img src="${thumbUrl}" alt="${escapeHtml(title)}" loading="lazy" />
            <span class="score-badge">Dichte ${v.aiDensityScore ?? v.focusScore ?? 85}</span>
            <span class="duration-badge">${escapeHtml(v.durationText || formatMMSS(v.durationSec))}</span>
            ${renderThumbProgressHtml(v)}
          </div>
          <div class="video-body">
            <div class="video-meta-top">
              <span class="density-tag">${escapeHtml(v.densityTag || 'Kompakt & dicht')}</span>
              <span>${escapeHtml(v.topic || 'Wissen')}</span>
            </div>
            <h3 class="video-title" data-play-video="${escapeHtml(v.id)}">${escapeHtml(title)}</h3>
            <p class="video-reason">${escapeHtml(v.whyRecommended || '')}</p>
            <div class="video-footer">
              <span><strong>${escapeHtml(v.channelName)}</strong> · ${escapeHtml(v.publishedText || '')}</span>
            </div>
            <div class="discover-card-actions">
              <button class="btn btn-primary" data-play-video="${escapeHtml(v.id)}">▶ Im Schutzschild</button>
              <button class="btn btn-secondary" data-sub-discover="${escapeHtml(v.id)}" ${isAlreadySub ? 'disabled' : ''}>
                ${isAlreadySub ? '✓ In deinen Abos' : '+ Lern-Kanal'}
              </button>
              <button class="btn btn-ghost" data-block-discover="${escapeHtml(v.channelHandle)}" title="Kanal dauerhaft aus Entdeckungen ausblenden">
                ✕
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  attachVideoCardHandlers(els.discoverResultsGrid);

  els.discoverResultsGrid.querySelectorAll('[data-sub-discover]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const v = (state.discoveryResults || []).find((item) => item.id === btn.dataset.subDiscover);
      if (!v) return;
      const handle = v.channelId || v.channelHandle;
      const exists = state.channels.some((c) => c.channelId === v.channelId || c.handle === handle);
      if (!exists) {
        state.channels.unshift({
          handle,
          channelId: v.channelId,
          name: v.channelName,
          category: 'learning',
          topic: v.topic || 'Wissen & Fokus',
          qualityBase: Math.min(95, Math.max(78, v.aiDensityScore || 84)),
          description: 'Über Wissens-Entdecker als Lern-Kanal hinzugefügt'
        });
        if (v.channelId) {
          await subscribeChannelViaApiIfPossible(v.channelId);
        }
      }
      if (!state.videos.some((item) => item.id === v.id)) {
        state.videos.unshift({ ...v, isDiscovery: false, category: 'learning' });
      }
      saveState();
      renderChannelManager();
      renderFeedChannelFilter();
      renderVideoViews();
      renderDiscoveryResults();
    });
  });

  els.discoverResultsGrid.querySelectorAll('[data-block-discover]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chKey = btn.dataset.blockDiscover;
      if (chKey && !state.blockedDiscoveryChannels.includes(chKey)) {
        state.blockedDiscoveryChannels.push(chKey);
      }
      state.discoveryResults = (state.discoveryResults || []).filter((v) => v.channelHandle !== chKey);
      saveState();
      renderDiscoveryResults();
    });
  });
}

async function generateDiscoveryQueriesWithGemini(topic, lengthPref, langPref) {
  const lengthHint =
    lengthPref === 'compact'
      ? 'kompakte, hochdichte Erklärvideos (ca. 6–20 Min., keine stundenlangen Vorträge/Podcasts)'
      : lengthPref === 'medium'
      ? 'strukturierte Deep-Dives (ca. 15–35 Min.)'
      : 'hochwertige Fachvideos';
  const langHint =
    langPref === 'de' ? 'nur deutsche Suchbegriffe' : langPref === 'en' ? 'nur englische Suchbegriffe' : '1 deutscher und 1–2 englische Suchbegriffe';

  const prompt = [
    `Erstelle 2 bis 3 präzise YouTube-Suchanfragen zum Thema: "${topic}".`,
    `Ziel: Ein guter Mix aus spannenden, gerne auch unterhaltsam erzählten Wissensvideos, Video-Essays, visuellen Erklärungen und fundierten Analysen (${lengthHint}) von ECHTEN menschlichen Creatorn — also nicht nur trockene Vorlesungen, aber ohne KI-Sprecher/Faceless-AI und ohne leeres Clickbait.`,
    `Sprache: ${langHint}.`,
    'Vermeide Begriffe wie "schnell reich", "krass", "reagiert", "top 10", "podcast clips", "everything you need to know". Nutze je nach Thema Suchbegriffe, die sowohl lebendige Creator/Essays (z. B. "story", "explained", "how", "doku", "deep dive") als auch konkrete Mechanismen/Fallbeispiele abdecken.',
    'Antworte ausschließlich als JSON-Objekt: {"queries": ["...", "..."], "focusAngle": "kurzer Satz was geprüft wird"}'
  ].join('\n');

  const parsed = await callGeminiApi(prompt, { expectJson: true, temperature: 0.3 });
  const queries = Array.isArray(parsed?.queries) ? parsed.queries.filter(Boolean).slice(0, 3) : [];
  return {
    queries: queries.length > 0 ? queries : [topic],
    focusAngle: parsed?.focusAngle || ''
  };
}

async function scoreDiscoveryCandidatesWithGemini(topic, candidates, lengthPref) {
  const compactList = candidates.map((c) => ({
    id: c.id,
    title: c.originalTitle,
    channel: c.channelName,
    minutes: Math.round(c.durationSec / 60),
    chaptersCount: c.chapters.length,
    likeRatioPercent: c.likeRatioPercent,
    tags: Array.isArray(c.tags) ? c.tags.slice(0, 8) : [],
    descExcerpt: (c.description || '').slice(0, 700)
  }));

  const lengthPreferenceText =
    lengthPref === 'compact'
      ? 'Der Nutzer bevorzugt ausdrücklich kompakte Videos mit hoher Informationsdichte (Idealbereich: 6–22 Min.) gegenüber unnötig langen 60–90-Minuten-Vorträgen.'
      : 'Der Nutzer schätzt strukturierte Erklärungen mit hoher Informationsdichte pro Minute.';

  const prompt = [
    `Bewerte diese realen YouTube-Videos für das Thema "${topic}".`,
    lengthPreferenceText,
    'GUTER MIX STATT NUR TROCKENE VORTRÄGE:',
    '- Videos dürfen ausdrücklich unterhaltsam, gut geschnitten, witzig oder stark erzählt sein (gutes Storytelling / Edutainment), SOLANGE ein echter Mehrwert und konkretes Wissen hängen bleiben.',
    '- Bevorzuge einen ausgewogenen Mix aus mitreißenden Video-Essays, Praxisbeispielen und tiefen Analysen — nicht bloß akademische Frontalvorträge.',
    'EXTREM WICHTIG — KI-SPRECHER & FACELESS-AI AUSSORTIEREN:',
    '- Der Nutzer HASST Videos mit KI-Sprecher / Text-to-Speech (z. B. ElevenLabs, NotebookLM, Synthesia, InVideo) oder automatisierte Faceless-AI-Massenware — selbst dann, wenn das Video faktisch dicht klingt oder viele Kapitel hat!',
    '- Setze isAiVoiceOrSlop: true bei jedem Video, dessen Titel, Kanalname, Tags oder Beschreibung nach KI-Sprecher, generischer AI-Zusammenfassung, Content-Farm oder fehlender menschlicher Autorenschaft aussieht.',
    '- Sortiere außerdem hohles Clickbait ohne Substanz, reine Verkaufs-Funnels und unnötig gestreckte Laber-Videos aus (isClickbait: true).',
    'Antworte ausschließlich als JSON-Array mit einem Objekt pro Video-ID:',
    '[{"id": "...", "densityScore": 0-99, "humanAuthenticityScore": 0-99, "isClickbait": true|false, "isAiVoiceOrSlop": true|false, "densityTag": "z.B. Stark erzählt · 14 Min.", "reason": "1 ruhiger deutscher Satz, was man mitnimmt und warum der Stil passt"}]',
    '',
    JSON.stringify(compactList)
  ].join('\n');

  const scored = await callGeminiApi(prompt, { expectJson: true, temperature: 0.2 });
  return Array.isArray(scored) ? scored : [];
}

async function runKnowledgeDiscovery() {
  const topic = (els.discoverQueryInput?.value || '').trim();
  if (!topic) {
    setDiscoverStatus('Bitte gib zuerst ein Thema oder eine Lernfrage ein (z. B. „Yield Curve“, „Faszien“ oder „Spieltheorie“).');
    return;
  }

  const lengthPref = els.discoverLengthPref?.value || 'compact';
  const langPref = els.discoverLangPref?.value || 'all';
  const hasYtAuth = Boolean(oauthAccessToken || (state.apiConfig.apiKey || '').trim());
  const hasGemini = Boolean((state.apiConfig.geminiKey || '').trim());

  if (!hasYtAuth) {
    if (hasGemini) {
      els.btnRunDiscovery.disabled = true;
      els.btnRunDiscovery.textContent = '⏳ Gemini plant Lernpfad…';
      try {
        const plan = await callGeminiApi(
          `Der Nutzer möchte zum Thema "${topic}" hochdichte, kompakte Wissensvideos (6–22 Min., kein Clickbait) entdecken, hat aber in FocusTube noch keinen YouTube Data API v3 Key hinterlegt. Gib 4 konkrete, fachlich präzise Suchbegriffe + eine kurze Checkliste (woran man beim Thema Informationsdichte erkennt) als JSON: {"queries": ["..."], "checklist": "..."}`,
          { expectJson: true }
        );
        const pills = (plan.queries || [])
          .map(
            (q) =>
              `<a class="discover-query-pill" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}" target="_blank" rel="noopener">🔎 ${escapeHtml(q)} ↗</a>`
          )
          .join('');
        setDiscoverStatus(
          `<strong>Gemini Suchstrategie bereit — YouTube API Key fehlt noch für die direkte Video-Liste:</strong><br/>` +
            `${escapeHtml(plan.checklist || '')}<div class="discover-query-pills">${pills}</div>` +
            `<p style="margin:8px 0 0;">Tipp: Hinterlege unter <strong>🔗 Sync, Gemini &amp; Obsidian</strong> noch deinen kostenlosen YouTube Data API v3 Key (im selben Google Cloud Projekt wie Gemini), dann lädt FocusTube die Top 5 Videos direkt hier in den Schutzschild-Player.</p>`
        );
      } catch (err) {
        setDiscoverStatus(`<strong>Fehler:</strong> ${escapeHtml(err.message)}`);
      } finally {
        els.btnRunDiscovery.disabled = false;
        els.btnRunDiscovery.textContent = '✨ Mit Gemini entdecken';
      }
      return;
    }

    setDiscoverStatus(
      '<strong>API-Keys benötigt:</strong> Um neue Videos außerhalb deiner Abos live abzurufen und per Gemini zu filtern, trage im Modal <strong>🔗 Sync, Gemini &amp; Obsidian</strong> deinen kostenlosen <strong>Gemini API Key</strong> und deinen <strong>YouTube Data API v3 Key</strong> (oder Google Login) ein.'
    );
    return;
  }

  const cacheKey = `${topic.toLowerCase()}|${lengthPref}|${langPref}|${hasGemini ? 'ai' : 'noai'}|${state.filterAiSlop ? 'noai_voice_v3' : 'all_v3'}`;
  const cached = state.discoveryCache?.[cacheKey];
  if (cached && Date.now() - cached.ts < 12 * 60 * 60 * 1000) {
    state.discoveryResults = cached.results;
    saveState();
    renderDiscoveryResults();
    setDiscoverStatus(
      `<strong>Aus dem 12h-Cache geladen (0 Quota-Units verbraucht):</strong> Top ${cached.results.length} Videos für „${escapeHtml(topic)}“.` +
        `<div class="discover-query-pills">${(cached.queries || []).map((q) => `<span class="discover-query-pill">${escapeHtml(q)}</span>`).join('')}</div>`
    );
    return;
  }

  els.btnRunDiscovery.disabled = true;
  els.btnRunDiscovery.textContent = '⏳ Gemini & YouTube suchen…';

  try {
    let queries = [topic];
    let focusAngle = '';
    let geminiFallbackReason = '';

    if (hasGemini) {
      setDiscoverStatus('⏳ <strong>Schritt 1/3:</strong> Gemini formuliert Anti-Clickbait-Fachsuchanfragen…');
      try {
        const expanded = await generateDiscoveryQueriesWithGemini(topic, lengthPref, langPref);
        queries = expanded.queries;
        focusAngle = expanded.focusAngle;
      } catch (gemErr) {
        geminiFallbackReason = gemErr.message || 'Gemini temporär nicht erreichbar';
      }
    }

    setDiscoverStatus(
      `⏳ <strong>Schritt 2/3:</strong> Suche reale YouTube-Videos ohne Shorts…<div class="discover-query-pills">${queries
        .map((q) => `<span class="discover-query-pill">${escapeHtml(q)}</span>`)
        .join('')}</div>`
    );

    const ytDurationParam = lengthPref === 'compact' ? 'medium' : 'any';
    const langParam = langPref === 'de' || langPref === 'en' ? `&relevanceLanguage=${langPref}` : '';
    const subChannelIds = new Set(state.channels.map((c) => c.channelId).filter(Boolean));
    const subChannelNames = new Set(state.channels.map((c) => (c.name || '').toLowerCase()));
    const blockedSet = new Set(state.blockedDiscoveryChannels || []);

    const foundMap = new Map();
    for (const q of queries.slice(0, 2)) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&videoDuration=${ytDurationParam}${langParam}&maxResults=12&q=${encodeURIComponent(
        q
      )}`;
      const searchData = await ytApiFetch(searchUrl);
      (searchData.items || []).forEach((item) => {
        const vidId = item.id?.videoId;
        const snip = item.snippet;
        if (!vidId || !snip) return;
        if ((state.watchedIds || []).includes(vidId)) return;
        const chId = snip.channelId || '';
        const chTitle = snip.channelTitle || '';
        if (subChannelIds.has(chId) || subChannelNames.has(chTitle.toLowerCase())) return;
        if (blockedSet.has(chId) || blockedSet.has(chTitle)) return;
        if (!foundMap.has(vidId)) {
          foundMap.set(vidId, {
            id: vidId,
            channelId: chId,
            channelHandle: chId || chTitle,
            channelName: chTitle
          });
        }
      });
    }

    const candidateIds = Array.from(foundMap.keys()).slice(0, 20);
    if (candidateIds.length === 0) {
      setDiscoverStatus('Keine neuen Kanäle außerhalb deiner Abos zu diesem Begriff gefunden. Versuche einen etwas breiteren Fachbegriff.');
      state.discoveryResults = [];
      renderDiscoveryResults();
      return;
    }

    const detailsData = await ytApiFetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(candidateIds.join(','))}`
    );

    let candidates = (detailsData.items || [])
      .map((d) => {
        const durationSec = parseIsoDuration(d.contentDetails?.duration || '');
        const rawTitle = d.snippet?.title || '';
        const desc = d.snippet?.description || '';
        const chapters = extractChaptersFromDescription(desc);
        const views = parseInt(d.statistics?.viewCount || '0', 10);
        const likes = parseInt(d.statistics?.likeCount || '0', 10);
        const likeRatioPercent = views > 0 ? Number(((likes / views) * 100).toFixed(2)) : 0;

        return {
          id: d.id,
          originalTitle: rawTitle,
          calmTitle: calmTitleTransform(rawTitle),
          channelId: d.snippet?.channelId || '',
          channelHandle: d.snippet?.channelId || d.snippet?.channelTitle || '',
          channelName: d.snippet?.channelTitle || 'Unbekannt',
          durationSec,
          durationText: formatMMSS(durationSec),
          publishedText: d.snippet?.publishedAt ? new Date(d.snippet.publishedAt).toLocaleDateString('de-DE') : '',
          category: 'learning',
          topic,
          description: desc,
          tags: Array.isArray(d.snippet?.tags) ? d.snippet.tags.slice(0, 12) : [],
          chapters,
          likeRatioPercent,
          isDiscovery: true
        };
      })
      .filter((v) => {
        if ((state.watchedIds || []).includes(v.id)) return false;
        if (v.durationSec > 0 && v.durationSec < 60) {
          recordBlockedShort({
            id: v.id,
            title: v.originalTitle,
            channelName: v.channelName,
            durationSec: v.durationSec
          });
          return false;
        }
        if (v.durationSec < 240) return false; // < 4 Min. herausfiltern (Shorts & Snippets)
        if (state.filterAiSlop && detectAiVoiceSignals(v).isExplicitAi) return false;
        if (lengthPref === 'compact' && v.durationSec > 1680) return false; // > 28 Min. herausfiltern bei Kompakt-Präferenz
        if (lengthPref === 'medium' && v.durationSec > 2700) return false;
        return true;
      });

    if (candidates.length === 0) {
      setDiscoverStatus('Treffer waren entweder unter 4 Minuten, länger als dein Zeitfenster oder enthielten KI-Sprecher-Signale. Probiere einen anderen Begriff oder „Strukturiert (15–35 Min.)“.');
      return;
    }

    if (hasGemini && !geminiFallbackReason) {
      setDiscoverStatus('⏳ <strong>Schritt 3/3:</strong> Gemini prüft Informationsdichte, menschliche Authentizität &amp; filtert KI-Sprecher/Clickbait aus…');
      try {
        const aiScores = await scoreDiscoveryCandidatesWithGemini(topic, candidates.slice(0, 12), lengthPref);
        const scoreMap = {};
        aiScores.forEach((s) => {
          if (s && s.id) scoreMap[s.id] = s;
        });

        candidates = candidates
          .map((c) => {
            const ai = scoreMap[c.id];
            if (ai?.isClickbait) return null;
            if (state.filterAiSlop && ai?.isAiVoiceOrSlop) return null;
            const baseDensity = typeof ai?.densityScore === 'number' ? ai.densityScore : computeFocusScore(c);
            const humanScore = typeof ai?.humanAuthenticityScore === 'number' ? ai.humanAuthenticityScore : baseDensity;
            const combinedScore = state.filterAiSlop
              ? Math.round(baseDensity * 0.6 + humanScore * 0.4) - detectAiVoiceSignals(c).suspicionScore
              : baseDensity;
            return {
              ...c,
              aiDensityScore: Math.max(0, combinedScore),
              focusScore: Math.max(0, combinedScore),
              densityTag: ai?.densityTag || `Dichte ${baseDensity}`,
              whyRecommended: ai?.reason || 'Durch Gemini-Informationsdichte-Filter ausgewählt.'
            };
          })
          .filter(Boolean);
      } catch (gemErr) {
        geminiFallbackReason = gemErr.message || 'Gemini temporär überlastet';
      }
    }

    if (!hasGemini || geminiFallbackReason) {
      candidates = candidates.map((c) => {
        const s = computeFocusScore(c);
        return {
          ...c,
          aiDensityScore: s,
          focusScore: s,
          densityTag: c.chapters.length >= 2 ? `${c.chapters.length} Kapitel · ${Math.round(c.durationSec / 60)} Min.` : `${Math.round(c.durationSec / 60)} Min.`,
          whyRecommended: `Like-Quote ${c.likeRatioPercent}% · ${c.chapters.length} Kapitel · Anti-Clickbait & KI-Filter geprüft.`
        };
      });
    }

    candidates.sort((a, b) => (b.aiDensityScore || 0) - (a.aiDensityScore || 0));
    const top5 = candidates.slice(0, 5);

    state.discoveryResults = top5;
    if (!geminiFallbackReason) {
      state.discoveryCache[cacheKey] = { ts: Date.now(), queries, results: top5 };
    }
    saveState();
    renderDiscoveryResults();

    setDiscoverStatus(
      (geminiFallbackReason
        ? `<strong>${top5.length} Videos direkt über YouTube &amp; lokalen Filter geladen</strong> (Google Gemini meldete temporäre Überlastung — nächster Versuch nutzt Gemini automatisch wieder)`
        : `<strong>${top5.length} Videos außerhalb deiner Abos kuratiert</strong>` + (focusAngle ? ` — ${escapeHtml(focusAngle)}` : '')) +
        `<div class="discover-query-pills">${queries.map((q) => `<span class="discover-query-pill">${escapeHtml(q)}</span>`).join('')}</div>`
    );
  } catch (err) {
    setDiscoverStatus(`<strong>Discovery-Fehler:</strong> ${escapeHtml(err.message)}`);
  } finally {
    els.btnRunDiscovery.disabled = false;
    els.btnRunDiscovery.textContent = '✨ Mit Gemini entdecken';
  }
}

function extractYoutubeIdFromUrl(raw = '') {
  const input = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  try {
    const u = new URL(input);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '').slice(0, 11);
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = u.searchParams.get('v');
    if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    const parts = u.pathname.split('/').filter(Boolean);
    if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') && /^[A-Za-z0-9_-]{11}$/.test(parts[1] || '')) {
      return parts[1];
    }
  } catch {
    return null;
  }
  return null;
}

async function openDirectYoutubeUrl(overrideUrl = null) {
  const raw = (overrideUrl !== null ? String(overrideUrl) : els.discoverDirectUrl?.value || '').trim();
  const vidId = extractYoutubeIdFromUrl(raw);
  if (!vidId) {
    setDiscoverStatus('Bitte einen gültigen YouTube-Link (youtube.com/watch?v=… oder youtu.be/…) einfügen.');
    return;
  }

  let video = findVideoById(vidId);
  if (!video) {
    video = {
      id: vidId,
      originalTitle: `Direktes Lernvideo (${vidId})`,
      calmTitle: `Direktes Lernvideo (${vidId})`,
      channelHandle: '@external',
      channelName: 'Externer Link',
      durationSec: 0,
      durationText: '--:--',
      publishedText: 'Direktlink',
      category: 'learning',
      topic: 'Direktimport',
      chapters: [],
      isDiscovery: true
    };

    if (oauthAccessToken || (state.apiConfig.apiKey || '').trim()) {
      try {
        const data = await ytApiFetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(vidId)}`
        );
        const d = data.items?.[0];
        if (d) {
          const durationSec = parseIsoDuration(d.contentDetails?.duration || '');
          const rawTitle = d.snippet?.title || video.originalTitle;
          video = {
            ...video,
            originalTitle: rawTitle,
            calmTitle: calmTitleTransform(rawTitle),
            channelId: d.snippet?.channelId || '',
            channelHandle: d.snippet?.channelId || d.snippet?.channelTitle || '@external',
            channelName: d.snippet?.channelTitle || 'Externer Kanal',
            durationSec,
            durationText: formatMMSS(durationSec),
            description: d.snippet?.description || '',
            chapters: extractChaptersFromDescription(d.snippet?.description || '')
          };
        }
      } catch {
        // Fallback: direkt im Schutzschild öffnen
      }
    }

    state.discoveryResults = [video, ...(state.discoveryResults || []).filter((v) => v.id !== vidId)].slice(0, 5);
    saveState();
    renderDiscoveryResults();
  }

  els.discoverDirectUrl.value = '';
  openVideoInWorkspace(vidId);
}

// --- EVENT LISTENER & INITIALISIERUNG ---
function bindEvents() {
  if (els.btnBrandHome) {
    els.btnBrandHome.addEventListener('click', () => {
      if (activeVideoId) closePlayerWorkspace();
      if (els.globalSearchInput) els.globalSearchInput.value = '';
      if (els.algoSearchInput) els.algoSearchInput.value = '';
      setTab('algorithm');
      renderVideoViews();
    });
  }

  if (els.globalSearchInput) {
    els.globalSearchInput.addEventListener('input', () => {
      if (els.algoSearchInput) els.algoSearchInput.value = els.globalSearchInput.value;
      renderVideoViews();
    });
  }

  if (els.globalSearchForm) {
    els.globalSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = (els.globalSearchInput?.value || '').trim();
      if (!q) return;
      if (extractYoutubeIdFromUrl(q)) {
        await openDirectYoutubeUrl(q);
        els.globalSearchInput.value = '';
        if (els.algoSearchInput) els.algoSearchInput.value = '';
        return;
      }
      if (els.discoverQueryInput) els.discoverQueryInput.value = q;
      setTab('discover');
      runKnowledgeDiscovery();
    });
  }

  els.btnModeLearning.addEventListener('click', () => setMode('learning'));
  els.btnModeEntertainment.addEventListener('click', () => setMode('entertainment'));

  els.navTabs.forEach((tab) => {
    tab.addEventListener('click', () => setTab(tab.dataset.tab));
  });

  // Manueller Live-Timer Start/Pause
  const toggleManualTimer = () => {
    if (isEntertainmentLocked() && !manualTimerActive) {
      alert('Unterhaltungs-Budget für heute bereits verbraucht.');
      return;
    }
    manualTimerActive = !manualTimerActive;
    updateTimerUI();
  };
  if (els.liveTimerPill) els.liveTimerPill.addEventListener('click', toggleManualTimer);
  if (els.btnDashTimerToggle) els.btnDashTimerToggle.addEventListener('click', toggleManualTimer);

  // Anti-Dopamin Quick-Toggles
  els.toggleCalmTitles.checked = state.calmTitles;
  els.toggleCalmThumbs.checked = state.calmThumbnails;
  els.toggleFloodBrake.checked = state.floodBrake;
  if (els.toggleFilterAi) els.toggleFilterAi.checked = state.filterAiSlop;
  els.toggleHideWatched.checked = state.hideWatched;
  if (els.algoDensityMode) els.algoDensityMode.value = state.densityPreference || 'dense';
  els.body.classList.toggle('calm-thumbnails', state.calmThumbnails);

  els.toggleCalmTitles.addEventListener('change', () => {
    state.calmTitles = els.toggleCalmTitles.checked;
    saveState();
    renderVideoViews();
    renderDiscoveryResults();
    if (activeVideoId) {
      const v = findVideoById(activeVideoId);
      if (v) els.playerVideoTitle.textContent = getDisplayTitle(v);
    }
  });

  els.toggleCalmThumbs.addEventListener('change', () => {
    state.calmThumbnails = els.toggleCalmThumbs.checked;
    els.body.classList.toggle('calm-thumbnails', state.calmThumbnails);
    saveState();
  });

  els.toggleFloodBrake.addEventListener('change', () => {
    state.floodBrake = els.toggleFloodBrake.checked;
    saveState();
    renderVideoViews();
  });

  if (els.toggleFilterAi) {
    els.toggleFilterAi.addEventListener('change', () => {
      state.filterAiSlop = els.toggleFilterAi.checked;
      saveState();
      renderVideoViews();
    });
  }

  els.toggleHideWatched.addEventListener('change', () => {
    state.hideWatched = els.toggleHideWatched.checked;
    saveState();
    renderVideoViews();
  });

  // Lernziele, Informationsdichte & Suche
  els.btnResetGoals.addEventListener('click', () => {
    state.activeGoals = getAllGoals().map((g) => g.id);
    saveState();
    renderLearningGoals();
    renderVideoViews();
  });

  if (els.btnToggleAddGoal && els.formAddGoal) {
    els.btnToggleAddGoal.addEventListener('click', () => {
      const hidden = els.formAddGoal.classList.toggle('hidden');
      if (!hidden && els.inputNewGoal) els.inputNewGoal.focus();
    });
  }

  if (els.formAddGoal) {
    els.formAddGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = (els.inputNewGoal?.value || '').trim();
      if (!raw) return;
      if (addCustomGoal(raw)) {
        els.inputNewGoal.value = '';
        els.formAddGoal.classList.add('hidden');
        renderLearningGoals();
        renderDiscoverGoalPills();
        renderGoalTopicsDatalist();
        renderVideoViews();
      }
    });
  }

  if (els.btnResetStats) {
    els.btnResetStats.addEventListener('click', () => {
      state.dailyLogs = {
        [getDateKey()]: { learningSec: 0, entertainmentSec: 0 }
      };
      state.blockedShorts = [];
      saveState();
      updateTimerUI();
      renderDashboard();
      renderVideoViews();
    });
  }

  if (els.algoDensityMode) {
    els.algoDensityMode.addEventListener('change', () => {
      state.densityPreference = els.algoDensityMode.value;
      saveState();
      renderVideoViews();
    });
  }

  els.algoSearchInput.addEventListener('input', renderVideoViews);
  els.algoDurationFilter.addEventListener('change', renderVideoViews);
  els.feedChannelFilter.addEventListener('change', renderVideoViews);

  // Wissens-Entdecker Events
  if (els.btnRunDiscovery) {
    els.btnRunDiscovery.addEventListener('click', runKnowledgeDiscovery);
  }
  if (els.discoverQueryInput) {
    els.discoverQueryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runKnowledgeDiscovery();
      }
    });
  }
  if (els.btnOpenDirectUrl) {
    els.btnOpenDirectUrl.addEventListener('click', () => openDirectYoutubeUrl());
  }

  // Player & Schutzschild Controls
  els.playerShield.addEventListener('click', () => {
    showPlayerControlsTemporarily();
    togglePlayPause();
  });
  if (els.playerStage) {
    ['pointermove', 'mousemove', 'touchstart', 'pointerdown'].forEach((evt) => {
      els.playerStage.addEventListener(evt, showPlayerControlsTemporarily, { passive: true });
    });
  }
  if (els.customControls) {
    els.customControls.addEventListener('pointerenter', () => {
      isControlsHovered = true;
      clearControlsHideTimer();
    });
    els.customControls.addEventListener('pointerleave', () => {
      isControlsHovered = false;
      scheduleControlsHide();
    });
    ['input', 'change', 'click'].forEach((evt) => {
      els.customControls.addEventListener(evt, showPlayerControlsTemporarily);
    });
  }
  els.ctrlPlayPause.addEventListener('click', togglePlayPause);
  els.ctrlBack15.addEventListener('click', () => seekRelative(-15));
  els.ctrlFwd15.addEventListener('click', () => seekRelative(15));

  els.ctrlScrubber.addEventListener('input', () => {
    if (!ytPlayer || typeof ytPlayer.seekTo !== 'function') return;
    const duration = ytPlayer.getDuration() || lastVideoDuration || 0;
    const target = (parseFloat(els.ctrlScrubber.value) / 100) * duration;
    endScreenTriggered = false;
    ytPlayer.seekTo(target, true);
    els.ctrlCurrentTime.textContent = formatMMSS(target);
    if (activeVideoId) {
      savePlaybackProgress(activeVideoId, target, duration, true);
    }
  });

  window.addEventListener('pagehide', () => saveActiveVideoProgress(true));
  window.addEventListener('beforeunload', () => saveActiveVideoProgress(true));

  els.ctrlMute.addEventListener('click', () => {
    if (!ytPlayer || typeof ytPlayer.isMuted !== 'function') return;
    if (ytPlayer.isMuted()) {
      ytPlayer.unMute();
      els.ctrlMute.textContent = '🔊 Ton';
    } else {
      ytPlayer.mute();
      els.ctrlMute.textContent = '🔇 Stumm';
    }
  });

  updateCaptionsUi();
  if (els.ctrlCaptions) {
    els.ctrlCaptions.addEventListener('click', () => {
      state.playerPrefs.captionsEnabled = !state.playerPrefs.captionsEnabled;
      saveState();
      updateCaptionsUi();
      applyCaptionsSetting(ytPlayer);
    });
  }

  if (els.ctrlQuality) {
    els.ctrlQuality.value = state.playerPrefs?.quality || 'default';
    els.ctrlQuality.addEventListener('change', () => {
      state.playerPrefs.quality = els.ctrlQuality.value || 'default';
      saveState();
      applyQualitySetting(ytPlayer);
    });
  }

  els.speedButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playbackRate = parseFloat(btn.dataset.speed || '1');
      els.speedButtons.forEach((b) => b.classList.toggle('active', b === btn));
      if (ytPlayer && typeof ytPlayer.setPlaybackRate === 'function') {
        ytPlayer.setPlaybackRate(playbackRate);
      }
    });
  });

  els.ctrlFullscreen.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (els.playerStage.requestFullscreen) {
      els.playerStage.requestFullscreen().catch(() => {});
    }
  });

  els.btnClosePlayer.addEventListener('click', closePlayerWorkspace);
  els.btnToggleWatched.addEventListener('click', () => markVideoWatched(activeVideoId));

  // Overlay Buttons
  els.btnOverlayResume.addEventListener('click', togglePlayPause);
  els.btnOverlayBack.addEventListener('click', closePlayerWorkspace);
  els.btnOverlaySaveNote.addEventListener('click', () => {
    addNoteForActiveVideo(els.overlayQuickNote.value);
    els.overlayQuickNote.value = '';
  });

  // Companion Note Composer + Obsidian + Gemini AI
  els.btnSaveCompanionNote.addEventListener('click', () => {
    addNoteForActiveVideo(els.companionNoteInput.value);
    els.companionNoteInput.value = '';
  });

  if (els.btnAiSummarize) {
    els.btnAiSummarize.addEventListener('click', generateAiSummaryForActiveVideo);
  }

  if (els.btnPlayerObsidian) {
    els.btnPlayerObsidian.addEventListener('click', () => {
      const video = findVideoById(activeVideoId);
      if (!video) return;
      const md = buildVideoObsidianMarkdown(video);
      openInObsidianUri(sanitizeFilename(getDisplayTitle(video)), md, video.channelName);
      els.playerObsidianStatus.textContent = 'Obsidian wird unter YouTube / Kanal geöffnet…';
    });
  }

  if (els.btnPlayerObsidianFile) {
    els.btnPlayerObsidianFile.addEventListener('click', async () => {
      const video = findVideoById(activeVideoId);
      if (!video) return;
      const md = buildVideoObsidianMarkdown(video);
      const res = await saveMarkdownToVaultOrDownload(getDisplayTitle(video), md);
      els.playerObsidianStatus.textContent =
        res.method === 'vault'
          ? `Direkt im verknüpften Vault-Ordner gespeichert: ${res.filename}`
          : `Markdown-Datei heruntergeladen: ${res.filename}`;
    });
  }

  if (els.btnPlayerCopyMd) {
    els.btnPlayerCopyMd.addEventListener('click', async () => {
      const video = findVideoById(activeVideoId);
      if (!video) return;
      const md = buildVideoObsidianMarkdown(video);
      try {
        await navigator.clipboard.writeText(md);
        els.playerObsidianStatus.textContent = 'Obsidian-Markdown in die Zwischenablage kopiert.';
      } catch {
        els.playerObsidianStatus.textContent = 'Zwischenablage nicht verfügbar — nutze „.md / Vault speichern“.';
      }
    });
  }

  // Leertaste steuert Player, wenn kein Textfeld fokussiert ist
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && activeVideoId) {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        togglePlayPause();
      }
    }
  });

  // Budgets speichern
  els.btnSaveBudgets.addEventListener('click', () => {
    const lMin = Math.max(5, parseInt(els.inputLearningGoal.value || '45', 10));
    const eMin = Math.max(0, parseInt(els.inputEntertainmentLimit.value || '30', 10));
    state.budgets = { learningGoalMin: lMin, entertainmentLimitMin: eMin };
    saveState();
    updateTimerUI();
    renderDashboard();
    renderVideoViews();
  });

  // Neuen Kanal hinzufügen / via API abonnieren
  els.formAddChannel.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = els.newChannelName.value.trim();
    const rawHandle = els.newChannelHandle.value.trim();
    const category = els.newChannelCategory.value;
    const topic = els.newChannelTopic.value.trim() || 'Allgemein & Wissen';
    if (!name || !rawHandle) return;

    const handle = rawHandle.startsWith('@') || rawHandle.startsWith('UC') ? rawHandle : `@${rawHandle}`;
    const exists = state.channels.some((c) => c.handle.toLowerCase() === handle.toLowerCase());
    if (!exists) {
      state.channels.unshift({
        handle,
        channelId: handle.startsWith('UC') ? handle : undefined,
        name,
        category,
        topic,
        qualityBase: 82,
        description: 'Manuell hinzugefügter Kanal'
      });
      if (handle.startsWith('UC')) {
        await subscribeChannelViaApiIfPossible(handle);
      }
      saveState();
    }

    els.newChannelName.value = '';
    els.newChannelHandle.value = '';
    els.newChannelTopic.value = '';
    renderChannelManager();
    renderFeedChannelFilter();
    renderVideoViews();
  });

  // Notizen als Markdown / in Obsidian exportieren
  els.btnExportNotes.addEventListener('click', () => {
    downloadMarkdownFile(`focustube-notizen-${getDateKey()}.md`, buildAllNotesObsidianMarkdown());
  });

  if (els.btnExportObsidianAll) {
    els.btnExportObsidianAll.addEventListener('click', () => {
      openInObsidianUri(`FocusTube-Notizen-${getDateKey()}`, buildAllNotesObsidianMarkdown());
    });
  }

  // Sync Modal
  els.btnOpenSync.addEventListener('click', () => {
    updateSyncUi();
    els.syncModal.classList.remove('hidden');
  });
  els.btnCloseSync.addEventListener('click', () => els.syncModal.classList.add('hidden'));
  els.syncModal.addEventListener('click', (e) => {
    if (e.target === els.syncModal) els.syncModal.classList.add('hidden');
  });

  if (els.btnPickObsidianDir) {
    els.btnPickObsidianDir.addEventListener('click', async () => {
      if (typeof window.showDirectoryPicker !== 'function') {
        els.obsidianDirStatus.textContent = 'Dein Browser unterstützt die direkte Ordner-Verknüpfung nicht (nutze Chrome/Edge/Arc oder „obsidian://“).';
        return;
      }
      try {
        obsidianDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        await idbPutObsidianDir(obsidianDirHandle);
        updateSyncUi();
      } catch {
        // Nutzer hat Auswahl abgebrochen
      }
    });
  }

  els.btnSaveApiConfig.addEventListener('click', () => {
    state.apiConfig.clientId = els.inputOauthClientId.value.trim();
    state.apiConfig.apiKey = els.inputYtApiKey.value.trim();
    if (els.inputGeminiApiKey) state.apiConfig.geminiKey = els.inputGeminiApiKey.value.trim();
    if (els.selectGeminiModel) state.apiConfig.geminiModel = els.selectGeminiModel.value;
    if (els.inputObsidianVault) state.obsidianConfig.vaultName = els.inputObsidianVault.value.trim();
    if (els.inputObsidianFolder) state.obsidianConfig.folder = els.inputObsidianFolder.value.trim() || 'YouTube';
    saveState();
    updateSyncUi();
    els.syncStatusText.textContent = 'YouTube-, Gemini- & Obsidian-Konfiguration lokal im Browser gespeichert.';
  });

  const triggerGoogleLoginOrSync = () => {
    if (oauthAccessToken) {
      syncSubscriptionsFromApi();
      return;
    }
    const clientId = (els.inputOauthClientId?.value || '').trim() || state.apiConfig.clientId;
    if (!clientId) {
      updateSyncUi();
      els.syncModal.classList.remove('hidden');
      els.syncStatusText.textContent = 'Bitte zuerst deine Google OAuth 2.0 Client-ID eintragen.';
      return;
    }
    state.apiConfig.clientId = clientId;
    if (els.inputYtApiKey) state.apiConfig.apiKey = els.inputYtApiKey.value.trim();
    if (els.inputGeminiApiKey) state.apiConfig.geminiKey = els.inputGeminiApiKey.value.trim();
    saveState();

    if (!window.google?.accounts?.oauth2) {
      els.syncModal.classList.remove('hidden');
      els.syncStatusText.textContent = 'Google Identity Services konnte nicht geladen werden (offline oder von Adblocker blockiert).';
      return;
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/youtube',
      callback: (resp) => {
        if (resp.error) {
          els.syncStatusText.textContent = `Login abgebrochen oder Fehler: ${resp.error}`;
          return;
        }
        oauthAccessToken = resp.access_token;
        updateSyncUi();
        syncSubscriptionsFromApi();
      }
    });
    tokenClient.requestAccessToken();
  };

  els.btnGoogleLogin.addEventListener('click', triggerGoogleLoginOrSync);
  if (els.btnSyncSubsNow) {
    els.btnSyncSubsNow.addEventListener('click', triggerGoogleLoginOrSync);
  }

  els.btnFetchUuUploads.addEventListener('click', () => fetchLiveUploadsViaUuTrick({ silent: false }));
  if (els.btnRefreshFeed) {
    els.btnRefreshFeed.addEventListener('click', () => fetchLiveUploadsViaUuTrick({ silent: false }));
  }
  if (els.btnRefreshAlgo) {
    els.btnRefreshAlgo.addEventListener('click', () => fetchLiveUploadsViaUuTrick({ silent: false }));
  }
}

function renderAllViews() {
  renderLearningGoals();
  renderDiscoverGoalPills();
  renderGoalTopicsDatalist();
  renderDiscoveryResults();
  renderFeedChannelFilter();
  renderVideoViews();
  renderDashboard();
  renderChannelManager();
  renderAllNotesTab();
  updateTimerUI();
  updateSyncUi();
}

async function init() {
  obsidianDirHandle = await idbGetObsidianDir();
  bindEvents();
  setMode(state.mode);
  setTab(state.activeTab);
  renderAllViews();
  loadYouTubeIframeApi();

  // Automatische Feed-Aktualisierung beim Start (wenn API-Key vorhanden & letzter Abruf > 30 Min.)
  const hasApiKey = Boolean((state.apiConfig.apiKey || '').trim());
  const hasSyncChannels = state.channels.some((c) => c.channelId && c.channelId.startsWith('UC') && c.category !== 'muted');
  const stale = Date.now() - (state.lastFeedSyncAt || 0) > 30 * 60 * 1000;
  if (hasApiKey && hasSyncChannels && stale) {
    fetchLiveUploadsViaUuTrick({ silent: true });
  }
}

init();
