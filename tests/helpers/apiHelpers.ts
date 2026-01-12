/**
 * API helper functions for testing
 */

import { getApiUrl } from '@/lib/utils';

export async function createItemViaAPI(table: string, data: Record<string, any>): Promise<any> {
  const response = await fetch(getApiUrl(`/${table.replace(/_/g, '-')}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error || response.statusText}`);
  }

  return response.json();
}

export async function getItemViaAPI(table: string, id: string): Promise<any> {
  const response = await fetch(getApiUrl(`/${table.replace(/_/g, '-')}/${id}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error || response.statusText}`);
  }

  return response.json();
}

export async function listItemsViaAPI(table: string, page = 1, limit = 10, search = ''): Promise<any> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    params.append('search', search);
  }

  const response = await fetch(getApiUrl(`/${table.replace(/_/g, '-')}?${params}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error || response.statusText}`);
  }

  return response.json();
}

export async function updateItemViaAPI(table: string, id: string, data: Record<string, any>): Promise<any> {
  const response = await fetch(getApiUrl(`/${table.replace(/_/g, '-')}/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error || response.statusText}`);
  }

  return response.json();
}

export async function deleteItemViaAPI(table: string, id: string): Promise<any> {
  const response = await fetch(getApiUrl(`/${table.replace(/_/g, '-')}/${id}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error: ${error.error || response.statusText}`);
  }

  return response.json();
}
