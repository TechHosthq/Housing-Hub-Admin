/**
 * Converts a 12-hour time string (e.g., "10:00 AM", "12:00 PM") to a 24-hour time string (e.g., "10:00:00", "12:00:00").
 */
export const formatTimeTo24h = (time: string): string => {
    if (!time) return "12:00:00";
    
    const [timePart, period] = time.split(" ");
    let [hours, minutes] = timePart.split(":");
    let h = parseInt(hours);
    
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    
    return `${String(h).padStart(2, "0")}:${minutes}:00`;
};

/**
 * Ensures a date is in YYYY-MM-DD format.
 */
export const formatDateToYMD = (date: string | Date): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};
