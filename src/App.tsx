/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Briefcase,
  Clock,
  MapPin,
  Code,
  Settings,
  LineChart,
  Palette,
  ChevronDown,
  User,
  LogOut,
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Mail,
  SlidersHorizontal
} from 'lucide-react';

import { INITIAL_JOBS } from './data';
import { Job, FilterState } from './types';

// Modals
import LoginModal from './components/LoginModal';
import ApplicationModal from './components/ApplicationModal';
import InfoModals from './components/InfoModals';

export default function App() {
  // Authentication coordinates
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Search input coordinates
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>('');

  // Sorting method
  const [sortBy, setSortBy] = useState<'Newest' | 'Highest Compensation' | 'Alphabetical'>('Newest');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    jobTypes: {
      Internship: false,
      'Part-Time': false,
      'Full-Time': false,
      Remote: false
    },
    industries: {
      'Computer Science': false,
      Engineering: false,
      Business: false,
      Design: false
    }
  });

  // Track applied jobs locally so button swaps to "✓ Applied" state
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // Modal display states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [activeApplicationJob, setActiveApplicationJob] = useState<Job | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<'about' | 'contact'>('about');

  // Interactive filtering & sorting logical computation
  const filteredJobs = useMemo(() => {
    // 1. Initial full set
    let result = [...INITIAL_JOBS];

    // 2. Filter by search query (job title / company name)
    const normalizedQuery = appliedSearchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(normalizedQuery) ||
          job.company.toLowerCase().includes(normalizedQuery)
      );
    }

    // 3. Filter by Job Type
    const checkedTypes = Object.entries(filters.jobTypes)
      .filter(([_, checked]) => checked)
      .map(([type]) => type);

    if (checkedTypes.length > 0) {
      result = result.filter((job) => checkedTypes.includes(job.jobType));
    }

    // 4. Filter by Industry
    const checkedIndustries = Object.entries(filters.industries)
      .filter(([_, checked]) => checked)
      .map(([industry]) => industry);

    if (checkedIndustries.length > 0) {
      result = result.filter((job) => checkedIndustries.includes(job.industry));
    }

    // 5. Apply sorting
    if (sortBy === 'Highest Compensation') {
      result.sort((a, b) => {
        const valA = parseInt(a.compensation.replace(/[^0-9]/g, ''), 10) || 0;
        const valB = parseInt(b.compensation.replace(/[^0-9]/g, ''), 10) || 0;
        return valB - valA; // Descending order
      });
    } else if (sortBy === 'Alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // "Newest" keeps initial IDs as sorting anchor
      result.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
    }

    return result;
  }, [appliedSearchQuery, filters, sortBy]);

  // Total opportunities text helper
  const opportunitiesHeading = useMemo(() => {
    const count = filteredJobs.length;
    return `${count} ${count === 1 ? 'Opportunity' : 'Opportunities'} Found`;
  }, [filteredJobs]);

  // Click actions
  const handleToggleJobType = (key: keyof FilterState['jobTypes']) => {
    setFilters((prev) => ({
      ...prev,
      jobTypes: {
        ...prev.jobTypes,
        [key]: !prev.jobTypes[key]
      }
    }));
  };

  const handleToggleIndustry = (key: keyof FilterState['industries']) => {
    setFilters((prev) => ({
      ...prev,
      industries: {
        ...prev.industries,
        [key]: !prev.industries[key]
      }
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      jobTypes: {
        Internship: false,
        'Part-Time': false,
        'Full-Time': false,
        Remote: false
      },
      industries: {
        'Computer Science': false,
        Engineering: false,
        Business: false,
        Design: false
      }
    });
    setSearchQuery('');
    setAppliedSearchQuery('');
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedSearchQuery(searchQuery);
  };

  const handleLoginSuccess = (email: string, name: string) => {
    setCurrentUserEmail(email);
    setCurrentUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUserEmail('');
    setCurrentUserName('');
    setIsLoggedIn(false);
  };

  const handleJobApplied = (jobId: string) => {
    setAppliedJobIds((prev) => {
      const updated = new Set(prev);
      updated.add(jobId);
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans selection:bg-[#016a61]/10 selection:text-[#016a61]">
      
      {/* 1. Header (Sticky navigation bar conforming to specs) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_4px_24px_rgba(0,35,111,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* Logo with bold typography */}
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2 select-none">
              <span className="text-[#001142] font-extrabold text-2xl tracking-tight">
                Job<span className="text-[#016a61]">Portal</span>
              </span>
            </a>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-8 text-[#001142] font-semibold text-sm">
              <div className="relative py-2 px-1 cursor-pointer">
                <span>Browse Jobs</span>
                {/* Underline line active indicator from screenshot */}
                <div className="absolute h-[3px] bg-[#001142] bottom-0 left-0 right-0 rounded-full" />
              </div>
              <button
                id="nav-about-us"
                onClick={() => {
                  setInfoModalType('about');
                  setIsInfoModalOpen(true);
                }}
                className="hover:text-[#016a61] transition-colors py-2"
              >
                About Us
              </button>
              <button
                id="nav-contact"
                onClick={() => {
                  setInfoModalType('contact');
                  setIsInfoModalOpen(true);
                }}
                className="hover:text-[#016a61] transition-colors py-2"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* User actions block */}
          <div className="flex items-center gap-4 text-sm font-semibold text-[#001142]">
            {!isLoggedIn ? (
              <>
                <button
                  id="header-login-btn"
                  onClick={() => {
                    setLoginModalMode('login');
                    setIsLoginModalOpen(true);
                  }}
                  className="hover:text-[#016a61] px-4 py-2 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Login
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => {
                    setLoginModalMode('register');
                    setIsLoginModalOpen(true);
                  }}
                  className="bg-[#016a61] text-white hover:bg-[#005049] px-5 py-2.5 rounded-lg active:scale-95 transition-all outline-none font-semibold hover:shadow-md hover:shadow-[#016a61]/10"
                >
                  Register
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-[#eff4ff]/60 border border-[#d3e4fe]/50 px-4 py-2 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-[#001142] flex items-center justify-center text-white text-xs font-bold uppercase">
                  {currentUserName.substring(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-semibold text-[#001142] max-w-[120px] truncate">
                    {currentUserName}
                  </span>
                  <span className="block text-[9px] text-[#425aa6] tracking-wider uppercase font-bold">
                    Student Verified
                  </span>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="p-1 px-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-[#e5eeff]/40 via-[#e5eeff]/10 to-brand-bg relative pt-20 pb-16 overflow-hidden">
        {/* Subtle decorative elements matching high craftsmanship */}
        <div className="absolute right-[-10%] top-[-10%] w-[400px] h-[400px] rounded-full bg-[#016a61]/5 blur-3xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-5%] w-[300px] h-[300px] rounded-full bg-[#425aa6]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          
          {/* Main Title heading matching headline-xl */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-[52px] font-extrabold tracking-tight text-[#001142] leading-[1.12]">
              Find Your Next <span className="text-[#016a61] relative">Internship</span> or <br className="hidden md:block"/>
              Graduate Role
            </h1>
            <p className="text-[#444651] max-w-2xl mx-auto font-normal text-base md:text-lg leading-relaxed pt-2">
              Bridging the gap between academic ambition and professional reality.
              Discover curated opportunities from top tech startups and established corporate leaders.
            </p>
          </div>

          {/* Large composite search input bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,35,111,0.06)] flex items-center"
          >
            <div className="flex-1 flex items-center pl-4 pr-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                id="search-input-field"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title or company..."
                className="w-full text-sm outline-none text-[#001142] placeholder:text-slate-400 font-medium py-2.5"
              />
            </div>
            <button
              id="search-action-btn"
              type="submit"
              className="bg-[#001142] hover:bg-[#0b1c30] text-white font-semibold text-sm px-6 py-3.5 rounded-xl cursor-pointer hover:shadow-lg transition-all shrink-0 active:scale-95"
            >
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* 3. Main Dashboard section (Grid format inside centered 1280px wrapper) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Two column Grid wrapper */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* A. Left filter column (280px fixed-width desktop) */}
          <aside className="w-full lg:w-[280px] shrink-0 bg-white rounded-xl border border-slate-100 p-6 shadow-[0_4px_16px_rgba(0,35,111,0.02)] space-y-6">
            
            {/* Header info */}
            <div>
              <h2 className="text-lg font-bold text-[#001142]">Filters</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Refine your search</p>
            </div>

            {/* I. JOB TYPE SECTION */}
            <div className="pt-5 border-t border-slate-100">
              <h3 className="text-xs font-bold text-[#001142] tracking-wider uppercase mb-4">
                Job Type
              </h3>
              
              <div className="space-y-3">
                {/* Internship option */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-internship-chk"
                      type="checkbox"
                      checked={filters.jobTypes.Internship}
                      onChange={() => handleToggleJobType('Internship')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61] focus:ring-0 focus:outline-none focus:border-[#016a61]"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Internship</span>
                    </div>
                  </div>
                </label>

                {/* Part-Time option */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-parttime-chk"
                      type="checkbox"
                      checked={filters.jobTypes['Part-Time']}
                      onChange={() => handleToggleJobType('Part-Time')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61] focus:ring-0 focus:outline-none focus:border-[#016a61]"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <Clock className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Part-Time</span>
                    </div>
                  </div>
                </label>

                {/* Full-Time option */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-fulltime-chk"
                      type="checkbox"
                      checked={filters.jobTypes['Full-Time']}
                      onChange={() => handleToggleJobType('Full-Time')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61] focus:ring-0 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Full-Time</span>
                    </div>
                  </div>
                </label>

                {/* Remote option */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-remote-chk"
                      type="checkbox"
                      checked={filters.jobTypes.Remote}
                      onChange={() => handleToggleJobType('Remote')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61] focus:ring-0 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Remote</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* II. MAJOR / INDUSTRY SECTION */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-[#001142] tracking-wider uppercase mb-4">
                Major / Industry
              </h3>

              <div className="space-y-3">
                {/* Computer Science */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-cs-chk"
                      type="checkbox"
                      checked={filters.industries['Computer Science']}
                      onChange={() => handleToggleIndustry('Computer Science')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61]"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <Code className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Computer Science</span>
                    </div>
                  </div>
                </label>

                {/* Engineering */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-engineering-chk"
                      type="checkbox"
                      checked={filters.industries.Engineering}
                      onChange={() => handleToggleIndustry('Engineering')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61]"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Engineering</span>
                    </div>
                  </div>
                </label>

                {/* Business */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-business-chk"
                      type="checkbox"
                      checked={filters.industries.Business}
                      onChange={() => handleToggleIndustry('Business')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61]"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <SlidersHorizontal className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Business</span>
                    </div>
                  </div>
                </label>

                {/* Design */}
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      id="filter-design-chk"
                      type="checkbox"
                      checked={filters.industries.Design}
                      onChange={() => handleToggleIndustry('Design')}
                      className="peer h-5 w-5 shrink-0 rounded border border-slate-300 pointer-events-none accent-[#016a61]"
                    />
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-[#001142] transition-colors">
                      <Palette className="w-4 h-4 text-slate-400 group-hover:text-[#016a61]" />
                      <span className="text-sm font-medium">Design</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Clear All action button */}
            <div className="pt-6 border-t border-slate-100 flex justify-center">
              <button
                id="clear-filters-btn"
                onClick={handleClearFilters}
                className="text-sm font-semibold text-red-600 hover:text-red-500 cursor-pointer p-2 flex items-center gap-1.5 hover:bg-red-50 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
                <span>Clear All Filters</span>
              </button>
            </div>
          </aside>

          {/* B. Main matching Jobs listing column */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Header controls strip */}
            <div className="flex items-center justify-between">
              
              <h3 className="font-bold text-xl text-[#001142]">
                {opportunitiesHeading}
              </h3>

              {/* Custom Sort Select dropdown */}
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>Sort by:</span>
                  <button
                    id="sort-trigger"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-1.5 text-[#001142] font-bold hover:text-[#016a61] focus:outline-none pb-0.5 cursor-pointer selection:bg-transparent"
                  >
                    <span>{sortBy}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      {/* Close click buffer */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100/80 p-1.5 z-50 text-left"
                      >
                        <button
                          id="sort-newest"
                          onClick={() => {
                            setSortBy('Newest');
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left text-xs font-semibold px-4 py-3.5 rounded-lg transition-colors ${
                            sortBy === 'Newest'
                              ? 'bg-[#eff4ff] text-[#001142]'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Newest
                        </button>
                        <button
                          id="sort-compensation"
                          onClick={() => {
                            setSortBy('Highest Compensation');
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left text-xs font-semibold px-4 py-3.5 rounded-lg transition-colors ${
                            sortBy === 'Highest Compensation'
                              ? 'bg-[#eff4ff] text-[#001142]'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Highest Compensation
                        </button>
                        <button
                          id="sort-alphabetical"
                          onClick={() => {
                            setSortBy('Alphabetical');
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left text-xs font-semibold px-4 py-3.5 rounded-lg transition-colors ${
                            sortBy === 'Alphabetical'
                              ? 'bg-[#eff4ff] text-[#001142]'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Alphabetical
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Vertical list of opportunity cards */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    const isAlreadyApplied = appliedJobIds.has(job.id);
                    
                    return (
                      <motion.div
                        layout
                        key={job.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden border-l-4 border-l-transparent hover:border-l-[#016a61]"
                      >
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                          
                          {/* Left contents info block */}
                          <div className="space-y-3.5 text-left">
                            
                            {/* Badging row */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <span className="bg-[#eafaf7] text-[#016a61] px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide">
                                {job.jobType}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 text-[11px]">{job.industry}</span>
                            </div>

                            {/* Job Title and Company */}
                            <div className="space-y-1">
                              <h4 className="text-xl font-bold text-[#001142] leading-tight select-all">
                                {job.title}
                              </h4>
                              <p className="text-sm font-semibold text-[#016a61]">
                                {job.company}
                              </p>
                            </div>

                            {/* Applied Tech skill tags */}
                            <div className="flex flex-wrap gap-2 pt-1.5">
                              {job.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[11px] bg-[#eff4ff] text-[#425aa6] px-3 py-1 rounded-full font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Right action control and compensation details */}
                          <div className="flex md:flex-col justify-between items-end md:text-right shrink-0 min-w-[140px] md:space-y-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div>
                              <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400">
                                Compensation
                              </div>
                              <div className="text-lg font-extrabold text-[#001142] mt-0.5">
                                {job.compensation}
                              </div>
                            </div>

                            <button
                              id={`apply-btn-job-${job.id}`}
                              disabled={isAlreadyApplied}
                              onClick={() => {
                                // If user is not logged in, force login modal first for a beautiful flow!
                                if (!isLoggedIn) {
                                  setLoginModalMode('login');
                                  setIsLoginModalOpen(true);
                                } else {
                                  setActiveApplicationJob(job);
                                }
                              }}
                              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all focus:outline-none hover:scale-[1.02] cursor-pointer ${
                                isAlreadyApplied
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:scale-100 select-none'
                                  : 'bg-[#016a61] hover:bg-[#005049] text-white'
                              }`}
                            >
                              {isAlreadyApplied ? '✓ Applied' : 'Apply Now'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  /* Empty state display */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-slate-100 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <SlidersHorizontal className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 text-center">
                      <h4 className="font-bold text-lg text-[#001142]">No Opportunities Found</h4>
                      <p className="text-slate-500 text-sm max-w-sm">
                        No positions match your selected filter criteria. Try expanding your search queries.
                      </p>
                    </div>
                    <button
                      id="reset-empty-filters"
                      onClick={handleClearFilters}
                      className="px-5 py-2.5 bg-[#001142] text-white text-xs font-semibold rounded-lg hover:bg-[#0b1c30] hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* 4.  section (Midnight theme matching design description) */}
      <footer className="bg-[#1a2536] text-[#e0e3e5] mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Column 1 info */}
            <div className="md:col-span-2 space-y-5 text-left">
              <span className="text-white font-extrabold text-2xl tracking-tight block">
                Campus<span className="text-[#9defe3]">Jobs</span>
              </span>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Empowering the next generation of talent by connecting ambitious students with industry-leading mentors and career-defining roles.
              </p>
            </div>

            {/* Column 2 platform links */}
            {/* <div className="text-left space-y-4">
              <h4 className="text-xs font-bold text-[#9defe3] tracking-widest uppercase">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <button
                    onClick={handleClearFilters}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Browse Jobs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setInfoModalType('contact');
                      setIsInfoModalOpen(true);
                    }}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Post a Job
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setInfoModalType('about');
                      setIsInfoModalOpen(true);
                    }}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Student Resources
                  </button>
                </li>
              </ul>
            </div> */}

            {/* Column 3 connection */}
            <div className="text-left space-y-4">
              <h4 className="text-xs font-bold text-[#9defe3] tracking-widest uppercase">
                Connect
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-300">
                <li>
                  <a href="https://twitter.com" target="#" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="#" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" target="#" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal status row */}
          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium select-none">
            <p>© 2026 JobPortal Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Connected Dialog Overlays */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialMode={loginModalMode}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ApplicationModal
        isOpen={activeApplicationJob !== null}
        job={activeApplicationJob}
        userEmail={currentUserEmail}
        userName={currentUserName}
        onClose={() => setActiveApplicationJob(null)}
        onApplySuccess={handleJobApplied}
      />

      <InfoModals
        isOpen={isInfoModalOpen}
        type={infoModalType}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
