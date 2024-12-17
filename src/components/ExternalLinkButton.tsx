"use client";
import React from 'react';

export default function ExternalLinkButton() {
  return (
    <div className="flex justify-center items-center p-4">
      <a
        href="https://test-psychotechnique.paris/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Testez vos aptitudes sur test-psychotechnique.paris
      </a>
    </div>
  );
}
