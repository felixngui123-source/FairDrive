/**
 * Canadian regions for location selector.
 * Matches the regions table in Supabase seed data.
 */

export type Region = {
  slug: string;
  name: string;
  province: string;
  label: string; // "Vancouver, BC"
};

export const REGIONS: Region[] = [
  { slug: "vancouver-bc", name: "Vancouver", province: "BC", label: "Vancouver, BC" },
  { slug: "toronto-on", name: "Toronto", province: "ON", label: "Toronto, ON" },
  { slug: "montreal-qc", name: "Montreal", province: "QC", label: "Montreal, QC" },
  { slug: "calgary-ab", name: "Calgary", province: "AB", label: "Calgary, AB" },
  { slug: "edmonton-ab", name: "Edmonton", province: "AB", label: "Edmonton, AB" },
  { slug: "ottawa-on", name: "Ottawa", province: "ON", label: "Ottawa, ON" },
  { slug: "winnipeg-mb", name: "Winnipeg", province: "MB", label: "Winnipeg, MB" },
  { slug: "quebec-city-qc", name: "Quebec City", province: "QC", label: "Quebec City, QC" },
  { slug: "hamilton-on", name: "Hamilton", province: "ON", label: "Hamilton, ON" },
  { slug: "victoria-bc", name: "Victoria", province: "BC", label: "Victoria, BC" },
  { slug: "halifax-ns", name: "Halifax", province: "NS", label: "Halifax, NS" },
  { slug: "saskatoon-sk", name: "Saskatoon", province: "SK", label: "Saskatoon, SK" },
  { slug: "regina-sk", name: "Regina", province: "SK", label: "Regina, SK" },
  { slug: "kelowna-bc", name: "Kelowna", province: "BC", label: "Kelowna, BC" },
  { slug: "london-on", name: "London", province: "ON", label: "London, ON" },
];
