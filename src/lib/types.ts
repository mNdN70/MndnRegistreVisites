export interface BaseVisit {
  id: string; // DNI/NIE
  name: string;
  company: string;
  reason?: string;
  personToVisit: string;
  department: string;
  entryTime: string; // ISO string
  exitTime: string | null; // ISO string or null
  privacyPolicyAccepted: boolean;
}

export interface Visit extends BaseVisit {
  type: 'general';
}

export interface TransporterVisit extends BaseVisit {
  type: 'transporter';
  haulierCompany: string;
  licensePlate: string;
  trailerLicensePlate?: string;
}

export type AnyVisit = Visit | TransporterVisit;
