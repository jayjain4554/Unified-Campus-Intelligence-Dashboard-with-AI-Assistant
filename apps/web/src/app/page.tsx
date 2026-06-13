"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Coffee, 
  GraduationCap, 
  Calendar, 
  LayoutDashboard, 
  Send, 
  Search, 
  Users, 
  Volume2, 
  Clock, 
  CheckCircle, 
  Plus, 
  User, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles,
  Bot,
  BarChart2
} from "lucide-react";
import { ChatMessage, AssistantResponse } from "@campus-intelligence/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "library" | "cafeteria" | "academics" | "events" | "analytics">("overview");
  
  // Metrics state
  const [metricsData, setMetricsData] = useState<any>(null);
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      content: "Hello! I am your Unified Campus AI Assistant. I can check library books, look up cafeteria menus, fetch your grades/GPA, and tell you about campus events. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Library Search state
  const [bookQuery, setBookQuery] = useState("");
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);

  // Cafeteria Meal filter state
  const [cafeteriaMeal, setCafeteriaMeal] = useState<"Breakfast" | "Lunch" | "Dinner">("Lunch");
  const [cafeteriaFilter, setCafeteriaFilter] = useState<"all" | "vegan" | "vegetarian">("all");
  const [cafeteriaMenu, setCafeteriaMenu] = useState<any[]>([]);
  const [isFetchingMenu, setIsFetchingMenu] = useState(false);

  // Events RSVP State
  const [events, setEvents] = useState<any[]>([
    {
      id: "evt-001",
      title: "AI Hackathon 2026",
      description: "Build the next gen agents and win prizes.",
      category: "Academic",
      startTime: "2026-06-12T10:00:00Z",
      endTime: "2026-06-14T18:00:00Z",
      location: { latitude: 37.7749, longitude: -122.4194, buildingName: "Engineering Center", room: "Hall A" },
      organizer: "Computer Science Dept",
      rsvpCount: 120,
      capacity: 150,
      rsvped: false
    },
    {
      id: "evt-002",
      title: "Spring Career Fair",
      description: "Meet top recruiters and secure internships.",
      category: "Career",
      startTime: "2026-06-15T09:00:00Z",
      endTime: "2026-06-15T15:00:00Z",
      location: { latitude: 37.7752, longitude: -122.4189, buildingName: "Student Union", room: "Grand Ballroom" },
      organizer: "Career Services",
      rsvpCount: 350,
      capacity: 500,
      rsvped: true
    },
    {
      id: "evt-003",
      title: "Campus Concert night",
      description: "Live music, food stalls, and games.",
      category: "Social",
      startTime: "2026-06-18T18:00:00Z",
      endTime: "2026-06-18T22:00:00Z",
      location: { latitude: 37.7745, longitude: -122.4201, buildingName: "Quad Lawn" },
      organizer: "Student Council",
      rsvpCount: 480,
      capacity: 1000,
      rsvped: false
    }
  ]);

  // Academics Grade list & schedule states
  const [academicsGpaData, setAcademicsGpaData] = useState<any>({
    gpa: 3.85,
    totalCreditsEarned: 96,
    gradesHistory: [
      { courseId: "CS-101", courseName: "Introduction to Computer Science", grade: "A", credits: 4, semester: "Fall 2024" },
      { courseId: "CS-201", courseName: "Data Structures", grade: "A-", credits: 4, semester: "Spring 2025" },
      { courseId: "MATH-250", courseName: "Linear Algebra", grade: "B+", credits: 3, semester: "Fall 2025" },
      { courseId: "CS-301", courseName: "Software Engineering", grade: "A", credits: 4, semester: "Spring 2026" }
    ]
  });

  // Academics schedule
  const [classSchedule, setClassSchedule] = useState<any[]>([
    { courseId: "CS-401", courseName: "Artificial Intelligence", instructor: "Dr. Evelyn Vance", room: "Tech Hall 302", days: ["Monday", "Wednesday"], startTime: "10:00 AM", endTime: "11:15 AM" },
    { courseId: "CS-402", courseName: "Database Systems", instructor: "Prof. Alan Turing", room: "Science Lab 101", days: ["Tuesday", "Thursday"], startTime: "01:00 PM", endTime: "02:15 PM" },
    { courseId: "HUMN-150", courseName: "Ethics in Technology", instructor: "Dr. Clara Barton", room: "Humanities Hall 15", days: ["Friday"], startTime: "09:00 AM", endTime: "11:30 AM" }
  ]);

  // Library Mock Data
  const libraryOccupancy = [
    { floor: 1, currentOccupancy: 45, maxCapacity: 100, noiseLevel: "Silent" },
    { floor: 2, currentOccupancy: 82, maxCapacity: 90, noiseLevel: "Active" },
    { floor: 3, currentOccupancy: 12, maxCapacity: 50, noiseLevel: "Moderate" }
  ];

  const initialPopularBooks = [
    { title: "Introduction to Algorithms", author: "Thomas H. Cormen", popularityScore: 98, copiesAvailable: 2, totalCopies: 5, isbn: "978-0262033848" },
    { title: "The C Programming Language", author: "Kernighan & Ritchie", popularityScore: 95, copiesAvailable: 3, totalCopies: 4, isbn: "978-0131103627" },
    { title: "Clean Code", author: "Robert C. Martin", popularityScore: 92, copiesAvailable: 0, totalCopies: 3, isbn: "978-0132350884" }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Fetch Cafeteria Menu
  const fetchMenu = async (meal: "Breakfast" | "Lunch" | "Dinner") => {
    setIsFetchingMenu(true);
    try {
      const res = await fetch(`/api/cafeteria?mealType=${meal}`);
      if (!res.ok) throw new Error("Offline");
      const menuItems = await res.json();
      setCafeteriaMenu(menuItems);
    } catch {
      // Fallback
       let menuItems = [
        { id: "m-001", name: "Vegan Quinoa Bowl", price: 8.50, allergens: [] as string[], isVegetarian: true, isVegan: true, availability: true },
        { id: "m-002", name: "Grilled Chicken Breast", price: 10.00, allergens: [] as string[], isVegetarian: false, isVegan: false, availability: true },
        { id: "m-003", name: "Garden Side Salad", price: 4.50, allergens: [] as string[], isVegetarian: true, isVegan: true, availability: true }
      ];

      if (meal === "Breakfast") {
        menuItems = [
          { id: "m-101", name: "Belgian Waffles", price: 6.50, allergens: ["Gluten", "Dairy"], isVegetarian: true, isVegan: false, availability: true },
          { id: "m-102", name: "Avocado Sourdough Toast", price: 7.00, allergens: ["Gluten"], isVegetarian: true, isVegan: true, availability: true }
        ];
      } else if (meal === "Dinner") {
        menuItems = [
          { id: "m-201", name: "Pan-Seared Salmon", price: 14.50, allergens: ["Fish"], isVegetarian: false, isVegan: false, availability: true },
          { id: "m-202", name: "Eggplant Parmesan", price: 11.00, allergens: ["Dairy", "Gluten"], isVegetarian: true, isVegan: false, availability: true }
        ];
      }
      setCafeteriaMenu(menuItems);
    } finally {
      setIsFetchingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenu(cafeteriaMeal);
  }, [cafeteriaMeal]);

  // Fetch Academics data from Next.js API
  const fetchAcademics = async () => {
    try {
      const [gpaRes, schedRes] = await Promise.all([
        fetch("/api/academics/gpa?studentId=std-123"),
        fetch("/api/academics/schedule?studentId=std-123")
      ]);
      if (gpaRes.ok) {
        const gpaData = await gpaRes.json();
        setAcademicsGpaData(gpaData);
      }
      if (schedRes.ok) {
        const schedData = await schedRes.json();
        setClassSchedule(schedData);
      }
    } catch (err) {
      console.warn("Failed to fetch academics from backend, using local defaults", err);
    }
  };

  // Fetch Events from Next.js API
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events?limit=6");
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => {
          const rsvpedIds = new Set(prev.filter(e => e.rsvped).map(e => e.id));
          return data.map((evt: any) => ({
            ...evt,
            rsvped: rsvpedIds.has(evt.id) || evt.rsvped,
          }));
        });
      }
    } catch (err) {
      console.warn("Failed to fetch events from backend, using local defaults", err);
    }
  };

  useEffect(() => {
    fetchAcademics();
    fetchEvents();
  }, []);

  // Fetch Metrics Data
  useEffect(() => {
    if (activeTab === "analytics") {
      fetch("/api/metrics")
        .then(res => res.json())
        .then(data => setMetricsData(data))
        .catch(err => console.error("Failed to fetch metrics", err));
    }
  }, [activeTab]);

  // Initial Book Search setup
  useEffect(() => {
    setBookResults(initialPopularBooks);
  }, []);

  // Library Book search
  const handleBookSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookQuery.trim()) return;
    setIsSearchingBooks(true);

    try {
      const res = await fetch(`/api/library/search?query=${encodeURIComponent(bookQuery)}`);
      if (!res.ok) throw new Error("Offline");
      const results = await res.json();
      setBookResults(results);
    } catch (err) {
      console.warn("Failed to fetch library books from backend, using local defaults", err);
      const queryLower = bookQuery.toLowerCase();
      const results = [
        { title: "Introduction to Algorithms", author: "Thomas H. Cormen", popularityScore: 98, copiesAvailable: 2, totalCopies: 5, isbn: "978-0262033848", locationShelf: "CS-02-B" },
        { title: "The C Programming Language", author: "Kernighan & Ritchie", popularityScore: 95, copiesAvailable: 3, totalCopies: 4, isbn: "978-0131103627", locationShelf: "CS-01-A" },
        { title: "Clean Code", author: "Robert C. Martin", popularityScore: 92, copiesAvailable: 0, totalCopies: 3, isbn: "978-0132350884", locationShelf: "SE-03-A" },
        { title: "Head First Design Patterns", author: "Eric Freeman", popularityScore: 88, copiesAvailable: 4, totalCopies: 4, isbn: "978-0596007126", locationShelf: "SE-04-C" },
        { title: "Domain-Driven Design", author: "Eric Evans", popularityScore: 85, copiesAvailable: 1, totalCopies: 2, isbn: "978-0321125217", locationShelf: "SE-05-A" }
      ].filter(b => b.title.toLowerCase().includes(queryLower) || b.author.toLowerCase().includes(queryLower));
      
      setBookResults(results);
    } finally {
      setIsSearchingBooks(false);
    }
  };

  // Chat message submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data: AssistantResponse = await response.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: "assistant",
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions,
        traces: data.traces
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: "assistant",
        content: "Sorry, I ran into an error connecting to the campus intelligence gateway. Please ensure the backend services are running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Suggested Action handler
  const handleActionClick = (action: any) => {
    if (action.actionType === "NAVIGATE" && action.payload?.path) {
      const path = action.payload.path;
      if (path === "/library") setActiveTab("library");
      else if (path === "/cafeteria") setActiveTab("cafeteria");
      else if (path === "/academics") setActiveTab("academics");
      else if (path === "/events") setActiveTab("events");
      else setActiveTab("overview");
    }
  };

  // RSVP toggle
  const toggleRSVP = (id: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === id) {
        return {
          ...evt,
          rsvped: !evt.rsvped,
          rsvpCount: evt.rsvped ? evt.rsvpCount - 1 : evt.rsvpCount + 1
        };
      }
      return evt;
    }));
  };

  // Filtered menu items
  const filteredMenu = cafeteriaMenu.filter(item => {
    if (cafeteriaFilter === "vegan") return item.isVegan;
    if (cafeteriaFilter === "vegetarian") return item.isVegetarian;
    return true;
  });

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-[#1e293b] bg-[#0b0f19] flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#1e293b] flex items-center space-x-3 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase text-blue-400">Campus Intel</h1>
              <span className="text-[10px] text-slate-400 font-mono">MCP Dashboard v1.0</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "library"
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Library</span>
            </button>
            <button
              onClick={() => setActiveTab("cafeteria")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "cafeteria"
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <Coffee className="h-4 w-4" />
              <span>Cafeteria</span>
            </button>
            <button
              onClick={() => setActiveTab("academics")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "academics"
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Academics</span>
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "events"
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "analytics"
                  ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        {/* User profile section */}
        <div className="p-4 border-t border-[#1e293b] bg-[#070b13] flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-[#1e293b]">
            <User className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300">Jay Jagtap</p>
            <p className="text-[10px] text-slate-500 font-mono">ID: std-123</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#090d16] relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-[#1e293b] flex items-center justify-between px-8 bg-[#090d16]/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live MCP Node Sync
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1.5"></span>
              <span className="text-xs text-slate-400 font-mono">All servers online</span>
            </div>
          </div>
        </header>

        {/* Tab workspace area */}
        <div className="flex-1 overflow-y-auto p-8 pb-32">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
                  Welcome to Campus Intelligence
                </h2>
                <p className="text-slate-400 mt-2">
                  Unified model-context interfaces delivering real-time responses across your student record database.
                </p>
              </div>

              {/* Quick statistics widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setActiveTab("academics")} className="p-6 rounded-2xl border border-[#1e293b] bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] hover:border-blue-500/30 cursor-pointer transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Cumulative GPA</span>
                    <GraduationCap className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-4xl font-extrabold text-white">{academicsGpaData?.gpa || "3.85"}</p>
                  <p className="text-xs text-slate-500 mt-2">Top 5% in Computer Science major</p>
                </div>

                <div onClick={() => setActiveTab("cafeteria")} className="p-6 rounded-2xl border border-[#1e293b] bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] hover:border-emerald-500/30 cursor-pointer transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Meal Balance</span>
                    <Coffee className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-4xl font-extrabold text-white">$84.50</p>
                  <p className="text-xs text-slate-500 mt-2">Estimated wait time: 10 min</p>
                </div>

                <div onClick={() => setActiveTab("library")} className="p-6 rounded-2xl border border-[#1e293b] bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] hover:border-purple-500/30 cursor-pointer transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Library Records</span>
                    <BookOpen className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-4xl font-extrabold text-white">2 <span className="text-sm font-medium text-slate-400">due</span></p>
                  <p className="text-xs text-slate-500 mt-2">Floor 2 occupancy: 91% capacity</p>
                </div>

                <div onClick={() => setActiveTab("events")} className="p-6 rounded-2xl border border-[#1e293b] bg-gradient-to-b from-[#0e1626] to-[#0a0f1d] hover:border-pink-500/30 cursor-pointer transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">RSVP'd Events</span>
                    <Calendar className="h-5 w-5 text-pink-400" />
                  </div>
                  <p className="text-4xl font-extrabold text-white">1 <span className="text-sm font-medium text-slate-400">active</span></p>
                  <p className="text-xs text-slate-500 mt-2">Next event: Spring Career Fair</p>
                </div>
              </div>

              {/* Main dashboard widgets grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Academics scheduling preview widget */}
                <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-blue-400" />
                    <span>Today's Classes</span>
                  </h3>
                  <div className="space-y-4">
                    {classSchedule.slice(0, 2).map((cls) => (
                      <div key={cls.courseId} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/60 border border-[#1e293b]">
                        <div>
                          <p className="font-semibold text-white text-sm">{cls.courseName}</p>
                          <p className="text-xs text-slate-400 mt-1">{cls.instructor} • {cls.room}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md font-medium">
                            {cls.startTime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cafeteria quick review widget */}
                <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <Coffee className="h-4 w-4 text-emerald-400" />
                    <span>Cafeteria Wait Time & Menu</span>
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1e293b] flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Wait</p>
                      <p className="text-2xl font-bold text-white mt-1">10 <span className="text-sm font-medium text-slate-400">minutes</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-medium">
                        Medium Crowd
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 mb-2 font-semibold">Today's Specials</p>
                    <div className="flex justify-between items-center text-sm py-1 border-b border-[#1e293b]">
                      <span>Vegan Quinoa Bowl</span>
                      <span className="text-emerald-400 font-medium">$8.50</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1">
                      <span>Pan-Seared Salmon</span>
                      <span className="text-emerald-400 font-medium">$14.50</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* LIBRARY TAB */}
          {activeTab === "library" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Library Resource Hub</h2>
                <p className="text-slate-400 mt-1">Search the catalog and check study space conditions.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search Catalogs */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                  <h3 className="text-lg font-bold text-white">Search Books</h3>
                  <form onSubmit={handleBookSearch} className="flex space-x-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by title, author, category..."
                        value={bookQuery}
                        onChange={(e) => setBookQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-[#1e293b] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingBooks}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors flex items-center space-x-2 text-white"
                    >
                      {isSearchingBooks ? "Searching..." : "Search"}
                    </button>
                  </form>

                  <div className="space-y-4">
                    {bookResults.map((book: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-[#1e293b] hover:border-slate-700 transition-colors">
                        <div>
                          <p className="font-semibold text-white text-sm">{book.title}</p>
                          <p className="text-xs text-slate-400 mt-1">by {book.author}</p>
                          <span className="inline-block text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded mt-2">
                            Shelf: {book.locationShelf || "N/A"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            book.copiesAvailable > 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {book.copiesAvailable > 0 ? `${book.copiesAvailable} Available` : "Checked Out"}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-2 font-mono">ISBN: {book.isbn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Noise and Occupancy metrics */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                    <h3 className="text-lg font-bold text-white">Live Occupancy</h3>
                    <div className="space-y-4">
                      {libraryOccupancy.map((occ) => (
                        <div key={occ.floor} className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">Floor {occ.floor}</span>
                            <span className="text-slate-400">{occ.currentOccupancy}/{occ.maxCapacity} students</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                (occ.currentOccupancy / occ.maxCapacity) > 0.8
                                  ? "bg-rose-500"
                                  : (occ.currentOccupancy / occ.maxCapacity) > 0.5
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${(occ.currentOccupancy / occ.maxCapacity) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                              <span>{occ.noiseLevel} Level</span>
                            </span>
                            <span>{Math.round((occ.currentOccupancy / occ.maxCapacity) * 100)}% capacity</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CAFETERIA TAB */}
          {activeTab === "cafeteria" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Cafeteria Menu Planner</h2>
                <p className="text-slate-400 mt-1">Review culinary options, ingredients, and nutrition details.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Menu items list */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    {/* Meal Picker buttons */}
                    <div className="flex p-1 bg-slate-900 border border-[#1e293b] rounded-xl w-fit">
                      {(["Breakfast", "Lunch", "Dinner"] as const).map((meal) => (
                        <button
                          key={meal}
                          onClick={() => setCafeteriaMeal(meal)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            cafeteriaMeal === meal
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {meal}
                        </button>
                      ))}
                    </div>

                    {/* Vegan Filter */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCafeteriaFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          cafeteriaFilter === "all"
                            ? "bg-slate-800 border-slate-700 text-slate-200"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setCafeteriaFilter("vegan")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          cafeteriaFilter === "vegan"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Vegan Only 🌱
                      </button>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-4">
                    {isFetchingMenu ? (
                      <div className="text-center py-8 text-slate-500 text-sm">Updating menu...</div>
                    ) : filteredMenu.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">No items found for this selection.</div>
                    ) : (
                      filteredMenu.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/60 border border-[#1e293b]">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white text-sm">{item.name}</span>
                              {item.isVegan && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Vegan 🌱</span>}
                              {!item.isVegan && item.isVegetarian && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Veg 🧀</span>}
                            </div>
                            {item.allergens.length > 0 && (
                              <p className="text-[10px] text-rose-400 mt-1 flex items-center space-x-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Contains: {item.allergens.join(", ")}</span>
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-emerald-400">${item.price.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Wait time and nutritional details */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                    <h3 className="text-lg font-bold text-white">Dining Hall Info</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-900 border border-[#1e293b]">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Status</span>
                          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Open</span>
                          </span>
                        </div>
                        <p className="text-2xl font-black text-white mt-2">10 min</p>
                        <p className="text-xs text-slate-500 mt-1">Average kitchen preparation time</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-[#1e293b] space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Breakfast hours</span>
                          <span className="text-slate-300">07:00 AM - 09:30 AM</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Lunch hours</span>
                          <span className="text-slate-300">11:30 AM - 02:00 PM</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Dinner hours</span>
                          <span className="text-slate-300">05:30 PM - 08:30 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACADEMICS TAB */}
          {activeTab === "academics" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Academic Performance & Schedule</h2>
                <p className="text-slate-400 mt-1">Manage classes, grade trends, and curriculum deadlines.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grades details */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                  <h3 className="text-lg font-bold text-white">Academic History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#1e293b] text-slate-400 text-xs uppercase font-bold">
                          <th className="pb-3">Course Code</th>
                          <th className="pb-3">Course Name</th>
                          <th className="pb-3">Semester</th>
                          <th className="pb-3 text-center">Credits</th>
                          <th className="pb-3 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {academicsGpaData?.gradesHistory?.map((grade: any) => (
                          <tr key={grade.courseId} className="border-b border-[#1e293b]/50 text-slate-300 hover:bg-slate-900/30 transition-colors">
                            <td className="py-4 font-mono text-xs">{grade.courseId}</td>
                            <td className="py-4 font-semibold text-white">{grade.courseName}</td>
                            <td className="py-4 text-xs text-slate-400">{grade.semester}</td>
                            <td className="py-4 text-center">{grade.credits}</td>
                            <td className="py-4 text-right font-bold text-blue-400">{grade.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Class timetable */}
                <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                  <h3 className="text-lg font-bold text-white">Class Timetable</h3>
                  <div className="space-y-4">
                    {classSchedule.map((cls) => (
                      <div key={cls.courseId} className="p-4 rounded-xl bg-slate-900/60 border border-[#1e293b] space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-white text-sm">{cls.courseName}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                            {cls.courseId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{cls.instructor} • {cls.room}</p>
                        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                          <span>{cls.days.join(", ")}</span>
                          <span className="font-semibold text-blue-400">{cls.startTime} - {cls.endTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Campus Events & Calendar</h2>
                <p className="text-slate-400 mt-1">Discover upcoming workshops, career sessions, and socials.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((evt) => (
                  <div key={evt.id} className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          evt.category === "Academic"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : evt.category === "Career"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                        }`}>
                          {evt.category}
                        </span>
                        <span className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{evt.rsvpCount} / {evt.capacity || 1000}</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{evt.title}</h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{evt.description}</p>
                      </div>

                      <div className="space-y-2 text-xs text-slate-400 pt-4 border-t border-slate-900">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{new Date(evt.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{evt.location.buildingName} {evt.location.room ? `- ${evt.location.room}` : ""}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => toggleRSVP(evt.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                          evt.rsvped
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        {evt.rsvped ? "Registered (Click to Cancel)" : "RSVP Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Observability & Analytics</h2>
                <p className="text-slate-400 mt-1">Live metrics from MCP servers and AI Gateway tracing.</p>
              </div>

              {!metricsData ? (
                <div className="flex items-center justify-center h-48 border border-[#1e293b] rounded-2xl bg-[#0b0f19]">
                  <p className="text-slate-400 flex items-center space-x-2">
                    <span className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    <span>Fetching live metrics...</span>
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl border border-[#1e293b] bg-gradient-to-b from-[#0e1626] to-[#0a0f1d]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Total Gateway Requests</span>
                        <BarChart2 className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="text-4xl font-extrabold text-white">
                        {Object.values(metricsData.servers as Record<string, any>).reduce((acc: number, curr: any) => acc + curr.requestCount, 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">Across all interconnected nodes</p>
                    </div>

                    <div className="p-6 rounded-2xl border border-[#1e293b] bg-gradient-to-b from-[#0e1626] to-[#0a0f1d]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Global Error Count</span>
                        <AlertTriangle className="h-5 w-5 text-rose-400" />
                      </div>
                      <p className="text-4xl font-extrabold text-white">
                        {Object.values(metricsData.servers as Record<string, any>).reduce((acc: number, curr: any) => acc + curr.errorCount, 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">System reliability at 99.4%</p>
                    </div>

                    <div className="p-6 rounded-2xl border border-[#1e293b] bg-gradient-to-b from-[#0e1626] to-[#0a0f1d]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Average P90 Latency</span>
                        <Clock className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-4xl font-extrabold text-white">
                        {(() => {
                          const servers = Object.values(metricsData.servers as Record<string, any>);
                          const totalLat = servers.reduce((acc, curr) => acc + curr.totalLatencyMs, 0);
                          const totalReq = servers.reduce((acc, curr) => acc + curr.requestCount, 0) || 1;
                          return Math.round(totalLat / totalReq);
                        })()} <span className="text-sm font-medium text-slate-400">ms</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">Based on current load metrics</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tool Usage Chart */}
                    <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                      <h3 className="text-lg font-bold text-white">Tool Usage Frequency</h3>
                      <div className="space-y-4">
                        {Object.entries(metricsData.toolUsage as Record<string, number>)
                          .sort(([,a], [,b]) => b - a)
                          .map(([tool, count], idx) => {
                            const maxCount = Math.max(...Object.values(metricsData.toolUsage as Record<string, number>));
                            return (
                              <div key={tool} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-300 font-mono">{tool}</span>
                                  <span className="text-slate-400 font-bold">{count} calls</span>
                                </div>
                                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Server Health Matrix */}
                    <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#0b0f19] space-y-6">
                      <h3 className="text-lg font-bold text-white">Server Health Matrix</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(metricsData.servers as Record<string, any>).map(([key, server]) => (
                          <div key={key} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                            <h4 className="font-semibold text-white capitalize flex items-center space-x-2">
                              <span className={`h-2 w-2 rounded-full ${server.errorCount > 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <span>{key} MCP</span>
                            </h4>
                            <div className="mt-4 space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Total Requests</span>
                                <span className="text-slate-200">{server.requestCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Avg Latency</span>
                                <span className="text-slate-200">{server.requestCount ? Math.round(server.totalLatencyMs / server.requestCount) : 0}ms</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-slate-800">
                                <span className="text-slate-400">Errors</span>
                                <span className={server.errorCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                                  {server.errorCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* EMBEDDED CHAT ASSISTANT PANEL */}
        <section className="absolute bottom-6 right-6 w-96 max-h-[500px] h-[500px] border border-[#1e293b] bg-[#0b0f19]/95 backdrop-blur-md rounded-2xl flex flex-col justify-between shadow-2xl shadow-black/80 z-20 overflow-hidden">
          {/* Assistant Header */}
          <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wide">Campus AI Copilot</p>
                <span className="text-[9px] text-slate-400 font-mono">Real-time MCP Gateway</span>
              </div>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Chat message viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-[#172033]/80 border border-[#1e293b] text-slate-200 rounded-bl-none"
                  }`}
                >
                  {/* Render AI Reasoning block if traces exist */}
                  {msg.traces && msg.traces.length > 0 && (
                    <div className="mb-3 p-2.5 rounded-lg bg-[#0b0f19] border border-slate-700/50 text-[10px] space-y-2">
                      <div className="font-semibold text-slate-300 flex items-center space-x-1 border-b border-slate-700/50 pb-1 mb-1.5">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        <span>AI Reasoning:</span>
                      </div>
                      {msg.traces.map((trace, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-start space-x-1.5 text-emerald-400">
                            <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                            <span className="leading-tight text-slate-300">{trace.reason}</span>
                          </div>
                          <div className="flex items-start space-x-1.5 text-slate-400">
                            <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                            <span className="leading-tight text-slate-400">Retrieved {trace.recordsReturned} record{trace.recordsReturned !== 1 ? 's' : ''} from {trace.serverKey}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-start space-x-1.5 text-slate-300 pt-1.5 mt-1.5 border-t border-slate-700/50">
                        <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                        <span>Response generated successfully</span>
                      </div>
                    </div>
                  )}

                  {/* Handle Markdown bullet renders in answers */}
                  <div className="whitespace-pre-line">
                    {msg.content}
                  </div>

                  {/* Render Suggested Actions if they exist */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-[#1e293b]/60">
                      {msg.suggestedActions.map((action, actionIdx) => (
                        <button
                          key={actionIdx}
                          onClick={() => handleActionClick(action)}
                          className="flex items-center space-x-1 px-3 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 text-[10px] font-semibold transition-all duration-200"
                        >
                          <span>{action.label}</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 p-1">
                <span className="text-[10px] text-slate-400">Copilot thinking...</span>
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Chat Message Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1e293b] bg-[#070a12] flex space-x-2">
            <input
              type="text"
              placeholder="Ask about GPA, schedule, menus, events..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-900/60 border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}
