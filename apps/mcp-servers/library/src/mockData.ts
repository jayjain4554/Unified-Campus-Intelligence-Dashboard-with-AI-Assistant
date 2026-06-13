import { Book } from "@campus-intelligence/types";

export interface LibraryBook extends Book {
  popularityScore: number;
  copiesAvailable: number;
  totalCopies: number;
}

export const mockBooks: LibraryBook[] = [
  {
    isbn: "978-0131103627",
    title: "The C Programming Language",
    author: "Brian W. Kernighan, Dennis M. Ritchie",
    category: "Computer Science",
    available: true,
    locationShelf: "CS-01-A",
    popularityScore: 95,
    copiesAvailable: 3,
    totalCopies: 4
  },
  {
    isbn: "978-0262033848",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    category: "Computer Science",
    available: true,
    locationShelf: "CS-02-B",
    popularityScore: 98,
    copiesAvailable: 2,
    totalCopies: 5
  },
  {
    isbn: "978-0132350884",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Software Engineering",
    available: false,
    locationShelf: "SE-03-A",
    popularityScore: 92,
    copiesAvailable: 0,
    totalCopies: 3
  },
  {
    isbn: "978-0596007126",
    title: "Head First Design Patterns",
    author: "Eric Freeman, Elisabeth Robson, Bert Bates, Kathy Sierra",
    category: "Software Engineering",
    available: true,
    locationShelf: "SE-04-C",
    popularityScore: 88,
    copiesAvailable: 4,
    totalCopies: 4
  },
  {
    isbn: "978-0321125217",
    title: "Domain-Driven Design",
    author: "Eric Evans",
    category: "Software Engineering",
    available: true,
    locationShelf: "SE-05-A",
    popularityScore: 85,
    copiesAvailable: 1,
    totalCopies: 2
  }
];
