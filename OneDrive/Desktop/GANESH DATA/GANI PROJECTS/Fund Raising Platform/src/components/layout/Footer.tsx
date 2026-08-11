import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Facebook, Linkedin, Instagram, Twitter } from "lucide-react";
import Logo from "@/components/Logo";

const footerLinks = {
  Organization: [
    { label: "About Us", to: "/about" },
    { label: "Campaigns", to: "/campaigns" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact", to: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/terms" },
  ],
  Account: [
    { label: "Sign In", to: "/login" },
    { label: "Start Fundraising", to: "/register" },
    { label: "Dashboard", to: "/dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold font-display text-white block">NayePankh</span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wide">FUNDRAISING PORTAL</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Together, We Can Create a Better Tomorrow. Empower change through meaningful donations and community-driven fundraising.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>contact@naye-pankh.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} NayePankh Foundation. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[Facebook, Linkedin, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                aria-label="Social media"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
