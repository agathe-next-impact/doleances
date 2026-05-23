// components/CookieBanner.tsx
import React, { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("show-cookie-banner", handler);
    return () => window.removeEventListener("show-cookie-banner", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ position: "fixed", zIndex: 9999, width: "20rem", left: "calc(100% - 21rem)", boxShadow: "10px 2px 10px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}
        >
          <CookieConsent
            location="bottom"
            buttonText="J'accepte"
            declineButtonText="Je refuse"
            enableDeclineButton
            cookieName="userConsent"
            expires={365}
            onAccept={() => {
              setVisible(false);
              window.dispatchEvent(new Event("cookie-consent-accepted"));
            }}
            onDecline={() => setVisible(false)}
            style={{
              background: "#FFFFFF",
              color: "#000",
              fontSize: "14px",
              padding: "1rem",
              fontFamily: "Inter, sans-serif",
              borderRadius: "8px",
              boxShadow: "10px 2px 10px rgba(0, 0, 0, 0.1)",
              width: "20rem",
              left: "calc(100% - 21rem)",
              position: "fixed",
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
            <a href="/rgpd/mentions-legales" style={{ color: "#0d7ad9" }}>En savoir plus</a>
          </CookieConsent>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
