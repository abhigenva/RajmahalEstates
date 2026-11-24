import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaTwitter, FaFacebookF } from "react-icons/fa";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo className="w-8 h-8" />
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Rajmahal<span className="text-blue-600 dark:text-blue-500">Estates</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your trusted real estate platform for verified residential homes, plots, and commercial spaces across India’s fastest-growing cities.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Explore All Properties
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Agent Portal Login
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  List a Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Property Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Property Types
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Residential Houses & Villas
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Residential & 90A Plots
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Commercial & Retail Spaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                <span>Mansarovar, Jaipur, Rajasthan 302020</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-500 shrink-0" />
                <a href="tel:+919987094775" className="hover:text-blue-600 dark:hover:text-blue-400">
                  +91 99870 94775
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-500 shrink-0" />
                <a href="mailto:contact@rajmahalestates.com" className="hover:text-blue-600 dark:hover:text-blue-400">
                  contact@rajmahalestates.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} Rajmahal Estates. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>RERA Compliant Listings</span>
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}