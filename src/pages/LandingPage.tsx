import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Brain, Shield, BarChart3, Clock, CheckCircle } from "lucide-react";

const features = [
  { icon: Brain, title: "CSP-Powered Engine", desc: "True constraint satisfaction — not random filling. Backtracking + MRV + AC-3." },
  { icon: Shield, title: "Zero Conflicts", desc: "Hard constraints guarantee no faculty, room, or batch clashes. Ever." },
  { icon: BarChart3, title: "Optimization Scoring", desc: "Soft constraints with weighted scoring for workload balance and preferences." },
  { icon: Clock, title: "Fast Generation", desc: "Generates valid timetables in seconds with intelligent pruning and heuristics." },
  { icon: CheckCircle, title: "Complete Input System", desc: "Subjects, faculty, rooms, labs, batches, divisions — all configurable." },
  { icon: Zap, title: "Export Ready", desc: "Download timetables as PDF, CSV, or Excel. Division, faculty, and room views." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <nav className="relative z-10 container mx-auto flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">TimeForge AI</span>
          </div>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">Open Dashboard</Button>
          </Link>
        </nav>

        <div className="relative z-10 container mx-auto py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm mb-6">
            <Brain className="h-4 w-4" />
            <span>Powered by Constraint Satisfaction</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
            Intelligent Timetable
            <span className="block text-gradient-primary">Generation System</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            Generate conflict-free, optimized academic schedules using real CSP algorithms.
            Not random. Not heuristic-only. Mathematically valid.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow">
                Get Started
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            A production-grade CSP engine that handles real academic constraints
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-border bg-card p-6 transition hover:shadow-lg hover:border-primary/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to generate your timetable?</h2>
          <p className="text-muted-foreground mb-8">Configure your inputs, set constraints, and let the engine do the rest.</p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow">
              Start Now <Zap className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TimeForge AI. Built with CSP logic, not magic.
        </div>
      </footer>
    </div>
  );
}
