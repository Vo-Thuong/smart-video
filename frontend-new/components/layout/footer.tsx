"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Github, Youtube, Mail, Globe, Send } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t border-border mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand Intro */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-black-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:rotate-6 transition-transform overflow-hidden">
                          <Image
                            src="/assets/image/logo/logo-smart-video.png"
                            alt="Smart Video Logo"
                            width={60}
                            height={60}
                            className="object-contain"
                          />
                        </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Smart<span className="text-blue-600">Video</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              An intelligent language learning platform leveraging AI and
              Dictation methods to help you master listening and writing skills
              naturally and effectively.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link
                href="https://github.com/Vo-Thuong"
                target="_blank"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <Github size={20} />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-blue-600 transition-colors"
              >
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link
                  href="/explore"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explore Videos
                </Link>
              </li>
              <li>
                <Link
                  href="/dictation"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dictation Practice
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pro Plan (AI Premium)
                </Link>
              </li>
              <li>
                <Link
                  href="/mobile-app"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Download Flutter App
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feedback & Ideas
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest AI-driven language learning methods delivered to
              your inbox.
            </p>
            <form
              className="relative group"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address..."
                className="w-full bg-secondary/50 border border-border rounded-xl py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              />
              <button className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright & Metadata */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Smart-Video Engine.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
              <Globe size={14} /> English (US)
            </span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
              <Mail size={14} /> contact@smartvideo.io
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
