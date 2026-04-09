import { getSalesforceToken } from "./auth";

// Instance URL is where the data API calls go — different from the login/OAuth URL
const instanceUrl =
  process.env.SALESFORCE_INSTANCE_URL ||
  "https://wise-wolf-3sucf2-dev-ed.trailblaze.my.salesforce.com";

export async function sfFetch(path: string, options: RequestInit = {}) {
  const token = await getSalesforceToken();

  const res = await fetch(`${instanceUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[SF API] ${res.status} ${res.statusText}: ${err}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

/**
 * Convenience method for SOQL queries.
 */
export const sfQuery = async <T = any>(soql: string): Promise<{ totalSize: number; done: boolean; records: T[] }> => {
  return sfFetch(`/services/data/v62.0/query?q=${encodeURIComponent(soql)}`);
}

/**
 * Convenience method for creating SF records.
 */
export const sfCreate = async (objectName: string, data: any): Promise<{ id: string; success: boolean; errors: any[] }> => {
  return sfFetch(`/services/data/v62.0/sobjects/${objectName}/`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Convenience method for updating SF records.
 */
export const sfUpdate = async (objectName: string, id: string, data: any): Promise<{ id: string; success: boolean; errors: any[] }> => {
  return sfFetch(`/services/data/v62.0/sobjects/${objectName}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

/**
 * Convenience method for getting picklist values.
 */
export async function sfGetPicklistValues(objectName: string, fieldName: string): Promise<any> {
  return sfFetch(`/services/data/v62.0/sobjects/${objectName}/describe/`).then(res => {
    return res.fields.find((f: any) => f.name === fieldName)?.picklistValues || [];
  });
}