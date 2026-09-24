import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Shape of every entry in /data/locations.json.
 * Import this anywhere you read the JSON:
 *   import raw from '@/data/locations.json';
 *   import type { Location } from '@/store/useStore';
 *   const locations = raw as Location[];
 */
export interface Location {
  id: string;
  name: string;
  county: string;
  icon: string;
  lore: string;
  fullDescription: string;
  heroImage: string;
  cardThumbnail: string;
  heroVideo: string;
  coordinates: { x: number; y: number };
  borderColor: string;
  glowColor: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  ts: number;
}

interface AppStore {
  // --- intro ---
  introComplete: boolean;
  setIntroComplete: (complete: boolean) => void;

  // --- map / location panel ---
  selectedLocation: string | null;
  setSelectedLocation: (id: string | null) => void;
  closePanel: () => void;

  // --- saved locations (persisted) ---
  savedLocations: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;

  // --- email modal ---
  showEmailModal: boolean;
  setShowEmailModal: (show: boolean) => void;
  emailBannerDismissed: boolean;
  dismissEmailBanner: () => void;

  // --- Ask AI chat (persisted) ---
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  chatPrefill: string | null;
  askAbout: (locationName: string) => void;
  consumePrefill: () => string | null;
  messages: ChatMessage[];
  pushMessage: (role: ChatMessage['role'], content: string) => void;
  clearChat: () => void;

  // --- hydration guard ---
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // intro
      introComplete: false,
      setIntroComplete: (complete) => set({ introComplete: complete }),

      // map
      selectedLocation: null,
      setSelectedLocation: (id) => set({ selectedLocation: id }),
      closePanel: () => set({ selectedLocation: null }),

      // saved
      savedLocations: [],
      toggleSaved: (id) =>
        set((s) => ({
          savedLocations: s.savedLocations.includes(id)
            ? s.savedLocations.filter((x) => x !== id)
            : [...s.savedLocations, id],
        })),
      isSaved: (id) => get().savedLocations.includes(id),

      // email
      showEmailModal: false,
      setShowEmailModal: (show) => set({ showEmailModal: show }),
      emailBannerDismissed: false,
      dismissEmailBanner: () => set({ emailBannerDismissed: true }),

      // chat
      showChat: false,
      setShowChat: (show) => set({ showChat: show }),
      chatPrefill: null,
      // Wired to the "Ask AI about [Name]" button in LocationDetail
      askAbout: (locationName) =>
        set({ showChat: true, chatPrefill: `Tell me about ${locationName}` }),
      consumePrefill: () => {
        const p = get().chatPrefill;
        if (p) set({ chatPrefill: null });
        return p;
      },
      messages: [],
      pushMessage: (role, content) =>
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id:
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                  ? crypto.randomUUID()
                  : `${Date.now()}-${Math.random()}`,
              role,
              content,
              ts: Date.now(),
            },
          ],
        })),
      clearChat: () => set({ messages: [] }),

      // hydration
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'leonida-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist real user data. UI state (modals, selected marker,
      // introComplete) stays in memory so SSR and first client render match.
      partialize: (s) => ({
        savedLocations: s.savedLocations,
        messages: s.messages,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
