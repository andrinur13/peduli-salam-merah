import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="kontak" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold text-foreground">Ramadhan Project 1447 H</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform donasi terpercaya untuk menyalurkan kebaikan kepada sesama yang membutuhkan.
            </p>
          </div>

          {/* Logo SM Ramadhan */}
          <div className="flex justify-center md:justify-start">
            <img 
              src="/sm_ramadhan.png" 
              alt="SM Ramadhan" 
              className="h-24 w-auto object-contain"
            />
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Kontak Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  ⁠Jl. Semampir Tengah No.39, Medokan Semampir, Kec. Sukolilo, Surabaya, Jawa Timur 60119
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:info@smpeduli.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ⁠surabayamengaji1@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="https://wa.me/6281235322441" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +62812-3532-2441
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
            <div>
            <h3 className="font-semibold text-foreground mb-4">Ikuti Kami</h3>
            <div className="flex gap-3">
              <a
              href="https://facebook.com/surabayamengaji"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-white transition-all duration-300"
              >
              <Facebook className="h-5 w-5" />
              </a>
              <a
              href="https://instagram.com/surabayamengaji"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-white transition-all duration-300"
              >
              <Instagram className="h-5 w-5" />
              </a>
              <a
              href="https://youtube.com/surabayamengaji"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-white transition-all duration-300"
              >
              <Youtube className="h-5 w-5" />
              </a>
            </div>
            </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SM Peduli - Surabaya Mengaji. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
