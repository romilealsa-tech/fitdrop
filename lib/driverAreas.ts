// Where FitDrop drivers can be based — used by the driver application form (/drive)
// and validated again on the server, so free text like "asdf" can't be submitted.
// To add an area: add it to the right list below.

export const VEHICLE_TYPES = ["Bike", "Motorcycle", "Car"] as const

type AreaGroup = { label: string; neighborhoods: string[] }

export const DRIVER_AREAS: Record<string, AreaGroup[]> = {
  "New York": [
    {
      label: "Manhattan",
      neighborhoods: [
        "Battery Park City", "Chelsea", "Chinatown", "East Harlem", "East Village", "Financial District",
        "Flatiron", "Gramercy", "Greenwich Village", "Harlem", "Hell's Kitchen", "Inwood",
        "Kips Bay", "Little Italy", "Lower East Side", "Midtown", "Morningside Heights", "Murray Hill",
        "NoHo", "Nolita", "SoHo", "Tribeca", "Upper East Side", "Upper West Side",
        "Washington Heights", "West Village",
      ],
    },
    {
      label: "Brooklyn",
      neighborhoods: [
        "Bay Ridge", "Bed-Stuy", "Boerum Hill", "Brooklyn Heights", "Bushwick", "Carroll Gardens",
        "Clinton Hill", "Crown Heights", "DUMBO", "Flatbush", "Fort Greene", "Greenpoint",
        "Park Slope", "Prospect Heights", "Sunset Park", "Williamsburg",
      ],
    },
    {
      label: "Queens",
      neighborhoods: [
        "Astoria", "Flushing", "Forest Hills", "Jackson Heights", "Jamaica", "Long Island City",
        "Ridgewood", "Sunnyside", "Woodside",
      ],
    },
    {
      label: "The Bronx",
      neighborhoods: ["Fordham", "Kingsbridge", "Mott Haven", "Pelham Bay", "Riverdale", "South Bronx"],
    },
    {
      label: "Staten Island",
      neighborhoods: ["North Shore", "Mid-Island", "South Shore"],
    },
  ],
  "New Jersey": [
    {
      label: "Hudson County",
      neighborhoods: ["Bayonne", "Hoboken", "Jersey City", "North Bergen", "Union City", "Weehawken", "West New York"],
    },
    {
      label: "Other",
      neighborhoods: ["Fort Lee", "Newark"],
    },
  ],
}

export const DRIVER_STATES = Object.keys(DRIVER_AREAS)

/** e.g. ("New York", "SoHo") → "SoHo, Manhattan, New York" — or null if not a valid choice. */
export function formatDriverArea(state: string, neighborhood: string): string | null {
  const group = (DRIVER_AREAS[state] || []).find(g => g.neighborhoods.includes(neighborhood))
  return group ? `${neighborhood}, ${group.label}, ${state}` : null
}
