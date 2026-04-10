"use client";

// Inline decoder for Google's polyline algorithm to avoid external bundle overhead
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export interface SVGPathData {
  d: string;
  viewBox: string;
  points: [number, number][];
}

export function polylineToSVG(
  polyline: string,
  width: number = 300,
  height: number = 160,
  padding: number = 20
): SVGPathData | null {
  if (!polyline) return null;

  let coords: [number, number][] = [];
  try {
    coords = decodePolyline(polyline);
  } catch (err) {
    console.error("Failed to decode polyline", err);
    return null;
  }

  if (coords.length < 2) return null;

  const lats = coords.map((c) => c[0]);
  const lngs = coords.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Preserve aspect ratio
  const scaleX = innerWidth / lngRange;
  const scaleY = innerHeight / latRange;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = padding + (innerWidth - lngRange * scale) / 2;
  const offsetY = padding + (innerHeight - latRange * scale) / 2;

  const d = coords
    .map((c, i) => {
      const x = offsetX + (c[1] - minLng) * scale;
      const y = offsetY + (maxLat - c[0]) * scale; // Flip Y for SVG
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return {
    d,
    viewBox: `0 0 ${width} ${height}`,
    points: coords,
  };
}
