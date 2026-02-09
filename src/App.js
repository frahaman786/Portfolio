import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ExternalLink, Download, Menu, X, Code, GraduationCap, Briefcase, User, MessageSquare, Star } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [user, setUser] = useState(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    message: '',
    rating: 5,
    role: '',
    company: ''
  });

  // Portfolio Data 
  const portfolioData = {
    name: "Fazley Rahaman Molla",
    title: "Computer Science Student",
    year: "2nd Year",
    university: "Guru Nanak Institute of Technology",
    tagline: "Passionate about building innovative solutions and learning new technologies",
    email: "frahaman520@gmail.com",
    github: "https://github.com/frahaman786",
    linkedin: "https://linkedin.com/in/fazley-rahaman-molla",
    resumeLink: "#",
    
    about: "I'm a second-year Computer Science student with a passion for problem-solving. I enjoy working on challenging projects and learning new technologies. My goal is to become a skilled software engineer and contribute to meaningful projects that make a difference.",
    
    skills: [
      { category: "Languages", items: ["Python", "Java"] },
      { category: "Frameworks & Libraries", items: ["React", "Node.js", "Express"] },
      { category: "Tools & Technologies", items: ["Git", "GitHub", "VS Code", "Linux", "MongoDB", "MySQL"] },
      { category: "Concepts", items: ["Data Structures", "Algorithms", "OOP", "Web Development"] }
    ],
    
    education: [
      {
        degree: "Bachelor of Technology in Computer Science",
        institution: "Guru Nanak Institute of Technology",
        duration: "2024 - 2028",
        grade: "CGPA: 7.7/10",
        coursework: ["Data Structures & Algorithms", "Object-Oriented Programming"]
      },
      {
        degree: "Secondary & Higher Secondary Education",
        institution: "Burdwan Municipal High School",
        duration: "2016 - 2024",
        grade: "Percentage: 87%(X), 83%(XII)",
        coursework: ["Mathematics", "Physics", "Chemistry", "Computer Science"]
      }
    ],
    
    projects: [
      {
        title: "E-Commerce Website",
        description: "A full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
        technologies: ["React", "Node.js", "MongoDB", "Express"],
        github: "https://github.com/yourusername/project1",
        demo: "#",
        features: ["User authentication", "Product search & filtering", "Shopping cart management", "Responsive design"]
      },
      {
        title: "Task Management App",
        description: "A productivity application for managing tasks and projects with drag-and-drop functionality and real-time updates.",
        technologies: ["React", "Firebase", "CSS"],
        github: "https://github.com/yourusername/project2",
        demo: "#",
        features: ["Drag & drop interface", "Real-time synchronization", "Task categorization", "Progress tracking"]
      },
      {
        title: "Weather Dashboard",
        description: "An interactive weather application displaying current conditions and forecasts using external API integration.",
        technologies: ["JavaScript", "HTML/CSS", "Weather API"],
        github: "https://github.com/yourusername/project3",
        demo: "#",
        features: ["Location-based weather", "5-day forecast", "Interactive charts", "Responsive design"]
      },
      {
        title: "Algorithm Visualizer",
        description: "A web application for visualizing sorting and searching algorithms to help understand their working principles.",
        technologies: ["React", "JavaScript", "CSS Animations"],
        github: "https://github.com/yourusername/project4",
        demo: "#",
        features: ["Multiple algorithms", "Step-by-step visualization", "Speed control", "Custom input arrays"]
      }
    ],
    
    experience: [
      {
        position: "Open Source Contributor",
        company: "Resourcio Community",
        duration: "Summer 2024",
        description: "Worked on frontend development projects and build responsive web applications.",
        achievements: [
          "Secure 14 Rank outof 260 Participate",
          "Improved website performance by 30% through optimization",
          "Collaborated with designers to implement UI/UX improvements"
        ]
      }
    ],
    
    achievements: [
      "Coming Soon"
    ]
  };

  // Load testimonials from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "testimonials"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonials(data);
    });

    return () => unsubscribe();
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'education', 'projects', 'experience', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      setUser({
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL
      });

      alert("Signed in successfully!");
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Google sign-in failed: " + error.message);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setShowTestimonialForm(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Submit Testimonial
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to leave a testimonial");
      return;
    }

    if (!testimonialForm.message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      await addDoc(collection(db, "testimonials"), {
        userName: user.name,
        userEmail: user.email,
        userPhoto: user.photoURL,
        message: testimonialForm.message,
        rating: testimonialForm.rating,
        role: testimonialForm.role,
        company: testimonialForm.company,
        createdAt: serverTimestamp()
      });

      // Reset form
      setTestimonialForm({
        message: '',
        rating: 5,
        role: '',
        company: ''
      });
      setShowTestimonialForm(false);
      alert("Thank you for your testimonial!");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      alert("Failed to submit testimonial: " + error.message);
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #e2e8f0;
        }

        .portfolio-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
        }

        /* Navigation */
        nav {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1000;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(to right, #c084fc, #f9a8d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links button {
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          font-size: 1rem;
          text-transform: capitalize;
          transition: color 0.3s;
        }

        .nav-links button:hover,
        .nav-links button.active {
          color: #c084fc;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .mobile-menu {
          display: none;
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(10px);
        }

        .mobile-menu.open {
          display: block;
        }

        .mobile-menu button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          font-size: 1rem;
          text-transform: capitalize;
          transition: all 0.3s;
        }

        .mobile-menu button:hover {
          background: rgba(51, 65, 85, 0.5);
          color: #c084fc;
        }

        /* Sections */
        section {
          min-height: 100vh;
          padding: 5rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-content {
          max-width: 1280px;
          width: 100%;
        }

        /* Home Section */
        .home-section {
          text-align: center;
          padding-top: 6rem;
        }

        .profile-image {
          width: 128px;
          height: 128px;
          margin: 0 auto 2rem;
          background: linear-gradient(to bottom right, #a855f7, #ec4899);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          color: white;
          overflow: hidden;
        }

        .home-title {
          font-size: 3.5rem;
          font-weight: bold;
          color: white;
          margin-bottom: 1rem;
        }

        .gradient-text {
          background: linear-gradient(to right, #c084fc, #f9a8d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .home-subtitle {
          font-size: 1.75rem;
          color: #d8b4fe;
          margin-bottom: 0.5rem;
        }

        .home-year {
          font-size: 1.25rem;
          color: #9ca3af;
          margin-bottom: 2rem;
        }

        .home-tagline {
          font-size: 1.125rem;
          color: #d1d5db;
          max-width: 48rem;
          margin: 0 auto 3rem;
        }

        .button-group {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }

        .btn-primary {
          background: #9333ea;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #7c3aed;
        }

        .btn-secondary {
          background: transparent;
          color: #d8b4fe;
          border: 2px solid #a855f7;
        }

        .btn-secondary:hover {
          background: rgba(168, 85, 247, 0.1);
        }

        .btn-google {
          background: white;
          color: #1f2937;
          border: none;
          font-weight: 500;
        }

        .btn-google:hover {
          background: #f3f4f6;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .social-links a {
          color: #9ca3af;
          transition: color 0.3s;
        }

        .social-links a:hover {
          color: #c084fc;
        }

        /* Section Titles */
        .section-title {
          font-size: 3rem;
          font-weight: bold;
          color: white;
          margin-bottom: 3rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .section-title svg {
          color: #c084fc;
        }

        /* Cards */
        .card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          transition: all 0.3s;
        }

        .card:hover {
          border-color: rgba(168, 85, 247, 0.5);
          transform: scale(1.02);
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
        }

        /* About Section */
        .about-text {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        .skills-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #d8b4fe;
          margin-bottom: 1.5rem;
        }

        .skill-group {
          margin-bottom: 1.5rem;
        }

        .skill-category {
          color: #c084fc;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: rgba(168, 85, 247, 0.2);
          color: #e9d5ff;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        /* Education Section */
        .education-item {
          margin-bottom: 2rem;
        }

        .education-header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .education-degree {
          font-size: 1.5rem;
          font-weight: bold;
          color: #d8b4fe;
          margin-bottom: 0.5rem;
        }

        .education-institution {
          font-size: 1.25rem;
          color: #d1d5db;
        }

        .education-duration {
          color: #c084fc;
          font-weight: 600;
        }

        .education-grade {
          color: #9ca3af;
        }

        .coursework-title {
          color: #c084fc;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .coursework-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .coursework-tag {
          background: rgba(51, 65, 85, 0.5);
          color: #d1d5db;
          padding: 0.5rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
        }

        /* Projects Section */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .project-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          transition: all 0.3s;
        }

        .project-card:hover {
          border-color: rgba(168, 85, 247, 0.5);
          transform: scale(1.05);
        }

        .project-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #d8b4fe;
          margin-bottom: 1rem;
        }

        .project-description {
          color: #d1d5db;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .tech-title {
          color: #c084fc;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .tech-tag {
          background: rgba(168, 85, 247, 0.2);
          color: #e9d5ff;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
        }

        .features-list {
          list-style: disc;
          margin-left: 1.5rem;
          margin-bottom: 1rem;
          color: #d1d5db;
        }

        .features-list li {
          margin-bottom: 0.25rem;
        }

        .project-links {
          display: flex;
          gap: 1rem;
        }

        .project-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #c084fc;
          text-decoration: none;
          transition: color 0.3s;
        }

        .project-link:hover {
          color: #d8b4fe;
        }

        /* Experience Section */
        .experience-item {
          margin-bottom: 1.5rem;
        }

        .experience-header {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .experience-position {
          font-size: 1.25rem;
          font-weight: bold;
          color: #d8b4fe;
        }

        .experience-company {
          font-size: 1.125rem;
          color: #d1d5db;
        }

        .experience-duration {
          color: #c084fc;
          font-weight: 600;
        }

        .experience-description {
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .achievements-list {
          list-style: disc;
          margin-left: 1.5rem;
          color: #d1d5db;
        }

        .achievements-list li {
          margin-bottom: 0.5rem;
        }

        .achievement-item {
          display: flex;
          align-items: start;
          gap: 0.75rem;
          color: #d1d5db;
          margin-bottom: 0.75rem;
        }

        .achievement-star {
          color: #c084fc;
          margin-top: 0.25rem;
        }

        /* Testimonials Section */
        .testimonials-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(30, 41, 59, 0.5);
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #a855f7;
        }

        .user-details h4 {
          color: #d8b4fe;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .user-details p {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .testimonial-form {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          margin-bottom: 3rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #d8b4fe;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 0.5rem;
          color: #e2e8f0;
          font-family: inherit;
          font-size: 1rem;
        }

        .form-group textarea {
          min-height: 120px;
          resize: vertical;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #a855f7;
        }

        .rating-input {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .rating-input input {
          width: 80px;
        }

        .star-display {
          color: #fbbf24;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          transition: all 0.3s;
        }

        .testimonial-card:hover {
          border-color: rgba(168, 85, 247, 0.5);
          transform: translateY(-5px);
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .testimonial-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid #a855f7;
        }

        .testimonial-user-info h4 {
          color: #d8b4fe;
          font-size: 1.125rem;
          margin-bottom: 0.25rem;
        }

        .testimonial-user-info p {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .testimonial-rating {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
          color: #fbbf24;
        }

        .testimonial-message {
          color: #d1d5db;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .testimonial-date {
          color: #6b7280;
          font-size: 0.875rem;
          text-align: right;
        }

        .empty-testimonials {
          text-align: center;
          padding: 3rem;
          color: #9ca3af;
        }

        .empty-testimonials svg {
          margin: 0 auto 1rem;
          color: #6b7280;
        }

        /* Contact Section */
        .contact-content {
          text-align: center;
          max-width: 56rem;
          margin: 0 auto;
        }

        .contact-description {
          font-size: 1.25rem;
          color: #d1d5db;
          margin-bottom: 3rem;
          max-width: 48rem;
          margin-left: auto;
          margin-right: auto;
        }

        .contact-buttons {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .contact-info {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(168, 85, 247, 0.2);
          display: inline-block;
        }

        .contact-label {
          color: #d1d5db;
          margin-bottom: 0.5rem;
        }

        .contact-email {
          color: #c084fc;
          font-size: 1.125rem;
          font-weight: 600;
        }

        /* Footer */
        footer {
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(168, 85, 247, 0.2);
          padding: 2rem 1rem;
          text-align: center;
          color: #9ca3af;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .home-title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .education-header {
            flex-direction: column;
          }

          .projects-grid {
            grid-template-columns: 1fr;
          }

          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .home-title {
            font-size: 2rem;
          }

          .home-subtitle {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="portfolio-container">
        {/* Navigation */}
        <nav>
          <div className="nav-container">
            <div className="logo">{portfolioData.name}</div>
            
            <div className="nav-links">
              {['home', 'about', 'education', 'projects', 'experience', 'testimonials', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={activeSection === section ? 'active' : ''}
                >
                  {section}
                </button>
              ))}
            </div>

            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            {['home', 'about', 'education', 'projects', 'experience', 'testimonials', 'contact'].map((section) => (
              <button key={section} onClick={() => scrollToSection(section)}>
                {section}
              </button>
            ))}
          </div>
        </nav>

        {/* Home Section */}
        <section id="home" className="home-section">
          <div className="section-content">
            <div className="profile-image">
              <img 
                src="/profile.jpeg" 
                alt="Fazley Rahaman Molla" 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <h1 className="home-title">
              Hi, I'm <span className="gradient-text">{portfolioData.name}</span>
            </h1>
            <p className="home-subtitle">{portfolioData.title}</p>
            <p className="home-year">{portfolioData.year} @ {portfolioData.university}</p>
            <p className="home-tagline">{portfolioData.tagline}</p>
            
            <div className="button-group">
              <a href={portfolioData.resumeLink} className="btn btn-primary">
                <Download size={20} />
                Download Resume
              </a>
              <button onClick={() => scrollToSection('contact')} className="btn btn-secondary">
                <Mail size={20} />
                Get in Touch
              </button>
            </div>

            <div className="social-links">
              <a href={portfolioData.github} target="_blank" rel="noopener noreferrer">
                <Github size={28} />
              </a>
              <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin size={28} />
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about">
          <div className="section-content">
            <h2 className="section-title">
              <User size={40} />
              About Me
            </h2>
            <div className="grid-2">
              <div className="card">
                <h3 className="skills-title">Who I Am</h3>
                <p className="about-text">{portfolioData.about}</p>
              </div>
              <div className="card">
                <h3 className="skills-title">Skills</h3>
                {portfolioData.skills.map((skillGroup, index) => (
                  <div key={index} className="skill-group">
                    <h4 className="skill-category">{skillGroup.category}</h4>
                    <div className="skill-tags">
                      {skillGroup.items.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education">
          <div className="section-content">
            <h2 className="section-title">
              <GraduationCap size={40} />
              Education
            </h2>
            {portfolioData.education.map((edu, index) => (
              <div key={index} className="card education-item">
                <div className="education-header">
                  <div>
                    <h3 className="education-degree">{edu.degree}</h3>
                    <p className="education-institution">{edu.institution}</p>
                  </div>
                  <div>
                    <p className="education-duration">{edu.duration}</p>
                    <p className="education-grade">{edu.grade}</p>
                  </div>
                </div>
                <div>
                  <h4 className="coursework-title">Relevant Coursework:</h4>
                  <div className="coursework-tags">
                    {edu.coursework.map((course, i) => (
                      <span key={i} className="coursework-tag">{course}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects">
          <div className="section-content">
            <h2 className="section-title">
              <Code size={40} />
              Projects
            </h2>
            <div className="projects-grid">
              {portfolioData.projects.map((project, index) => (
                <div key={index} className="project-card">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  
                  <div>
                    <h4 className="tech-title">Technologies:</h4>
                    <div className="tech-tags">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="tech-title">Key Features:</h4>
                    <ul className="features-list">
                      {project.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="project-links">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      <Github size={20} />
                      Code
                    </a>
                    {project.demo !== '#' && (
                      <a href={project.demo} target="_blank" rel="noopener noreferrer" className="project-link">
                        <ExternalLink size={20} />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience">
          <div className="section-content">
            <h2 className="section-title">
              <Briefcase size={40} />
              Experience & Achievements
            </h2>
            
            <div style={{ marginBottom: '3rem' }}>
              <h3 className="skills-title">Experience</h3>
              {portfolioData.experience.map((exp, index) => (
                <div key={index} className="card experience-item">
                  <div className="experience-header">
                    <div>
                      <h4 className="experience-position">{exp.position}</h4>
                      <p className="experience-company">{exp.company}</p>
                    </div>
                    <p className="experience-duration">{exp.duration}</p>
                  </div>
                  <p className="experience-description">{exp.description}</p>
                  <ul className="achievements-list">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <h3 className="skills-title">Achievements</h3>
              <div className="card">
                {portfolioData.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <span className="achievement-star">★</span>
                    <span>{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials">
          <div className="section-content">
            <h2 className="section-title">
              <MessageSquare size={40} />
              Testimonials
            </h2>

            <div className="testimonials-header">
              {!user ? (
                <button onClick={handleGoogleSignIn} className="btn btn-google">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google to leave a testimonial
                </button>
              ) : (
                <div>
                  <div className="user-info">
                    <img src={user.photoURL} alt={user.name} className="user-avatar" />
                    <div className="user-details">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <button onClick={handleSignOut} className="btn btn-secondary btn-small" style={{ marginLeft: 'auto' }}>
                      Sign Out
                    </button>
                  </div>
                  {!showTestimonialForm && (
                    <button onClick={() => setShowTestimonialForm(true)} className="btn btn-primary">
                      <MessageSquare size={20} />
                      Write a Testimonial
                    </button>
                  )}
                </div>
              )}
            </div>

            {showTestimonialForm && user && (
              <form onSubmit={handleTestimonialSubmit} className="testimonial-form">
                <h3 className="skills-title">Share Your Experience</h3>
                
                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea
                    value={testimonialForm.message}
                    onChange={(e) => setTestimonialForm({...testimonialForm, message: e.target.value})}
                    placeholder="Share your experience working with me..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rating *</label>
                  <div className="rating-input">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={testimonialForm.rating}
                      onChange={(e) => setTestimonialForm({...testimonialForm, rating: parseInt(e.target.value)})}
                      required
                    />
                    <span className="star-display">
                      {'★'.repeat(testimonialForm.rating)}{'☆'.repeat(5 - testimonialForm.rating)}
                    </span>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Your Role</label>
                    <input
                      type="text"
                      value={testimonialForm.role}
                      onChange={(e) => setTestimonialForm({...testimonialForm, role: e.target.value})}
                      placeholder="e.g., Team Lead, Colleague"
                    />
                  </div>

                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={testimonialForm.company}
                      onChange={(e) => setTestimonialForm({...testimonialForm, company: e.target.value})}
                      placeholder="e.g., Google, Microsoft"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowTestimonialForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Testimonial
                  </button>
                </div>
              </form>
            )}

            {testimonials.length > 0 ? (
              <div className="testimonials-grid">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="testimonial-card">
                    <div className="testimonial-header">
                      <img src={testimonial.userPhoto} alt={testimonial.userName} className="testimonial-avatar" />
                      <div className="testimonial-user-info">
                        <h4>{testimonial.userName}</h4>
                        <p>
                          {testimonial.role && testimonial.company 
                            ? `${testimonial.role} at ${testimonial.company}`
                            : testimonial.role || testimonial.company || 'Reviewer'}
                        </p>
                      </div>
                    </div>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="#fbbf24" />
                      ))}
                    </div>
                    <p className="testimonial-message">"{testimonial.message}"</p>
                    <p className="testimonial-date">
                      {testimonial.createdAt?.toDate ? testimonial.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-testimonials">
                <MessageSquare size={64} />
                <h3 style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>No testimonials yet</h3>
                <p>Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact">
          <div className="contact-content">
            <h2 className="section-title">Get In Touch</h2>
            <p className="contact-description">
              I'm currently looking for internship opportunities and open to collaborating on interesting projects. 
              Feel free to reach out if you'd like to connect!
            </p>
            
            <div className="contact-buttons">
              <a href={`mailto:${portfolioData.email}`} className="btn btn-primary">
                <Mail size={24} />
                Send Email
              </a>
              <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <Linkedin size={24} />
                LinkedIn
              </a>
            </div>

            <div className="contact-info">
              <p className="contact-label">Email</p>
              <p className="contact-email">{portfolioData.email}</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <p>© 2024 {portfolioData.name}. Built with React and CSS.</p>
        </footer>
      </div>
    </>
  );
}