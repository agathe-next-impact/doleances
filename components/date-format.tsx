interface DateFormatProps {
  dateStr: string; // format attendu : "20230603" ou une date GMT (ex. "2023-06-03T00:00:00Z")
  short?: boolean; // format de la date (optionnel)
}

const DateFormat: React.FC<DateFormatProps> = ({ dateStr, short }) => {
  let dateObj: Date;

  // Vérification si la chaîne est au format "yyyyMMdd"
  if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
    const isoDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`;
    dateObj = new Date(isoDate);
  } 
  // Vérification si la chaîne est au format GMT
  else if (!isNaN(Date.parse(dateStr))) {
    dateObj = new Date(dateStr);
  } 
  // Si le format est invalide
  else {
    return <span>Date invalide</span>;
  }

  // Vérifie que la date est valide
  if (isNaN(dateObj.getTime())) {
    return <span>Date invalide</span>;
  }

  // Formatage de la date
  if (short) {
    // Affiche "juin 2023"
    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    return <span>{formattedDate}</span>;
  } else {
    // Affiche "3 juin 2023"
    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return <span>{formattedDate}</span>;
  }
};

export default DateFormat;

interface TimeFormatProps {
    timeStr: string; // format attendu : "00:00:00" ou "00:00:00.000Z"
}

export const TimeFormat: React.FC<TimeFormatProps> = ({ timeStr }) => {
  // Accepte "HH:mm:ss" ou "HH:mm:ss.000Z"
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) {
    return <span>Heure invalide</span>;
  }
  let [_, hour, minute] = match;
  // Supprime le zéro initial si présent
  if (hour.startsWith("0")) hour = hour.substring(1);
  return <span>{hour}h{minute}</span>;
}
// export default TimeFormat    