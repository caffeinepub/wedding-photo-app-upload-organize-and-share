/**
 * Utility to generate and copy the current app's shareable URL
 */

/**
 * Get the current app entrypoint URL including any hash-based routing
 */
export function getCurrentAppURL(): string {
  // Use the full current URL including hash routing if present
  return window.location.href;
}

/**
 * Copy the current app URL to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyAppLinkToClipboard(): Promise<boolean> {
  try {
    const url = getCurrentAppURL();
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy app link:', error);
    return false;
  }
}
