'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // Import icons from lucide-react

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
                    bg-white/10 backdrop-blur-xs px-5 py-3 
                    rounded-full shadow-md border border-white/20 text-white w-[90%] max-w-[700px]">
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-center space-x-10 text-lg font-light">
        <Link href="/">
          <span className="hover:text-[#923C3E] cursor-pointer">Home</span>
        </Link>
        <Link href="/search">
          <span className="hover:text-[#923C3E] cursor-pointer">Search</span>
        </Link>
        <Link href="/upload">
          <span className="hover:text-[#923C3E] cursor-pointer">Upload</span>
        </Link>
        <Link href="/delete">
          <span className="hover:text-[#923C3E] cursor-pointer">Delete</span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex justify-between items-center md:hidden">
        <span className="text-lg font-light">Menu</span>
        <button onClick={toggleMenu} className="text-white focus:outline-none">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-black 
                        rounded-lg shadow-md border border-white/20 text-white py-2 px-4 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <div className="py-2 hover:text-[#923C3E] cursor-pointer">Home</div>
          </Link>
          <Link href="/search" onClick={() => setMenuOpen(false)}>
            <div className="py-2 hover:text-[#923C3E] cursor-pointer">Search</div>
          </Link>
          
          <Link href="/upload" onClick={() => setMenuOpen(false)}>
            <div className="py-2 hover:text-[#923C3E] cursor-pointer">Upload</div>
          </Link>
          <Link href="/delete" onClick={() => setMenuOpen(false)}>
            <div className="py-2 hover:text-[#923C3E] cursor-pointer">Delete</div>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
