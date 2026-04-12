import { SettingsContent } from "./settings-content";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <p className="mb-1 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Your account
        </p>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight">Settings</h1>
      </div>
      <SettingsContent />
    </div>
  );
}
