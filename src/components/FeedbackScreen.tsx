import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HumanChallenge } from './HumanChallenge';

interface FeedbackScreenProps {
  onBack: () => void;
}

const USER_TYPES = [
  { value: 'patient_diagnosed', label: 'Patient with narcolepsy (diagnosed)' },
  { value: 'patient_investigating', label: 'Patient investigating condition' },
  { value: 'provider', label: 'Healthcare provider' },
  { value: 'company', label: 'Company / Organization' },
  { value: 'other', label: 'Other' },
];

const APP_SECTIONS = [
  { value: 'home', label: 'Home screen' },
  { value: 'log_wake_state', label: 'Log Wake State' },
  { value: 'log_event', label: 'Log Event (Nap/Cataplexy)' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'medications', label: 'Medications' },
  { value: 'export', label: 'Export & Reports' },
  { value: 'settings', label: 'Settings' },
  { value: 'general', label: 'General / Overall' },
  { value: 'other', label: 'Other' },
];

const ISSUE_TYPES = [
  { value: 'bug', label: 'Bug / Something broken' },
  { value: 'confusing', label: 'Confusing / Hard to use' },
  { value: 'missing_feature', label: 'Missing feature' },
  { value: 'suggestion', label: 'Suggestion / Idea' },
  { value: 'praise', label: 'Praise / What I love' },
  { value: 'other', label: 'Other' },
];

interface ChallengeData {
  type: string;
  answer: number;
  expected: number;
}

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const { toast } = useToast();
  const [userType, setUserType] = useState('');
  const [appSection, setAppSection] = useState('');
  const [issueType, setIssueType] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);

  const showOtherField = issueType === 'other' || appSection === 'other' || userType === 'other';
  const isFormValid = userType && appSection && issueType && challengeData !== null;

  const handleChallengeVerified = (data: ChallengeData) => {
    setChallengeData(data);
  };

  const handleChallengeReset = () => {
    setChallengeData(null);
  };

  const handleSubmit = async () => {
    if (!userType || !appSection || !issueType) {
      toast({
        title: 'Please fill out all fields',
        description: 'All dropdown selections are required.',
        variant: 'destructive',
      });
      return;
    }

    if (showOtherField && !otherDetails.trim()) {
      toast({
        title: 'Please provide details',
        description: 'Since you selected "Other", please describe in the text field.',
        variant: 'destructive',
      });
      return;
    }

    if (!challengeData) {
      toast({
        title: 'Please complete verification',
        description: 'Solve the quick math question to submit.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          user_type: userType,
          app_section: appSection,
          issue_type: issueType,
          other_details: otherDetails.trim() || null,
          challenge_type: challengeData.type,
          challenge_answer: challengeData.answer,
          expected_answer: challengeData.expected,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Feedback submitted!',
        description: 'Thank you for helping improve WakeState.',
      });

      // Reset form
      setUserType('');
      setAppSection('');
      setIssueType('');
      setOtherDetails('');
      setChallengeData(null);
      
      // Go back after short delay
      setTimeout(() => onBack(), 1500);
    } catch (error) {
      console.error('Feedback submission error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Please try again later.';
      
      toast({
        title: 'Submission failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-1"
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Share Your Feedback</h1>
        <p className="text-sm text-muted-foreground px-4">
          Your input helps make WakeState better for everyone in the narcolepsy community.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-5"
      >
        {/* Who are you? */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Who are you?</Label>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="bg-surface-2 border-border">
              <SelectValue placeholder="Select your role..." />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {USER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Which part of the app? */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Which part of the app?</Label>
          <Select value={appSection} onValueChange={setAppSection}>
            <SelectTrigger className="bg-surface-2 border-border">
              <SelectValue placeholder="Select app section..." />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {APP_SECTIONS.map((section) => (
                <SelectItem key={section.value} value={section.value}>
                  {section.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* What kind of feedback? */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">What kind of feedback?</Label>
          <Select value={issueType} onValueChange={setIssueType}>
            <SelectTrigger className="bg-surface-2 border-border">
              <SelectValue placeholder="Select feedback type..." />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border z-50">
              {ISSUE_TYPES.map((issue) => (
                <SelectItem key={issue.value} value={issue.value}>
                  {issue.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Other Details (conditional or always available) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {showOtherField ? 'Please describe *' : 'Additional details (optional)'}
          </Label>
          <Textarea
            value={otherDetails}
            onChange={(e) => setOtherDetails(e.target.value)}
            placeholder={showOtherField ? 'Please describe your feedback...' : 'Any additional context or suggestions...'}
            className="bg-surface-2 border-border min-h-[100px] resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {otherDetails.length}/1000
          </p>
        </div>

        {/* Human Challenge */}
        <HumanChallenge 
          onVerified={handleChallengeVerified}
          onReset={handleChallengeReset}
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </motion.div>

      {/* Privacy note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-muted-foreground px-4"
      >
        Feedback is anonymous. No personal data or tracking info is collected.
      </motion.p>
    </div>
  );
}
