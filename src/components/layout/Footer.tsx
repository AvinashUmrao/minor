import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-foreground mb-4">Smart Education</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Your one-stop destination for competitive exam preparation.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/avinash-umrao-5184182b9/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/exam-prep" className="text-muted-foreground hover:text-primary transition-colors">Exam Preparation</Link></li>
              <li><Link to="/blogs" className="text-muted-foreground hover:text-primary transition-colors">Blogs</Link></li>
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Popular Exams</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/gate" className="text-muted-foreground hover:text-primary transition-colors">GATE</Link></li>
              <li><Link to="/exam-prep" className="text-muted-foreground hover:text-primary transition-colors">JEE</Link></li>
              <li><Link to="/exam-prep" className="text-muted-foreground hover:text-primary transition-colors">CAT</Link></li>
              <li><Link to="/exam-prep" className="text-muted-foreground hover:text-primary transition-colors">NEET</Link></li>
              <li><Link to="/exam-prep" className="text-muted-foreground hover:text-primary transition-colors">UPSC</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@smartedu.com
              </li>
              <li>Jaypee Institute of Information Technology</li>
              <li>Sector-62, Noida, India - 201309</li>
              <li>+91 8630029486</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Smart Education. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
