import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { buildFeedbackMailto } from '@/lib/support';

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

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const { toast } = useToast();
  const [userType, setUserType] = useState('');
  const [appSection, setAppSection] = useState('');
  const [issueType, setIssueType] = useState('');
  const [otherDetails, setOtherDetails] = useState('');

  const showOtherField = issueType === 'other' || appSection === 'other' || userType === 'other';
  const isFormValid = userType && appSection && issueType;

  const handleSubmit = () => {
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

    const labelOf = (list: { value: string; label: string }[], value: string) =>
      list.find((item) => item.value === value)?.label ?? value;

    // Opens the device email app with a prefilled draft. Nothing is sent until the user sends it.
    window.location.href = buildFeedbackMailto({
      role: labelOf(USER_TYPES, userType),
      section: labelOf(APP_SECTIONS, appSection),
      kind: labelOf(ISSUE_TYPES, issueType),
      details: otherDetails.trim(),
    });
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

<p className="section-card text-sm text-muted-foreground">Feedback is optional. This opens a draft in your email app and nothing is sent until you send it. WakeState itself makes no network requests. Please do not include personal health information. <a className="text-primary underline" href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy notice</a></p>
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

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full"
          size="lg"
        >
                      <>
              <Send className="w-4 h-4 mr-2" />
              Draft Feedback Email
            </>
        </Button>
      </motion.div>

      {/* Privacy note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-muted-foreground px-4"
      >
        Your journal is never attached. If you send the email, it goes through your own email provider. Please leave out names, medications, and other health details.
      </motion.p>
    </div>
  );
}
