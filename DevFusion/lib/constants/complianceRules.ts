import { ComplianceRule } from '@/types/compliance';

export const complianceRules: ComplianceRule[] = [
  {
    id: 'RULE-PC-01',
    name: 'Legal Metrology (Packaged Commodities) Rule 6(1)(a)',
    clause: 'Declaration of Name and Address of Manufacturer, Packer or Importer',
    mandatory: true,
    standardPenalty: 'Section 36(1) Compoundable Notice',
    description: 'Every package shall bear the name and complete address of the manufacturer, or where the manufacturer is not the packer, the name and address of the manufacturer and packer.',
  },
  {
    id: 'RULE-PC-02',
    name: 'Legal Metrology (Packaged Commodities) Rule 6(1)(b)',
    clause: 'Common or Generic Names of the Commodity',
    mandatory: true,
    standardPenalty: 'Section 36(1) Compoundable Notice',
    description: 'The common or generic names of the commodity contained in the package and in case of packages with more than one product, the name and quantity of each product.',
  },
  {
    id: 'RULE-PC-03',
    name: 'Legal Metrology (Packaged Commodities) Rule 6(1)(c)',
    clause: 'Net Quantity in Standard Units of Weight or Measure',
    mandatory: true,
    standardPenalty: 'Section 36(1) Direct Seizure / Fine',
    description: 'The net quantity, in terms of the standard unit of weight or measure, of the commodity contained in the package or where the commodity is packed or sold by number, the number of the commodity contained in the package.',
  },
  {
    id: 'RULE-PC-04',
    name: 'Legal Metrology (Packaged Commodities) Rule 6(1)(d)',
    clause: 'Month and Year of Manufacture / Pre-packing / Import',
    mandatory: true,
    standardPenalty: 'Section 36(1) Notice',
    description: 'The month and year in which the commodity is manufactured or pre-packed or imported shall be mentioned clearly.',
  },
  {
    id: 'RULE-PC-05',
    name: 'Legal Metrology (Packaged Commodities) Rule 6(1)(e)',
    clause: 'Retail Sale Price (Maximum Retail Price - MRP inclusive of all taxes)',
    mandatory: true,
    standardPenalty: 'Section 36(1) Penalty up to ₹25,000 for first offence',
    description: 'The retail sale price of the package shall be declared as Maximum Retail Price (MRP) inclusive of all taxes.',
  },
  {
    id: 'RULE-PC-06',
    name: 'Legal Metrology (Packaged Commodities) Rule 6(1)(da)',
    clause: 'Unit Sale Price (USP)',
    mandatory: true,
    standardPenalty: 'Section 36(1) Compliance Warning',
    description: 'Unit sale price in rupees rounded off to the nearest two decimal places per g/ml or per kg/l.',
  },
  {
    id: 'RULE-PC-07',
    name: 'Legal Metrology (Packaged Commodities) Rule 6(1)(h)',
    clause: 'Consumer Care Contact Details',
    mandatory: true,
    standardPenalty: 'Section 36(1) Notice',
    description: 'Name, address, telephone number, email address of the person who can be contacted by the consumer in case of complaints.',
  },
];

export function getRuleById(id: string): ComplianceRule | undefined {
  return complianceRules.find((rule) => rule.id === id);
}

export function getRulesByCategory(category: string): ComplianceRule[] {
  return complianceRules.filter((rule) => rule.clause.toLowerCase().includes(category.toLowerCase()));
}

export function getMandatoryRules(): ComplianceRule[] {
  return complianceRules.filter((rule) => rule.mandatory);
}