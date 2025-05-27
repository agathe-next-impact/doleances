"use client"

import React from "react"
import {
  FaFacebookF,
  FaLinkedinIn,
  FaEnvelope,
  FaWhatsapp,
  FaShareAlt,
} from "react-icons/fa"

type ShareSocialProps = {
  url: string
  title?: string
  text?: string
  image?: string
  className?: string
}

const socialPlatforms = [
  {
    name: "Facebook",
    icon: FaFacebookF,
    url: (u: string, t?: string, img?: string) =>
      `https://www.facebook.com/sharer/sharer.php?${u}=https://lesdoleances.fr&picture=${img ? img : ""}&quote=${t ? t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&rsquo;/g, "'") : ""}`,
  },
  {
    name: "LinkedIn",
    icon: FaLinkedinIn,
    url: (u: string, _t?: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=https://lesdoleances.fr&title=${_t ? _t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&rsquo;/g, "'") + " " : "À découvrir"}`,
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    url: (u: string, t?: string) =>
      `https://wa.me/?text=${t ? t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&rsquo;/g, "'") : "" + "https://lesdoleances.fr"}`,
  },
  {
    name: "Email",
    icon: FaEnvelope,
    url: (u: string, t?: string) =>
      `mailto:?subject=${encodeURIComponent(t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&rsquo;/g, "'") || "À découvrir")}&body=https://lesdoleances.fr`,
  },
]

export const ShareSocial: React.FC<ShareSocialProps> = ({
  url,
  title,
  text,
  image,
  className = "",
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {socialPlatforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url(url, text || title, image)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${platform.name}`}
          className="text-primary bg-primary-foreground hover:bg-white rounded-full p-2 transition-colors"
        >
          <platform.icon size={16} />
        </a>
      ))}
      <button
        type="button"
        aria-label="Copier le lien"
        onClick={() => {
          navigator.clipboard.writeText(url)
        }}
        className="text-primary bg-primary-foreground hover:bg-white rounded-full p-2 transition-colors"
        title="Copier le lien"
      >
        <FaShareAlt size={16} />
      </button>
    </div>
  )
}

export default ShareSocial