import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import studentImage from "../assets/image.png";

// --- TYPES AND INTERFACES ---

/** Defines the structure for a single testimonial object. */
interface Testimonial {
    quote: string;
    author: string;
}

/** Defines the structure for the FeatureCard props. */
interface FeatureCardProps {
    icon: string;
    title: string;
    desc: string;
}

/** Defines the structure for the Section component props. */
interface SectionProps {
    children: React.ReactNode;
    className?: string;
}

/** Defines the structure for the TestimonialCarousel props. */
interface TestimonialCarouselProps {
    testimonials: Testimonial[];
}

// --- HELPER COMPONENTS ---

/**
 * Helper component for simple structural divisions.
 * Ensures max width and consistent padding.
 */
const Section: React.FC<SectionProps> = ({ children, className = "" }) => (
  <section className={`w-full py-16 md:py-24 ${className}`}>
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      {children}
    </div>
  </section>
);

/**
 * Custom Feature Card Component (Simple, clean design).
 */
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
    <div
        className="p-6 bg-theme-secondary rounded-xl shadow-md border border-theme transform transition duration-300 hover:scale-[1.02] hover:shadow-lg"
    >
        <div className="text-4xl text-cyan-600 dark:text-cyan-400 mb-3">{icon}</div>
        <h3 className="font-extrabold text-xl mb-2 text-theme-primary">{title}</h3>
        <p className="text-theme-secondary text-base">{desc}</p>
    </div>
);

/**
 * Testimonial Carousel Component (Moving Carousel with auto-scroll and manual controls).
 */
const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    
    const totalTestimonials = testimonials.length;

    // Function to move to the next slide, wrapped in useCallback for useEffect dependency stability
    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => 
            prevIndex === totalTestimonials - 1 ? 0 : prevIndex + 1
        );
    }, [totalTestimonials]);

    // Auto-scroll effect - cleans up interval on unmount or dependency change
    useEffect(() => {
        if (isHovering || totalTestimonials === 0) return;

        const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        return () => clearInterval(interval);
    }, [nextSlide, isHovering, totalTestimonials]);

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? totalTestimonials - 1 : prevIndex - 1
        );
    };
    
    // Prevents rendering carousel if there are no testimonials
    if (totalTestimonials === 0) {
        return null; 
    }

    return (
        <div 
            className="relative overflow-hidden rounded-xl group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {testimonials.map((testimonial, index) => (
                    // Each testimonial slide takes full width
                    <div 
                        key={index} 
                        className="flex-shrink-0 w-full grid grid-cols-1 md:grid-cols-3 items-center gap-10 p-4"
                    >
                        {/* Testimonial Quote and Author */}
                        <div className="md:col-span-1 flex items-center justify-center p-4 bg-theme-primary rounded-xl shadow-lg border-l-4 border-cyan-600 min-h-[250px]">
                            <blockquote className="text-left">
                                <p className="text-xl font-medium italic text-theme-primary mb-4">
                                    "{testimonial.quote}"
                                </p>
                                <footer className="font-extrabold text-cyan-600 dark:text-cyan-400 text-lg">
                                    - {testimonial.author}
                                </footer>
                            </blockquote>
                        </div>
                        
                        {/* Visual/Stat placeholders (Hidden on small screens) */}
                        <div className="hidden md:col-span-2 md:grid grid-cols-2 gap-8">
                             <StatCard value="95%" label="Job Placement Rate" />
                             <StatCard value="4.9/5" label="Satisfaction Score" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to testimonial slide ${index + 1}`}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'bg-cyan-600 w-6' : 'bg-theme-primary border border-theme'
                        }`}
                    />
                ))}
            </div>

            {/* Navigation Arrows (Hidden unless mouse is hovering for a cleaner look) */}
            <ArrowButton 
                direction="prev" 
                onClick={prevSlide}
                className="left-4" 
            />
            <ArrowButton 
                direction="next" 
                onClick={nextSlide}
                className="right-4" 
            />
        </div>
    );
};

// Simple reusable component for the stat cards inside the carousel
const StatCard: React.FC<{ value: string, label: string }> = ({ value, label }) => (
     <div className="bg-theme-primary p-8 rounded-xl shadow-inner border border-theme flex flex-col justify-center items-center">
        <p className="text-5xl font-extrabold text-cyan-600 dark:text-cyan-400 mb-2">{value}</p>
        <p className="text-theme-secondary text-lg text-center">{label}</p>
    </div>
);

