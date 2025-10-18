import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
              <span className="text-xl font-bold text-white">SM</span>
            </div>
            <span className="text-xl font-bold text-foreground">SM Peduli</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link to="/#campaigns" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Campaign
            </Link>
            <Link to="/#tentang" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Tentang Kami
            </Link>
            <Link to="/#kontak" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Kontak
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button className="bg-gradient-hero hover:shadow-glow transition-all duration-300">
              Donasi Sekarang
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-4 border-t border-border animate-fade-in">
            <Link
              to="/"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              to="/#campaigns"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Campaign
            </Link>
            <Link
              to="/#tentang"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Tentang Kami
            </Link>
            <Link
              to="/#kontak"
              className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Kontak
            </Link>
            <Button className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300">
              Donasi Sekarang
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
