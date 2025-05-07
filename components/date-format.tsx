interface DateFormatProps {
    dateStr: string; // format attendu : "20230603"
    short?: boolean; // format de la date (optionnel)
  }
  
  const DateFormat: React.FC<DateFormatProps> = ({ dateStr, short }) => {
    // Vérification que la chaîne est bien du bon format
    if (!dateStr || dateStr.length !== 8) {
      return <span>Date invalide</span>;
    }
  
    // Construction de la date au format ISO (yyyy-MM-dd)
    const isoDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`;
    const dateObj = new Date(isoDate);
  
    // Vérifie que la date est valide
    if (isNaN(dateObj.getTime())) {
      return <span>Date invalide</span>;
    }
  
    if (short) {
    // Affiche "juin 2023"
    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    return <span>{formattedDate}</span>;
    }
    else {
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


  // Formatage des heures pour l'affichage 
  // format d'entrée : 00:00:00 ou 00:00:00.000Z
  // format de sortie : "HH:mm"

interface TimeFormatProps {
    timeStr: string; // format attendu : "00:00:00" ou "00:00:00.000Z"
}

export const TimeFormat: React.FC<TimeFormatProps> = ({ timeStr }) => {
    const date = new Date(`1970-01-01T${timeStr}Z`); // Ajout d'une date fictive pour créer un objet Date valide

    // Vérifie que l'heure est valide
    if (isNaN(date.getTime())) {
        return <span>Heure invalide</span>;
    }

    // Formatage de l'heure en "HH:mm"
    const formattedTime = new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
    return <span>{formattedTime}</span>;
}
// export default TimeFormat    
