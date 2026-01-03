import { motion } from 'framer-motion';
import { ExternalLink, Info, Heart, BookOpen, Shield, ChevronLeft } from 'lucide-react';

interface AboutScreenProps {
  onBack?: () => void;
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const resources = [
    {
      name: 'American Academy of Sleep Medicine (AASM)',
      url: 'https://aasm.org',
      description: 'Clinical guidelines and sleep education',
    },
    {
      name: 'Wake Up Narcolepsy',
      url: 'https://wakeupnarcolepsy.org',
      description: 'Advocacy and community support',
    },
    {
      name: 'Know Narcolepsy',
      url: 'https://knownarcolepsy.com',
      description: 'Educational resources and tools',
    },
    {
      name: 'Narcolepsy Network',
      url: 'https://narcolepsynetwork.org',
      description: 'Patient support network',
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {onBack && (
        <motion.button
          onClick={onBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-1"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>
      )}

      {/* What WakeState Is */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-card border-primary/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">What WakeState Is</h2>
        </div>
        
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            WakeState is a <strong className="text-foreground">personal tracking and pattern-recognition tool</strong> designed specifically for people living with narcolepsy.
          </p>
          <p>
            It helps you log your daily experiences — from sleepiness and cognitive fog to cataplexy events and naps — so you can spot patterns over time.
          </p>
          <p className="text-xs border-l-2 border-primary/50 pl-3 italic">
            WakeState is not a diagnostic tool and does not provide medical advice. Always consult with your healthcare team about your symptoms.
          </p>
        </div>
      </motion.section>

      {/* How to Use It */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-domain-cognitive/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-domain-cognitive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">How to Use It</h2>
        </div>
        
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">1</span>
            <span>
              <strong className="text-foreground">Log wake states</strong> a few times per day — morning, midday, and evening work well
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">2</span>
            <span>
              <strong className="text-foreground">Log events</strong> (cataplexy, naps) when they happen to capture the details
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">3</span>
            <span>
              <strong className="text-foreground">Review patterns</strong> in the Dashboard and Trends to understand your rhythms
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">4</span>
            <span>
              <strong className="text-foreground">Export your data</strong> to share with your care team or keep for your records
            </span>
          </li>
        </ul>
      </motion.section>

      {/* Resources */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="section-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-domain-mood/20 flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-domain-mood" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Definitions & Resources</h2>
        </div>
        
        <div className="space-y-3">
          {resources.map((resource) => (
            <a
              key={resource.name}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-surface-3 hover:bg-surface-3/80 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {resource.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 italic">
          WakeState has no affiliation with any organization listed.
        </p>
      </motion.section>

      {/* Privacy */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="section-card"
      >
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          All your data is stored locally on this device. Nothing is sent to any server. 
          Your tracking data never leaves your phone unless you export it.
        </p>
      </motion.section>

      {/* About the Creator */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="section-card border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-domain-emotional/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-domain-emotional" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">About the Creator</h2>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          I built WakeState because it could help me better understand my own narcolepsy and help others in the communities I'm part of. If it helps you notice patterns or explain your experience more clearly, that's the goal.
        </p>
      </motion.section>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground"
      >
        WakeState v1.0 • Not a medical device
      </motion.p>
    </div>
  );
}
