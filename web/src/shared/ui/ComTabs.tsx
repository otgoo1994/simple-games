import { useState } from 'react';
import { CategoryType } from '~/entities/common';

interface ComTabsProps {
  tabs: { value: number; label: string }[];
  tabKey: string;
  onCallBack?: (value: number) => void;
  isLoading: boolean;
}

export const ComTabs = ({ tabs, tabKey, onCallBack, isLoading }: ComTabsProps) => {
  const [activeTab, setActiveTab] = useState<number>(-1);

  const handleClickTab = (e: React.MouseEvent<HTMLButtonElement>, value: number) => {
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });

    setActiveTab(value);
    onCallBack?.(value);
  };

  if (isLoading) {
    return (
      <div className="skeleton-header">
        <div className="skeleton-tabs">
          <div className="skeleton-tab active" />
          <div className="skeleton-tab" />
        </div>
      </div>
    );
  }

  return (
    <div className="schedule__tabs">
      {tabs.map((tab) => (
        <button
          key={`${tabKey}-${tab.value}`}
          onClick={(e) => handleClickTab(e, tab.value)}
          className={`schedule__tab ${activeTab === tab.value ? 'schedule__tab--active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
