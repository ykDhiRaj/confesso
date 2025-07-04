import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import {Toaster} from "react-hot-toast";


export const metadata: Metadata = {
  title: "Confesso - Anonymous Voice Confessions",
  description: "Confesso is a safe and anonymous platform where you can record and share your deepest thoughts through voice. Explore trending confessions, react in real-time, and discover what people are truly feeling.",
  keywords: [
    "Confesso",
    "Anonymous Confessions",
    "Voice Confession App",
    "Confession Platform",
    "Anonymous Voice Sharing",
    "Emotional Expression",
    "Audio Confession",
    "Share Secrets",
    "Safe Space",
    "Mental Health"
  ],
  authors: [{ name: "Confesso Team", url: "https://github.com/ykDhiRaj/confesso" }],
  creator: "Confesso",
  openGraph: {
    title: "Confesso - Share Your Thoughts Anonymously",
    description: "Speak your truth. Listen to others. Confesso lets you record and explore anonymous voice confessions in a safe and expressive environment.",
    url: "https://your-confesso-site.vercel.app", // Replace with your deployed URL
    siteName: "Confesso",
    locale: "en_US",
    type: "website",
  },
  metadataBase: new URL("https://confesso-six.vercel.app/"), // Replace with your deployed URL
};




export default function RootLayout({
  
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body
         cz-shortcut-listen="true"
      >
        <Navbar/>
        <div>
          {children}
          <Toaster />
          
        </div>
      </body>
    </html>
  );
}
