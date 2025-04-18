import { PanelLeft } from 'lucide-react';
import Button from '../ui/Button';
import useSidebarContext from '@/hooks/useSidebarContext';
import SettingsButton from './SettingsButton';

export default function Header() {
  const { isSidebarOpen, openSidebar } = useSidebarContext();

  return (
    <header className="z-10 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <Button onClick={() => openSidebar()}>
            <PanelLeft />
          </Button>
        )}
        <div className="text-xl">Model</div>
      </div>

      <SettingsButton />
    </header>
  );
}
