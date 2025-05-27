export function resetCookieConsent() {
  // Supprime le cookie de consentement
  document.cookie = "userConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  // Déclenche un événement pour réafficher la bannière
  window.dispatchEvent(new Event("show-cookie-banner"));
}