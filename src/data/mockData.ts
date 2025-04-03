
import { Article } from "@/components/ArticleCard";

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Scientists Discover New Planet That Could Support Life",
    excerpt: "Astronomers have found a new exoplanet in the habitable zone of its star, raising hopes for finding extraterrestrial life.",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    date: "June 15, 2023",
    author: "Dr. Jane Smith",
    verificationStatus: "true"
  },
  {
    id: "2",
    title: "Study Claims Chocolate Prevents Heart Disease",
    excerpt: "A viral study claiming chocolate consumption drastically reduces heart disease has been circulating on social media, but the evidence doesn't fully support these claims.",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    date: "May 28, 2023",
    author: "Michael Johnson",
    verificationStatus: "partial"
  },
  {
    id: "3",
    title: "Government Implementing Microchips in Vaccines",
    excerpt: "Claims that COVID-19 vaccines contain microchips for tracking citizens have been thoroughly debunked by multiple independent laboratories.",
    image: "https://images.unsplash.com/photo-1631478574891-21ca7d6530f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    date: "April 10, 2023",
    author: "Sarah Williams",
    verificationStatus: "false"
  },
  {
    id: "4",
    title: "New Study Links Coffee to Increased Lifespan",
    excerpt: "Research published in a leading medical journal suggests that moderate coffee consumption may be associated with longer lifespan.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    date: "July 2, 2023",
    author: "Dr. Robert Chen",
    verificationStatus: "true"
  },
  {
    id: "5",
    title: "Celebrity Claims Unusual Diet Cured Serious Illness",
    excerpt: "A Hollywood celebrity's claim that a specific diet cured their chronic illness has gone viral, but medical experts warn about the lack of scientific evidence.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    date: "June 20, 2023",
    author: "Emma Richards",
    verificationStatus: "partial"
  },
  {
    id: "6",
    title: "Viral Video Shows Politician Making Controversial Statement",
    excerpt: "A deceptively edited video circulating online makes it appear that a politician made offensive remarks. Our analysis shows the statement was taken out of context.",
    image: "https://images.unsplash.com/photo-1570737209810-87a8e7245f88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80",
    date: "May 15, 2023",
    author: "Thomas Anderson",
    verificationStatus: "false"
  }
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "user";
  avatar?: string;
}

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@truthbeacon.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
  },
  {
    id: "u2",
    name: "Editor User",
    email: "editor@truthbeacon.com",
    role: "editor",
    avatar: "https://ui-avatars.com/api/?name=Editor+User&background=2C7A7B&color=fff"
  },
  {
    id: "u3",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    avatar: "https://ui-avatars.com/api/?name=Regular+User&background=718096&color=fff"
  }
];
