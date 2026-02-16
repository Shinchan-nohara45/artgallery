import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import { Paintbrush, Star, Users, ShoppingCart } from 'lucide-react';

const Index = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch("/api/artworks"); // 👈 your backend route
        const data = await res.json();
        setArtworks(data);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      
      {/* Gallery Section */}
      <section className="py-20 px-4 bg-artbloom-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-artbloom-gold bg-white rounded-full">
              Gallery
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-artbloom-charcoal mb-4">
              Discover Inspiring Artworks
            </h2>
            <p className="max-w-2xl mx-auto text-artbloom-charcoal/80">
              Explore a world of creativity through our curated collection of artworks from talented artists.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-artbloom-charcoal/70">Loading artworks...</p>
          ) : artworks.length === 0 ? (
            <p className="text-center text-artbloom-charcoal/70">No artworks available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <div 
                  key={artwork.id}
                  className="glass-card rounded-xl overflow-hidden hover-lift"
                >
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-artbloom-charcoal">
                      {artwork.title}
                    </h3>
                    <p className="text-artbloom-charcoal/70 text-sm mb-4">
                      By {artwork.artist}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-artbloom-gold">
                        ${artwork.price}
                      </span>
                      <button className="px-3 py-1 text-sm bg-artbloom-gold/90 text-white rounded hover:bg-artbloom-gold transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-white text-artbloom-brown border border-artbloom-brown/30 font-medium rounded-md shadow-md hover:bg-artbloom-brown hover:text-white transition-all duration-300">
              Explore Full Gallery
            </button>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card rounded-xl p-8 md:p-12 bg-gradient-to-r from-artbloom-peach/40 to-artbloom-cream">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="mb-4 p-3 bg-white/70 rounded-full">
                  <Paintbrush className="h-8 w-8 text-artbloom-gold" />
                </div>
                <span className="text-4xl font-bold text-artbloom-charcoal mb-2">10K+</span>
                <span className="text-artbloom-charcoal/80">Artworks Created</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="mb-4 p-3 bg-white/70 rounded-full">
                  <Users className="h-8 w-8 text-artbloom-gold" />
                </div>
                <span className="text-4xl font-bold text-artbloom-charcoal mb-2">5K+</span>
                <span className="text-artbloom-charcoal/80">Active Artists</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="mb-4 p-3 bg-white/70 rounded-full">
                  <Star className="h-8 w-8 text-artbloom-gold" />
                </div>
                <span className="text-4xl font-bold text-artbloom-charcoal mb-2">4.9</span>
                <span className="text-artbloom-charcoal/80">Average Rating</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="mb-4 p-3 bg-white/70 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-artbloom-gold" />
                </div>
                <span className="text-4xl font-bold text-artbloom-charcoal mb-2">8K+</span>
                <span className="text-artbloom-charcoal/80">Sales Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-artbloom-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-artbloom-gold bg-white rounded-full">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-artbloom-charcoal mb-4">
              What Our Artists Say
            </h2>
            <p className="max-w-2xl mx-auto text-artbloom-charcoal/80">
              Hear from artists who have found success and inspiration through ArtBloom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Digital Artist",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
                quote: "ArtBloom transformed my artistic journey. The platform's tools and supportive community helped me refine my style and connect with art lovers worldwide."
              },
              {
                name: "Michael Chen",
                role: "Painter",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
                quote: "I've been selling my paintings online for years, but since joining ArtBloom, my sales have doubled. The exposure and tools they provide are unmatched."
              },
              {
                name: "Olivia Martinez",
                role: "Illustrator",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
                quote: "What I love most about ArtBloom is how they've created not just a marketplace but a genuine community where artists can learn from each other."
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="glass-card rounded-xl p-6 hover-lift"
              >
                <div className="mb-6">
                  <svg className="h-8 w-8 text-artbloom-gold/80" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <p className="text-artbloom-charcoal/90 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-artbloom-charcoal">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-artbloom-charcoal/70">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-artbloom-charcoal mb-6">
            Ready to Start Your Creative Journey?
          </h2>
          <p className="text-lg text-artbloom-charcoal/80 mb-8 max-w-2xl mx-auto">
            Join thousands of artists who have found their creative home at ArtBloom. Sign up today and unleash your artistic potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-artbloom-gold text-white font-medium rounded-md shadow-lg hover:bg-artbloom-gold/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              Sign Up for Free
            </button>
            <button className="px-8 py-3 bg-white text-artbloom-brown border border-artbloom-brown/30 font-medium rounded-md shadow hover:bg-artbloom-brown/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
