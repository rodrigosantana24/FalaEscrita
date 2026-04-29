const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(responseText || `Falha na requisicao (${response.status}).`);
  }

  return response.json();
}

export function login(username, password) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function fetchMeetings() {
  return request("/api/v1/meetings");
}
