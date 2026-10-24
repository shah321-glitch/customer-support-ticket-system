const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const cleanUrl = rawUrl.replace(/\/+$/, "");
export const API_BASE = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
export const BACKEND_URL = API_BASE.replace(/\/api\/?$/, "");

export const getAttachmentUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

// Convert Data URI to Blob URL so modern browsers allow opening & downloading without security block
export const attachmentToBlobUrl = (dataUrl, mimetype) => {
  if (!dataUrl) return "";
  if (!dataUrl.startsWith("data:")) return dataUrl;
  try {
    const parts = dataUrl.split(";base64,");
    if (parts.length < 2) return dataUrl;
    const mime = parts[0].replace("data:", "") || mimetype || "application/octet-stream";
    const byteCharacters = atob(parts[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: mime });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn("Failed to convert data URI to blob:", err);
    return dataUrl;
  }
};

// Safe download trigger for any attachment (image, pdf, document)
export const downloadAttachmentFile = (attachment) => {
  if (!attachment || !attachment.url) return;
  const filename = attachment.originalname || attachment.filename || "attachment";

  if (attachment.url.startsWith("data:")) {
    const blobUrl = attachmentToBlobUrl(attachment.url, attachment.mimetype);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      if (blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
    }, 60000);
  } else {
    const fullUrl = getAttachmentUrl(attachment.url);
    const a = document.createElement("a");
    a.href = fullUrl;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

let pendingStatsPromise = null;
let cachedStats = null;
let lastStatsFetchTime = 0;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load profile");
    return data;
  },

  getAgents: async () => {
    const res = await fetch(`${API_BASE}/auth/agents`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load agents");
    return data;
  },

  getAgentPerformance: async () => {
    const res = await fetch(`${API_BASE}/tickets/agent-performance`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load agent performance analytics");
    return data;
  },

  // Tickets
  getTickets: async (filter = {}, page = 1, limit = 10) => {
    let url = `${API_BASE}/tickets`;
    const params = new URLSearchParams();
    if (filter.status && filter.status !== "All") params.append("status", filter.status);
    if (filter.priority && filter.priority !== "All") params.append("priority", filter.priority);
    if (filter.category && filter.category !== "All") params.append("category", filter.category);
    if (filter.search) params.append("search", filter.search);
    params.append("page", page);
    params.append("limit", limit);

    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch tickets");
    return data;
  },

  getTicketById: async (id) => {
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch ticket");
    return data;
  },

  createTicket: async (ticketData, file) => {
    const formData = new FormData();
    formData.append("title", ticketData.title);
    formData.append("description", ticketData.description);
    formData.append("category", ticketData.category);
    formData.append("priority", ticketData.priority);
    if (file) formData.append("attachment", file);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // DO NOT set Content-Type header - browser sets it with boundary for FormData
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create ticket");
    return data;
  },

  updateTicket: async (id, updateData) => {
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update ticket");
    return data;
  },

  addComment: async (ticketId, message) => {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to post comment");
    return data;
  },

  getComments: async (ticketId) => {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch comments");
    return data;
  },

  deleteTicket: async (id) => {
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete ticket");
    return data;
  },

  submitFeedback: async (id, rating, comment) => {
    const res = await fetch(`${API_BASE}/tickets/${id}/feedback`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to submit feedback");
    return data;
  },

  getStats: async (force = false) => {
    const now = Date.now();
    if (!force && cachedStats && now - lastStatsFetchTime < 4000) {
      return cachedStats;
    }
    if (pendingStatsPromise) {
      return pendingStatsPromise;
    }
    pendingStatsPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/stats?_t=${Date.now()}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch stats");
        cachedStats = data;
        lastStatsFetchTime = Date.now();
        return data;
      } finally {
        pendingStatsPromise = null;
      }
    })();
    return pendingStatsPromise;
  },
};