// Simple reusable component for the carousel arrows
const ArrowButton: React.FC<{ direction: 'prev' | 'next', onClick: () => void, className: string }> = ({ direction, onClick, className }) => (
     <button 
        onClick={onClick}
        aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
        className={`absolute top-1/2 transform -translate-y-1/2 p-3 bg-theme-primary/80 rounded-full text-theme-primary shadow-lg transition opacity-0 group-hover:opacity-100 hover:bg-theme-primary z-20 ${className}`}
    >
        {direction === 'prev' ? '‹' : '›'}
    </button>
);


// --- MAIN LANDING PAGE COMPONENT ---

export default function LandingPage() {
  
  // Helper function for placeholder images
  const courseCategoryUrl = (category: string) => 
    `https://placehold.co/400x250/374151/FFFFFF?text=${category.replace(/ /g, '+')}`;

  const testimonialsData: Testimonial[] = [
    { quote: "The curriculum is rigorous yet engaging. I finally understood complex concepts that were confusing before.", author: "Aisha K., Data Analyst" },
    { quote: "I appreciate the lifetime access and practical exercises. It's the best investment I've made in my career.", author: "Ben M., Full Stack Developer" },
    { quote: "Got my certificate and a 30% raise within four months of completion. The course material is top-notch!", author: "Chun L., Project Manager" },
    { quote: "The mentorship program was invaluable; it helped me successfully transition into a new tech career path.", author: "David L., Cloud Engineer" },
  ];

  return (
    <div className="min-h-screen bg-theme-primary transition-colors duration-500 flex flex-col items-center">
    
     {/* 1. HERO SECTION */}
     <Section className="!py-10 lg:!py-10 bg-theme-secondary shadow-lg border-b border-theme">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-12 lg:gap-20">

            {/* Left Text Section */}
            <div className="animate-slideInFromTop text-left pt-[88px]">
                <p className="text-xl font-medium text-theme-secondary mb-3 tracking-widest uppercase">
                    Smart-learning
                </p>

                <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight text-theme-primary">
                    Learn. Grow. <br />
                    <span className="text-cyan-600 dark:text-cyan-400">Succeed Anywhere</span>
                </h1>

                <p className="text-lg text-theme-secondary mb-10 max-w-lg">
                    Power up your career with cutting-edge courses, top mentors, and flexible learning built for tomorrow’s leaders.
                </p>

                <div className="flex space-x-4">
                    <Link
                        to="/register"
                        className="px-8 py-3 text-lg font-bold text-white 
                                bg-cyan-600 rounded-lg 
                                shadow-md transform transition duration-300 hover:scale-[1.03] hover:bg-cyan-700"
                    >
                        Enroll Now
                    </Link>

                    <Link
                        to="/courses"
                        className="px-8 py-3 text-lg font-bold rounded-lg 
                                border-2 border-theme text-theme-primary bg-transparent 
                                transform transition duration-300 hover:scale-[1.03] hover:border-cyan-600 hover:text-cyan-600"
                    >
                        Buy Course
                    </Link>
                </div>
            </div>

            {/* Right Image Section */}
            <div className="relative flex justify-center items-center h-full min-h-[300px] lg:min-h-0 pt-[70px]">
                {/* Cyan blob background for visual interest */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-30 w-[600px] h-[600px] lg:w-[800px] lg:h-[900px] pointer-events-none z-0">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <defs>
                            <linearGradient id="sw-gradient" x1="0" x2="1" y1="1" y2="0">
                            <stop stopColor="rgba(0, 255, 255, 0.8)" offset="0%"></stop>
                            <stop stopColor="rgba(0, 170, 255, 0.8)" offset="100%"></stop>
                            </linearGradient>
                        </defs>
                        <path
                            fill="url(#sw-gradient)"
                            d="M33.2,-24.7C40.7,-17.1,42.9,-3.4,39.5,8.1C36.2,19.7,27.3,29,17,33.1C6.8,37.2,-5,36,-14.1,30.9C-23.2,25.9,-29.6,17.1,-33.1,6.3C-36.6,-4.6,-37.2,-17.3,-31.2,-24.6C-25.2,-32,-12.6,-33.8,0.1,-33.9C12.8,-34,25.7,-32.4,33.2,-24.7Z"
                            transform="translate(50 50)"
                            strokeWidth="0"
                            style={{ transition: '0.3s' }}
                        />
                    </svg>
                </div>

                {/* Student image */}
                <img
                    src={studentImage}
                    alt="A smiling student pointing up and holding a book"
                    className="relative z-10 w-full max-w-md h-auto animate-zoomIn rounded-br-3xl "
                    onError={(e) => {
                        // Fallback image source on error
                        e.currentTarget.src = "https://placehold.co/400x400/00FFFF/000000?text=Visual+Placeholder";
                    }}
                />
            </div>
        </div>
    </Section>

     {/* 2. TRUSTED BY SECTION */}
     <Section className="!py-10 bg-theme-primary">
        <h2 className="text-center text-xl font-semibold text-theme-secondary mb-8 uppercase tracking-widest">
            Trusted by Leaders in Education and Industry
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 md:gap-x-16 opacity-80">
            {['Google', 'Coursera', 'Udemy', 'Meta', 'AWS', 'NPTEL'].map((logo, index) => (
                 <span key={index} className="text-3xl md:text-4xl font-extrabold text-theme-primary/80 dark:text-gray-300">
                    {logo}
                </span>
            ))}
        </div>
     </Section>

    {/* 3. FEATURE CARDS SECTION */}
    <Section className="bg-theme-primary">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-theme-primary">
          The Smartest Way to Learn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
                icon="🧠" 
                title="AI-Powered Curriculum" 
                desc="Adaptive paths that adjust to your pace, ensuring you master every concept." 
            />
            <FeatureCard 
                icon="💼" 
                title="Industry Recognized" 
                desc="Certificates co-developed and validated by leading tech and educational partners." 
            />
            <FeatureCard 
                icon="🌎" 
                title="Global Instructor Pool" 
                desc="Learn directly from university professors and top-tier industry experts worldwide." 
            />
        </div>
    </Section>
     
    {/* 4. COURSE CATEGORIES SECTION */}
    <Section className="bg-theme-secondary border-y border-theme">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-theme-primary">
          Explore High-Demand Course Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Category Card 1: Data Science */}
            <Link to="/category/data" className="relative overflow-hidden rounded-xl shadow-xl group cursor-pointer border border-theme hover:border-cyan-600 transition duration-500">
                <img src={courseCategoryUrl('Data Science')} alt="Data Science Category" className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white z-10">
                    <h3 className="text-3xl font-bold mb-1">Data Science</h3>
                    <p className="text-sm text-gray-300">Python, R, Machine Learning</p>
                </div>
            </Link>

            {/* Category Card 2: Web Development */}
            <Link to="/category/webdev" className="relative overflow-hidden rounded-xl shadow-xl group cursor-pointer border border-theme hover:border-cyan-600 transition duration-500">
                <img src={courseCategoryUrl('Web Development')} alt="Web Development Category" className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white z-10">
                    <h3 className="text-3xl font-bold mb-1">Web Development</h3>
                    <p className="text-sm text-gray-300">React, Node, Cloud Services</p>
                </div>
            </Link>

            {/* Category Card 3: Business & Management */}
            <Link to="/category/business" className="relative overflow-hidden rounded-xl shadow-xl group cursor-pointer border border-theme hover:border-cyan-600 transition duration-500">
                <img src={courseCategoryUrl('Business')} alt="Business Category" className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white z-10">
                    <h3 className="text-3xl font-bold mb-1">Business Strategy</h3>
                    <p className="text-sm text-gray-300">Management, Finance, Leadership</p>
                </div>
            </Link>
        </div>
    </Section>
      
    {/* 5. STATS AND METRICS SECTION */}
    <Section className="bg-theme-primary !py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatPillar value="15K+" label="Students Enrolled" />
            <StatPillar value="4.8" label="Average Rating" />
            <StatPillar value="50+" label="Certified Programs" />
            <StatPillar value="90%" label="Career Switch Rate" />
        </div>
    </Section>

    {/* 6. TESTIMONIAL CAROUSEL SECTION */}
    <Section className="bg-theme-secondary border-t border-b border-theme">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-theme-primary">
            Success Stories
        </h2>
        <TestimonialCarousel testimonials={testimonialsData} />
    </Section>

    {/* 7. CTA (CALL-TO-ACTION) SECTION */}
    <Section className="bg-theme-primary text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-theme-primary">
          Ready to Start Your Journey?
        </h2>
        <p className="text-xl text-theme-secondary mb-10 font-light">
          Access high-quality courses and certified expertise today.
        </p>
        <Link
          to="/register"
          className="px-12 py-4 text-2xl font-extrabold text-white 
                     bg-cyan-600 rounded-lg 
                     shadow-lg shadow-cyan-600/50 transform transition duration-300 hover:scale-[1.05] hover:bg-cyan-700"
        >
          Enroll Now and Get Started
        </Link>
    </Section>
    </div>
  );
}

// Simple reusable component for the stat pillars (moved from inline for clarity)
const StatPillar: React.FC<{ value: string, label: string }> = ({ value, label }) => (
    <div className="p-4">
        <h3 className="text-5xl font-extrabold text-cyan-600 dark:text-cyan-400 mb-2">{value}</h3>
        <p className="text-lg text-theme-primary font-semibold">{label}</p>
    </div>
);