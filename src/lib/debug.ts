/**
 * Debug utilities for controlling verbose logging
 * Can be used in browser console or set via environment variables
 */

// Enable/disable verbose login logging
export const VERBOSE_LOGIN = {
  enable: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('VERBOSE_LOGIN', 'true');
      console.log('✅ Verbose login logging ENABLED');
      console.log('🔍 You will now see detailed login/session logs in the console');
      console.log('📝 To disable: VERBOSE_LOGIN.disable() or set VERBOSE_LOGIN=false in localStorage');
    }
  },
  
  disable: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('VERBOSE_LOGIN', 'false');
      console.log('🔇 Verbose login logging DISABLED');
      console.log('📝 To enable: VERBOSE_LOGIN.enable() or set VERBOSE_LOGIN=true in localStorage');
    }
  },
  
  status: () => {
    if (typeof window !== 'undefined') {
      const enabled = localStorage.getItem('VERBOSE_LOGIN') !== 'false';
      console.log(`🔍 Verbose login logging is ${enabled ? 'ENABLED' : 'DISABLED'}`);
      return enabled;
    }
    return false;
  },
  
  // Set environment variable for server-side logging
  setServerLogging: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      const key = 'VERBOSE_LOGIN_SERVER';
      localStorage.setItem(key, enabled ? 'true' : 'false');
      console.log(`🔧 Server-side logging ${enabled ? 'ENABLED' : 'DISABLED'} (requires restart)`);
      console.log(`📝 Set environment variable: VERBOSE_LOGIN=${enabled ? 'true' : 'false'}`);
    }
  }
};

// Make it available globally for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).VERBOSE_LOGIN = VERBOSE_LOGIN;
  console.log('🔧 Debug utilities loaded. Use VERBOSE_LOGIN.enable() to start detailed logging');
}
