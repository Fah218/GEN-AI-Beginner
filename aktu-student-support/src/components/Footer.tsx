import Link from "next/link";
import { 
  GraduationCap, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  BookOpen, 
  Sparkles,
  FileText
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand and Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-lg text-white font-mono">
                  AKTU<span className="text-sky-400 font-sans">.AI</span>
                </span>
                <p className="text-xs text-slate-400">Dr. A.P.J. Abdul Kalam Technical University</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Empowering 800+ affiliated colleges and over 400,000 engineering students across Uttar Pradesh with instant, accurate answers on syllabi, ordinances, grading policies, and examination schedules.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-sky-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ERP & Knowledge Base updated for Session 2024–25</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Student Portals
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/chat" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  AI Chatbot Assistant
                </Link>
              </li>
              <li>
                <Link href="/resources?category=syllabus" className="hover:text-sky-400 transition-colors">
                  B.Tech Syllabus & Scheme
                </Link>
              </li>
              <li>
                <Link href="/resources?category=regulations" className="hover:text-sky-400 transition-colors">
                  Grace Marks & Ordinances
                </Link>
              </li>
              <li>
                <Link href="/resources?category=results" className="hover:text-sky-400 transition-colors">
                  Carry-over (COP) Rules
                </Link>
              </li>
              <li>
                <Link href="/resources?category=calendar" className="hover:text-sky-400 transition-colors">
                  Exam Schedules & Circulars
                </Link>
              </li>
            </ul>
          </div>

          {/* University Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Official Portals
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a 
                  href="https://aktu.ac.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  AKTU Main Website <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://erp.aktu.ac.in" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  AKTU ERP Login <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://erp.aktu.ac.in/WebPages/OneView/OneView.aspx" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  One View Student Result <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link href="/resources" className="hover:text-sky-400 transition-colors">
                  Download Question Banks
                </Link>
              </li>
            </ul>
          </div>

          {/* University Helpdesk info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Nodal Contact
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Sec-11, Jankipuram Vistar, Lucknow, Uttar Pradesh - 226031</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>0522-2336305 (AKTU Helpdesk)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>support@aktu.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider and disclaimer */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 AKTU Student Support AI. Built for Dr. A.P.J. Abdul Kalam Technical University students.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Academic Regulations
            </span>
            <span className="text-slate-500">|</span>
            <Link href="/resources" className="hover:text-slate-300">Curriculum Repository</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
