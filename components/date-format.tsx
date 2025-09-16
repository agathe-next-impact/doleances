interface DateFormatProps {
  dateStr: string; // format attendu : "20230603" ou une date GMT (ex. "2023-06-03T00:00:00Z")
  short?: boolean; // format de la date (optionnel)
}

const DateFormat: React.FC<DateFormatProps> = ({ dateStr, short }) => {
  // Affichage manuel sans conversion locale
  // yyyyMMdd
  if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6);
    if (short) {
      return <span>{month}/{year}</span>;
    } else {
      return <span>{day}/{month}/{year}</span>;
    }
  }
  // ISO ou GMT (2023-06-03T...)
  else if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return <span>Date invalide</span>;
    const [_, year, month, day] = match;
    if (short) {
      return <span>{month}/{year}</span>;
    } else {
      return <span>{day}/{month}/{year}</span>;
    }
  }
  // Sinon, format inconnu
  else {
    return <span>Date invalide</span>;
  }
};

export default DateFormat;

interface TimeFormatProps {
    timeStr: string; // format attendu : "00:00:00" ou "00:00:00.000Z"
}

export const TimeFormat: React.FC<TimeFormatProps> = ({ timeStr }) => {
    const date = new Date(`1970-01-01T${timeStr}Z`); // Ajout d'une date fictive pour créer un objet Date valide

    // Vérifie que l'heure est valide
    if (isNaN(date.getTime())) {
        return <span>Heure invalide</span>;
    }

    // Formatage de l'heure en "HHhmm"
    let formattedTime = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date).replace(":", "h");

    if (formattedTime.startsWith("0")) {
      formattedTime = formattedTime.substring(1);
    }
    return <span>{formattedTime}</span>;
}
// export default TimeFormat    