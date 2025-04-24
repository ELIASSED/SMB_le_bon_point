"use client";
import React from 'react';

export default function ExternalLinkButton() {
  return (
    <div className="justify-center items-center ">
      <a
        href="https://test-psychotechnique.paris/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block  hover:bg-indigo-600 text-white  rounded transition-colors duration-200"
      >
        Testez vos aptitudes sur test-psychotechnique.paris
      </a>
    </div>
  );
}
