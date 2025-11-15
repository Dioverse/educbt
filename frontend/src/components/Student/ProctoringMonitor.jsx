import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import studentExamService from '../../services/studentExamService';
import useStudentExamStore from '../../store/studentExamStore';

export default function ProctoringMonitor({ attemptId, examSettings }) {
  const { 
    incrementTabSwitch, 
    addViolation, 
    tabSwitchCount,
    setFullscreen,
  } = useStudentExamStore();

  const hasLoggedFullscreenExit = useRef(false);

  // Log proctoring event mutation
  const logEventMutation = useMutation({
    mutationFn: (eventData) => studentExamService.logProctoringEvent(attemptId, eventData),
  });

  // Monitor tab visibility
  useEffect(() => {
    if (!examSettings.enableTabSwitch) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementTabSwitch();
        
        logEventMutation.mutate({
          event_type: 'tab_switch',
          description: 'Student switched away from exam tab',
          severity: tabSwitchCount >= (examSettings.maxTabSwitches - 1) ? 'high' : 'medium',
          event_data: {
            tab_switch_count: tabSwitchCount + 1,
            timestamp: new Date().toISOString(),
          },
        });

        addViolation({
          type: 'tab_switch',
          message: 'Tab switch detected',
        });

        // Show warning if approaching limit
        if (examSettings.maxTabSwitches > 0 && 
            tabSwitchCount >= examSettings.maxTabSwitches - 2) {
          alert(`Warning: You have ${examSettings.maxTabSwitches - tabSwitchCount - 1} tab switches remaining!`);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examSettings, tabSwitchCount]);

  // Monitor blur events
  useEffect(() => {
    const handleBlur = () => {
      logEventMutation.mutate({
        event_type: 'window_blur',
        description: 'Exam window lost focus',
        severity: 'low',
        event_data: {
          timestamp: new Date().toISOString(),
        },
      });
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Monitor fullscreen
  useEffect(() => {
    if (!examSettings.lockFullscreen) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setFullscreen(isFullscreen);

      if (!isFullscreen && !hasLoggedFullscreenExit.current) {
        hasLoggedFullscreenExit.current = true;
        
        logEventMutation.mutate({
          event_type: 'fullscreen_exit',
          description: 'Student exited fullscreen mode',
          severity: 'critical',
          event_data: {
            timestamp: new Date().toISOString(),
          },
        });

        addViolation({
          type: 'fullscreen_exit',
          message: 'Fullscreen mode exited',
        });

        alert('Warning: You have exited fullscreen mode. This has been logged.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Request fullscreen on mount
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [examSettings]);

  // Monitor copy/paste attempts
  useEffect(() => {
    const handleCopy = (e) => {
      e.preventDefault();
      
      logEventMutation.mutate({
        event_type: 'copy_attempt',
        description: 'Student attempted to copy content',
        severity: 'medium',
        event_data: {
          timestamp: new Date().toISOString(),
        },
      });

      addViolation({
        type: 'copy_attempt',
        message: 'Copy attempt detected',
      });
    };

    const handlePaste = (e) => {
      // Allow paste for answer inputs only
      if (!e.target.matches('textarea, input[type="text"]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Monitor right-click
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      
      logEventMutation.mutate({
        event_type: 'right_click',
        description: 'Student attempted right-click',
        severity: 'low',
        event_data: {
          timestamp: new Date().toISOString(),
        },
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}