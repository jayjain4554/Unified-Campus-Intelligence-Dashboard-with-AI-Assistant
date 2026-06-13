export interface Book {
  isbn: string;
  title: string;
  author: string;
  category: string;
  available: boolean;
  locationShelf: string;
}

export interface LibrarySession {
  studentId: string;
  borrowedBooks: {
    book: Book;
    dueDate: string;
  }[];
}

export interface RoomReservation {
  id: string;
  roomId: string;
  studentId: string;
  startTime: string;
  endTime: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface LibraryOccupancy {
  floor: number;
  currentOccupancy: number;
  maxCapacity: number;
  noiseLevel: 'Silent' | 'Moderate' | 'Active';
}

export interface BookAvailability {
  isbn: string;
  title: string;
  copiesAvailable: number;
  totalCopies: number;
  status: 'Available' | 'Checked Out';
  locationShelf: string;
}

export interface PopularBook extends Book {
  popularityScore: number;
}

