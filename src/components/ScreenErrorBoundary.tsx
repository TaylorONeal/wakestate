import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/** Keep navigation available if a view or a downloaded screen fails to load. */
export class ScreenErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return <section role="alert" className="section-card space-y-3">
        <h2 className="font-semibold">This view couldn’t open</h2>
        <p className="text-sm text-muted-foreground">Try another tab or reload WakeState. Reloading may discard unsaved entries; saved journal records are kept.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Reload WakeState</Button>
      </section>;
    }
    return this.props.children;
  }
}
