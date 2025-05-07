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