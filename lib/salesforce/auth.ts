let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getSalesforceToken() {
  // reuse token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const url = `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SALESFORCE_CLIENT_ID!,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
    }),
  });


  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[SF Auth] Failed to get token: ${err}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;

  // tokens usually expire in seconds (default ~7200)
  tokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour fallback

  return cachedToken;
}