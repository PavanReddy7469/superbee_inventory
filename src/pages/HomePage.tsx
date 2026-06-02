import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, MapPin, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import logo from '../assets/superbee.png';

const images = [
  'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/1034693/pexels-photo-1034693.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'https://images.pexels.com/photos/2876511/pexels-photo-2876511.jpeg?auto=compress&cs=tinysrgb&w=1920'
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Superbee Aeronautics"
                className="h-14 w-auto"
              />
            </div>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-4">
            </div>
          </div>
        )}
      </nav>

      <section className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src={images[heroImageIndex]}
            alt="Drone"
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900"></div>
        </div>
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Advanced Drone
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Technology Solutions
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
                Leading the future of aerial innovation with cutting-edge drone technology and comprehensive inventory management systems.
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
              >
                <span>Access Portal</span>
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">About Superbee Aeronautics</h3>
              <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
                <p>
                  At Superbee Aeronautics, we are pioneers in the drone technology sector, dedicated to providing innovative aerial solutions that transform industries and enhance operational efficiency.
                </p>
                <p>
                  Our state-of-the-art inventory management system ensures seamless tracking, monitoring, and deployment of our extensive drone fleet, setting new standards in the aerospace industry.
                </p>
                <p>
                  With a commitment to excellence and cutting-edge technology, we deliver reliable, scalable solutions that meet the evolving needs of modern enterprises.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
                <div className="text-slate-300">Drones Managed</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
                <div className="text-slate-300">System Monitoring</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
                <div className="text-slate-300">Uptime Guarantee</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold text-cyan-400 mb-2">Real-time</div>
                <div className="text-slate-300">Inventory Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Location</h3>
            <p className="text-xl text-slate-300">Visit us at our state-of-the-art facility</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-600/5 border border-cyan-500/20 rounded-2xl p-8 md:p-12">
              <div className="flex items-start space-x-4 mb-8">
                <div className="bg-cyan-500/20 p-4 rounded-lg">
                  <MapPin className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Headquarters</h4>
                  <p className="text-slate-300 text-lg">Centurion University of Technology and Management</p>
                </div>
              </div>
              <div className="space-y-4 text-slate-300">
                <p><strong className="text-white">Superbee Aeronautics</strong><br />Centurion University of Technology and Management<br />Andhra Pradesh, India</p>
                <p><strong className="text-white">Operational Hours:</strong> Monday - Saturday: 9:00 AM - 6:00 PM</p>
                <p><strong className="text-white">Portal Access:</strong> 24/7 via our secure online system</p>
              </div>
              <button
                onClick={handleLogin}
                className="mt-8 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
              >
                <span>Login to Inventory Portal</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            <div className="h-96 md:h-full min-h-[400px] rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl">
              <img
                src="https://pbs.twimg.com/media/GhHNg7ZbsAALG6H?format=jpg&name=large"
                alt="Superbee Aeronautics Inauguration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0f1729] border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <img
                src={logo}
                alt="Superbee Aeronautics"
                className="h-12 w-auto mb-6"
              />
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Leading the future of aerial innovation with cutting-edge drone technology and inventory systems.
              </p>
              <div className="flex space-x-3">
                <a href="https://facebook.com/superbeeaeronautics" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-cyan-400 p-2.5 rounded transition">
                  <Facebook className="h-5 w-5 text-slate-900" />
                </a>
                <a href="https://twitter.com/superbeeaero" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-cyan-400 p-2.5 rounded transition">
                  <Twitter className="h-5 w-5 text-slate-900" />
                </a>
                <a href="https://linkedin.com/company/superbeeaeronautics" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-cyan-400 p-2.5 rounded transition">
                  <Linkedin className="h-5 w-5 text-slate-900" />
                </a>
                <a href="https://instagram.com/superbeeaeronautics" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-cyan-400 p-2.5 rounded transition">
                  <Instagram className="h-5 w-5 text-slate-900" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Useful Links</h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-slate-400 hover:text-cyan-400">Home</a></li>
                <li><a href="https://superbeeaeronautics.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400">About Us</a></li>
                <li><a href="https://superbeeaeronautics.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400">Services</a></li>
                <li><a href="mailto:info@superbeeaeronautics.com" className="text-slate-400 hover:text-cyan-400">Contact Us</a></li>
                <li><a href="/login" className="text-slate-400 hover:text-cyan-400">Login</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-cyan-400" />
                  <a href="mailto:info@superbeeaeronautics.com" className="text-slate-400 hover:text-cyan-400">
                    info@superbeeaeronautics.com
                  </a>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-cyan-400" />
                  <span className="text-slate-400">Centurion University<br />Andhra Pradesh</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Reach Us</h3>
              <div className="mt-6 rounded-lg overflow-hidden border border-slate-700 h-48">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.0847946917537!2d83.36647227490977!3d18.108528482101472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3be2cbe7c0c3f1%3A0x95ed674b6c5e2d0!2sSuperbee%20Aeronautics%20Pvt.%20Ltd.!5e0!3m2!1sen!2sin!4v1727700000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Superbee Aeronautics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
