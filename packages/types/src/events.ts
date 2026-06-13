export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  buildingName: string;
  room?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Social' | 'Sports' | 'Career' | 'Other';
  startTime: string;
  endTime: string;
  location: LocationCoordinates;
  organizer: string;
  rsvpCount: number;
  capacity?: number;
}

export interface RSVPStatus {
  eventId: string;
  studentId: string;
  status: 'Registered' | 'Waitlisted' | 'Cancelled';
}
