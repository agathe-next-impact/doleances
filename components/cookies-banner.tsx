// components/CookieBanner.tsx
import CookieConsent from "react-cookie-consent";

export default function CookieBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="J'accepte" 
      declineButtonText="Je refuse"
      enableDeclineButton
      cookieName="userConsent"
      expires={365}
      style={{
        position: "fixed",
        bottom: 0,
        left: "calc(100% - 21rem)",
        marginBottom: "1rem",
        width: "20rem",
        background: "#FFFFFF",
        color: "#000",
        fontSize: "14px",
        padding: "1rem",
        fontFamily: "Inter, sans-serif",
        borderRadius: "8px",
        boxShadow: "10 2px 10px rgba(0, 0, 0, 0.1)",
      }}
      buttonStyle={{
        background: "#0d7ad9",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "0.5rem 1rem",
        marginLeft: "1rem"
      }}
      declineButtonStyle={{
        background: "#0d7ad9CC",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "0.5rem 1rem"
      }}
    >
      Ce site utilise des cookies pour améliorer votre expérience.{" "}
      <a href="/politique-de-confidentialite" style={{ color: "#0d7ad9" }}>En savoir plus</a>
    </CookieConsent>
  );
}
