const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export async function geocodeAddress(address) {
  if (!address) return null;
  const params = new URLSearchParams({ q: address, format: 'json', addressdetails: '0', limit: '1' });
  const url = `${NOMINATIM_ENDPOINT}?${params.toString()}`;
  const headers = {
    'Accept': 'application/json',
    // Please replace with your domain/email to comply with Nominatim usage policy
    'User-Agent': 'UIC-CCS-Alumni-Portal/1.0 (contact: alumni@uic.edu.ph)'
  };
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      const first = json[0];
      return { lat: parseFloat(first.lat), lon: parseFloat(first.lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function geocodeWithDelay(addresses, delayMs = 1200, onProgress) {
  const results = [];
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    const geo = await geocodeAddress(addr.address);
    results.push({ user_id: addr.user_id, ...geo });
    if (onProgress) onProgress(i + 1, addresses.length, addr.user_id, geo);
    if (i < addresses.length - 1) await new Promise(r => setTimeout(r, delayMs));
  }
  return results;
}
