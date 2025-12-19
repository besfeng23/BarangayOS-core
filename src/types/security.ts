
import { Timestamp } from 'firebase/firestore';

export type DeviceType = "CCTV" | "NVR" | "BODY_CAM" | "DASH_CAM" | "PANIC_BUTTON" | "SIREN" | "LED_DISPLAY" | "PA_SYSTEM";
export type DeviceStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export interface SecurityDevice {
  id: string;
  barangayId: string;
  type: DeviceType;
  name: string;
  location: {
    area: string;
    notes?: string;
    lat?: number;
    lng?: number;
  };
  deviceMeta?: {
    brand?: string;
    model?: string;
    serial?: string;
    ipAddress?: string;
    mac?: string;
    streamUrl?: string;
    nvrChannel?: string;
    vehiclePlate?: string;
    assignedToResidentId?: string;
  };
  status: DeviceStatus;
  lastSeenAt?: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}
