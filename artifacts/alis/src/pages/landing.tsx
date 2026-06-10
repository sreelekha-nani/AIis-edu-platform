import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BrainCircuit, BookOpen, Target, PlaySquare, ArrowRight, ShieldCheck, LineChart, MessageSquare, Compass, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      setLocation(`/${user.role}`);
    } else {
      setLocation("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border bg-card/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight font-outfit text-primary">
            <BrainCircuit className="w-8 h-8" />
            ALIS
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={handleCTA}>Go to Dashboard</Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
                <Button onClick={() => setLocation("/register")}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-50" />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold font-outfit tracking-tight text-foreground mb-6"
            >
              Learn Smarter. <span className="text-primary">Learn Better.</span><br />
              Learn with ALIS.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              The AI-powered adaptive learning intelligence system that personalizes education for every student, empowers teachers, and informs parents.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4"
            >
              <Button size="lg" className="text-lg px-8 h-14" onClick={handleCTA}>
                {user ? "Enter Portal" : "Start Learning Now"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">A Complete Educational Ecosystem</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to succeed, built into one intelligent platform.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI Student Analysis", icon: BrainCircuit, desc: "Machine learning algorithms that understand how you learn best." },
                { title: "Personalized Learning", icon: Target, desc: "Customized paths adapted to your speed and comprehension." },
                { title: "Smart Recommendations", icon: Compass, desc: "Next-best-action suggestions to improve weak areas." },
                { title: "Interactive Video", icon: PlaySquare, desc: "Embedded rich media lessons with integrated notes." },
                { title: "Live Classes", icon: Users, desc: "Real-time virtual classrooms with your teachers." },
                { title: "Online Assessments", icon: ShieldCheck, desc: "Dynamic testing with instant grading and explanations." },
                { title: "Discussion Forums", icon: MessageSquare, desc: "Collaborate with peers and ask questions by subject." },
                { title: "Parent Monitoring", icon: Target, desc: "Real-time visibility into your child's progress and areas of need." },
                { title: "Teacher Analytics", icon: LineChart, desc: "Powerful insights into class performance and engagement." }
              ].map((feature, i) => (
                <div key={i} className="bg-background p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      
      <footer className="bg-sidebar py-12 px-6 text-sidebar-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl font-outfit mb-4 md:mb-0">
            <BrainCircuit className="w-6 h-6 text-primary" />
            ALIS
          </div>
          <div className="text-sm text-sidebar-accent-foreground">
            © {new Date().getFullYear()} Adaptive Learning Intelligence System.
          </div>
        </div>
      </footer>
    </div>
  );
}
