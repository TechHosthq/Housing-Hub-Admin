// Mirrors HousingHub.Model.Enums.PropertyFeature (a [Flags] enum) on the backend.
export const PROPERTY_FEATURE_LABELS: Record<number, string> = {
    1: "Parking",
    2: "Swimming Pool",
    4: "Garden",
    8: "Gym",
    16: "Security",
    32: "Furnished",
    64: "Air Conditioning",
    128: "Balcony",
    256: "CCTV",
    512: "Elevator",
    1024: "Backup Generator",
    2048: "Borehole Water",
    4096: "Serviced",
    8192: "Pet Friendly",
};

export function decodePropertyFeatures(features: number): string[] {
    return Object.entries(PROPERTY_FEATURE_LABELS)
        .filter(([bit]) => (features & Number(bit)) !== 0)
        .map(([, label]) => label);
}
