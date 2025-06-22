/**
 * Regulatory Guidelines for Hazmat Compliance
 * Based on 49 CFR and ERG requirements
 */

export const PLACARDING_GUIDELINES = {
  ANY_QUANTITY_MATERIALS: {
    "Class 1": {
      divisions: ["1.1", "1.2", "1.3", "1.5"],
      placard: "EXPLOSIVES",
      cfrReference: "49 CFR 172.504(e) Table 1",
      reasoning: "Extreme risk of mass explosion, projectile hazard, or fire hazard"
    },
    "Class 2.3": {
      placard: "POISON GAS",
      cfrReference: "49 CFR 172.504(e) Table 1",
      reasoning: "Highly toxic by inhalation, any release could pose serious threat to life"
    },
    "Class 4.3": {
      placard: "DANGEROUS WHEN WET",
      cfrReference: "49 CFR 172.504(e) Table 1",
      reasoning: "Reacts with water to produce flammable gases that can ignite and cause explosion"
    },
    "Class 5.2": {
      placard: "ORGANIC PEROXIDE",
      cfrReference: "49 CFR 172.504(e) Table 1",
      reasoning: "Highly unstable, can undergo rapid decomposition leading to explosion or fire"
    },
    "Class 6.1": {
      placard: "POISON INHALATION HAZARD",
      cfrReference: "49 CFR 172.504(e) Table 1",
      reasoning: "Toxic when inhaled, poses severe respiratory threat"
    },
    "Class 7": {
      placard: "RADIOACTIVE",
      cfrReference: "49 CFR 172.504(e) Table 1",
      reasoning: "Significant radiation risk requiring special handling and control"
    }
  },
  QUANTITY_THRESHOLD_MATERIALS: {
    "Class 1.4": {
      placard: "EXPLOSIVES 1.4",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Fire hazard with minor blast or projection effects"
    },
    "Class 1.6": {
      placard: "EXPLOSIVES 1.6",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Extremely insensitive articles"
    },
    "Class 2.1": {
      placard: "FLAMMABLE GAS",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Significant fire and explosion risk"
    },
    "Class 2.2": {
      placard: "NON-FLAMMABLE GAS",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Can displace oxygen or support combustion"
    },
    "Class 3": {
      placard: "FLAMMABLE",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Flash points below 60°C (140°F), present fire hazard"
    },
    "Class 4.1": {
      placard: "FLAMMABLE SOLID",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Can be readily ignited"
    },
    "Class 4.2": {
      placard: "SPONTANEOUSLY COMBUSTIBLE",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Can ignite without external ignition source upon exposure to air"
    },
    "Class 5.1": {
      placard: "OXIDIZER",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Can cause or enhance combustion of other materials by yielding oxygen"
    },
    "Class 6.1": {
      placard: "POISON",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Can cause death, serious injury, or harm to human health"
    },
    "Class 8": {
      placard: "CORROSIVE",
      threshold: "1001+ lbs",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Can cause severe damage to living tissue or degrade other materials"
    },
    "Class 9": {
      placard: "CLASS 9",
      threshold: "1001+ lbs (bulk only)",
      cfrReference: "49 CFR 172.504(e) Table 2",
      reasoning: "Materials with less severe or miscellaneous hazards"
    }
  }
};

export const BOL_REQUIREMENTS = {
  MANDATORY_SEQUENCE: [
    "Identification Number (UN/NA)",
    "Proper Shipping Name",
    "Hazard Class/Division Number",
    "Packing Group (if applicable)"
  ],
  ESSENTIAL_FIELDS: [
    "Emergency Response Telephone Number",
    "Shipper's Certification",
    "Date of Acceptance",
    "Total Quantity with Units",
    "Number and Type of Packages"
  ],
  SHIPPER_CERTIFICATION_LANGUAGE: [
    "This is to certify that the above-named materials are properly classified, described, packaged, marked and labeled, and are in proper condition for transportation according to the applicable regulations of the Department of Transportation",
    "I hereby declare that the contents of this consignment are fully and accurately described above by the proper shipping name, and are classified, packaged, marked and labeled/placarded, and are in all respects in proper condition for transport according to applicable international and national governmental regulations"
  ],
  CONDITIONAL_FIELDS: [
    "RQ (Reportable Quantity)",
    "Technical Names (for n.o.s. materials)",
    "Material State Modifiers (HOT, TEMPERATURE CONTROLLED)",
    "Class 7 Specific Entries",
    "Special Markings"
  ]
};

export const SAFETY_PRIORITIES = {
  CRITICAL: [
    "Evacuation distances",
    "PPE requirements",
    "Fire response procedures",
    "Incompatibility warnings",
    "Immediate action requirements"
  ],
  WARNING: [
    "Missing required fields",
    "Incorrect placarding",
    "Quantity threshold violations",
    "Documentation errors"
  ],
  INFO: [
    "ERG guide numbers",
    "CFR references",
    "Technical details",
    "Additional safety information"
  ]
};

export const CFR_REFERENCES = {
  PLACARDING: "49 CFR 172.504(e)",
  SHIPPING_PAPERS: "49 CFR 172.200-205",
  MARKING: "49 CFR 172.300-338",
  LABELING: "49 CFR 172.400-450",
  PACKAGING: "49 CFR 173.1-173.56",
  SEGREGATION: "49 CFR 177.848"
}; 