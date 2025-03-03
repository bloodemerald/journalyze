
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart, Check, LineChart, MousePointerClick, Upload } from 'lucide-react';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-10 lg:px-20 max-w-6xl mx-auto w-full">
        <div className="animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <span className="px-4 py-1.5 text-xs font-medium bg-blue-50 text-primary rounded-full">
              AI-Powered Trading Journal
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-tight mb-6 tracking-tight">
            Transform your trading with
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 ml-2">AI insights</span>
          </h1>
          
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            Upload your chart screenshots and let our AI analyze patterns, identify support/resistance levels, and provide actionable insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/dashboard" 
              className="bg-primary text-white font-medium px-8 py-3 rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight size={16} className="ml-2 inline-block" />
            </Link>
            
            <Link
              to="/dashboard/new"
              className="bg-secondary text-foreground font-medium px-8 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl font-bold mb-4">Effortless Trading Journal</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop manually analyzing charts. Our AI does the heavy lifting for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Upload size={24} />}
              title="Simple Screenshot Upload"
              description="Upload chart screenshots directly from your trading platform"
              delay="0"
            />
            
            <FeatureCard 
              icon={<BarChart size={24} />}
              title="AI Chart Analysis"
              description="Get instant insights on patterns, indicators, and recommended actions"
              delay="100"
            />
            
            <FeatureCard 
              icon={<LineChart size={24} />}
              title="Track Performance"
              description="Visualize your trading history and measure your improvement over time"
              delay="200"
            />
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our streamlined process makes journaling your trades effortless
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-x-6 gap-y-12">
          <Step 
            number={1} 
            title="Upload Chart"
            description="Screenshot your trading chart and upload it to Journalyze"
            icon={<Upload size={20} />}
          />
          
          <Step 
            number={2} 
            title="AI Analysis"
            description="Our AI scans your chart for patterns, levels, and indicators"
            icon={<BarChart size={20} />}
          />
          
          <Step 
            number={3} 
            title="Complete Journal"
            description="Add your entry/exit points and personal notes"
            icon={<MousePointerClick size={20} />}
          />
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-blue-400/10">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to improve your trading?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Start journaling your trades with AI assistance today and discover insights you might have missed.
          </p>
          
          <Link 
            to="/dashboard" 
            className="bg-primary text-white font-medium px-8 py-3 rounded-lg shadow-sm hover:bg-primary/90 transition-colors inline-flex items-center"
          >
            Get Started
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} Journalyze. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ icon, title, description, delay }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div 
      className="glass-card p-6 flex flex-col items-center text-center animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function Step({ number, title, description, icon }: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      <div className="mr-4 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
          {number}
        </div>
      </div>
      
      <div>
        <div className="flex items-center mb-2">
          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-2">
            {icon}
          </span>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

export default Index;
