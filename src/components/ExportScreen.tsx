import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  FileText, 
  Download, 
  Upload, 
  Star, 
  Stethoscope, 
  Heart,
  Database,
  Table,
  ChevronDown,
  Calendar,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  getCheckIns,
  getEvents,
  exportAllData,
  importData,
  exportToCSV,
} from '@/lib/storage';
import {
  type DateRangeOption,
  type ReportOptions,
  getDateRange,
  filterDataByDateRange,
  generateQuickSummary,
  generateDetailedReport,
  generatePersonalReport,
  downloadReport,
} from '@/lib/reports';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExportScreenProps {
  onBack: () => void;
}

const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
];

export function ExportScreen({ onBack }: ExportScreenProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [checkInCount, setCheckInCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Report options
  const [dateRange, setDateRange] = useState<DateRangeOption>('30days');
  const [includeMedications, setIncludeMedications] = useState(false);
  const [includeProviderQuestions, setIncludeProviderQuestions] = useState(true);
  const [clinicianMode, setClinicianMode] = useState(false);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    const checkIns = await getCheckIns();
    const events = await getEvents();
    const { start, end } = getDateRange(dateRange);
    const filtered = filterDataByDateRange(checkIns, events, start, end);
    setCheckInCount(filtered.checkIns.length);
    setEventCount(filtered.events.length);
  };

  useEffect(() => {
    loadCounts();
  }, [dateRange]);

  const getReportOptions = (): ReportOptions => ({
    dateRange,
    includeMedications,
    includeProviderQuestions,
    clinicianMode,
  });

  const handleGenerateReport = async (type: 'quick' | 'detailed' | 'personal') => {
    setIsGenerating(true);
    
    try {
      const checkIns = await getCheckIns();
      const events = await getEvents();
      const { start, end } = getDateRange(dateRange);
      const data = filterDataByDateRange(checkIns, events, start, end);
      const options = getReportOptions();

      let report: string;
      let filename: string;

      switch (type) {
        case 'quick':
          report = generateQuickSummary(data, options);
          filename = `wakestate-summary-${format(new Date(), 'yyyy-MM-dd')}.txt`;
          break;
        case 'detailed':
          report = generateDetailedReport(data, options);
          filename = `wakestate-detailed-${format(new Date(), 'yyyy-MM-dd')}.txt`;
          break;
        case 'personal':
          report = generatePersonalReport(data, options);
          filename = `wakestate-personal-${format(new Date(), 'yyyy-MM-dd')}.txt`;
          break;
      }

      downloadReport(report, filename);

      toast({
        title: 'Report generated',
        description: 'Your report has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Error generating report',
        description: 'Please try again',
        variant: 'destructive',
      });
    }

    setIsGenerating(false);
  };

  const handleExportJSON = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wakestate-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export complete',
      description: 'Your data has been downloaded',
    });
  };

  const handleExportCSV = async () => {
    const checkIns = await getCheckIns();
    const csv = exportToCSV(checkIns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wakestate-checkins-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'CSV Export complete',
      description: 'Check-ins exported to CSV',
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importData(text);
      
      toast({
        title: 'Import complete',
        description: `Imported ${result.checkIns} check-ins and ${result.events} events`,
      });
      
      setShowImportDialog(false);
      loadCounts();
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Please check the file format',
        variant: 'destructive',
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-foreground">Export & Reports</h2>
        <p className="text-muted-foreground text-sm">
          Generate readable reports or export your raw data.
        </p>
      </motion.div>

      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="section-card space-y-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <Label className="font-medium">Date Range</Label>
        </div>
        
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeOption)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground">
          Based on <span className="text-foreground font-medium">{checkInCount} check-ins</span> and{' '}
          <span className="text-foreground font-medium">{eventCount} events</span>
        </p>
      </motion.div>

      {/* ============= REPORTS SECTION ============= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div>
          <h3 className="text-lg font-semibold text-foreground">Reports</h3>
          <p className="text-sm text-muted-foreground">
            Clear summaries you can read, share, or bring to appointments.
          </p>
        </div>

        {/* Quick Summary Card */}
        <motion.div 
          className="section-card border-primary/30 space-y-3"
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">Quick Summary</h4>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  A clear, readable overview of naps, cataplexy, and wake-state patterns.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>Clinician appointments • Workplace accommodations • Personal reflection</span>
          </div>

          <Button 
            onClick={() => handleGenerateReport('quick')}
            disabled={isGenerating || checkInCount === 0}
            className="w-full"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Summary
          </Button>
        </motion.div>

        {/* Detailed Report Card */}
        <motion.div 
          className="section-card space-y-3"
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Detailed Patterns</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Structured tables and distributions for deeper clinical review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>Sleep specialists • Neurologists • Long-term treatment discussions</span>
          </div>

          <Button 
            variant="outline"
            onClick={() => handleGenerateReport('detailed')}
            disabled={isGenerating || checkInCount === 0}
            className="w-full"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Detailed Report
          </Button>
        </motion.div>

        {/* Personal Insight Card */}
        <motion.div 
          className="section-card space-y-3"
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Personal Insight Report</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                A narrative-style summary focused on trends and personal reflection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>Personal journaling • Understanding changes • Preparing questions</span>
          </div>

          <Button 
            variant="outline"
            onClick={() => handleGenerateReport('personal')}
            disabled={isGenerating || checkInCount === 0}
            className="w-full"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Personal Report
          </Button>
        </motion.div>

        {/* Report Options */}
        <div className="section-card space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Report Options</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Include provider questions</Label>
              <p className="text-xs text-muted-foreground">
                Add suggested discussion points
              </p>
            </div>
            <Switch
              checked={includeProviderQuestions}
              onCheckedChange={setIncludeProviderQuestions}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Clinician-friendly language</Label>
              <p className="text-xs text-muted-foreground">
                Use tighter, more clinical phrasing
              </p>
            </div>
            <Switch
              checked={clinicianMode}
              onCheckedChange={setClinicianMode}
            />
          </div>
        </div>
      </motion.section>

      {/* ============= RAW DATA SECTION ============= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 pt-4"
      >
        <div className="opacity-70">
          <h3 className="text-base font-medium text-muted-foreground">Raw Data (Advanced)</h3>
          <p className="text-xs text-muted-foreground">
            For personal analysis or research use. Not designed for direct review.
          </p>
        </div>

        {/* JSON Export */}
        <div className="section-card border-border/30 bg-surface-2/50 space-y-2">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">Export All Data (JSON)</h4>
              <p className="text-xs text-muted-foreground">
                Complete WakeState data in structured format. For backup or research.
              </p>
            </div>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleExportJSON}
            className="w-full text-muted-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>

        {/* CSV Export */}
        <div className="section-card border-border/30 bg-surface-2/50 space-y-2">
          <div className="flex items-start gap-3">
            <Table className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">Export Check-Ins (CSV)</h4>
              <p className="text-xs text-muted-foreground">
                Spreadsheet-friendly version for personal analysis.
              </p>
            </div>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleExportCSV}
            className="w-full text-muted-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Import */}
        <div className="section-card border-border/30 bg-surface-2/50 space-y-2">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">Import Data</h4>
              <p className="text-xs text-muted-foreground">
                Restore or migrate WakeState data from a JSON backup.
              </p>
            </div>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setShowImportDialog(true)}
            className="w-full text-muted-foreground"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import File
          </Button>
        </div>
      </motion.section>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import data</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge imported data with your existing data. 
              Select a WakeState JSON export file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => fileInputRef.current?.click()}>
              Select File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
