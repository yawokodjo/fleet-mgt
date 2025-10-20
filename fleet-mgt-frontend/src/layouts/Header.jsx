import React from 'react';
import { motion } from "framer-motion";
export default function Header() {
  return (
    <header className="relative text-white bg-gray-800">
      {/*<img
        src="@/assets/road.jpg"
        alt="Fond route"
        className="absolute top-0 left-0 object-cover w-full h-52 opacity-30"
      />*/}
      <div className="relative z-10 flex items-center justify-between p-5 mt-5">
        <div className="flex items-center space-x-4">
          {/* Logo cliquable */}
          <a href="https://www.compassion.com/" target="_blank" rel="noopener noreferrer">
            <img
              src="/src/assets/logo-ci.png"
              alt="Logo"
              className="w-10 h-10 logo-ci"
              width="120"
              height="auto"
            />
          </a>
          <motion.h1
            className="text-center text-blue-500 font-bold text-xl sm:text-2xl lg:text-3xl"
            initial={{ opacity: 0, y: -20 }}     // départ invisible et légèrement au-dessus
            animate={{ opacity: 1, y: 0 }}       // apparition fluide
            transition={{ duration: 0.8, ease: "easeOut" }} // durée et effet d’animation
          >
            Gestion de Flotte Véhicule Compassion International Togo
          </motion.h1>
        </div>
        <div className="flex items-center space-x-3">
          <select className="p-1 bg-gray-700 rounded">
            <option>FR</option>
            <option>EN</option>
          </select>
          <input
            type="search"
            placeholder="Rechercher…"
            className="px-2 py-1 bg-gray-700 rounded"
          />
        </div>
      </div>
    </header >
  );
}
