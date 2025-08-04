export const STYLES = {
  COLORS: {
    PRIMARY_GRADIENT: 'bg-gradient-to-r from-orange-600 to-pink-600',
    SECONDARY_GRADIENT: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    SUCCESS_GRADIENT: 'bg-gradient-to-r from-green-600 to-emerald-600',
    WARNING_GRADIENT: 'bg-gradient-to-r from-yellow-600 to-orange-600',
    DANGER_GRADIENT: 'bg-gradient-to-r from-red-600 to-pink-600',
    TABLE_HEADER: 'bg-slate-500 text-white',
    CARD_STANDARD: 'card-animate bg-white/80 backdrop-blur-sm border-white/50',
    TEXT_PRIMARY: 'text-teal-800',
    TEXT_SECONDARY: 'text-slate-600',
    TEXT_MUTED: 'text-slate-400',
  },
  
  ANIMATIONS: {
    FADE_IN_UP: 'animate-fade-in-up',
    SLIDE_IN_LEFT: 'animate-slide-in-left',
    HOVER_LIFT: 'hover-lift',
    HOVER_GLOW: 'hover-glow',
    BTN_ANIMATE: 'btn-animate',
    CARD_ANIMATE: 'card-animate',
    TABLE_ROW_ANIMATE: 'table-row-animate',
    STAGGER_ANIMATE: 'stagger-animate',
  },
  
  LAYOUT: {
    PAGE_CONTAINER: 'p-6 space-y-6',
    PAGE_HEADER: 'flex items-center justify-between',
    PAGE_TITLE: 'text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent',
    PAGE_SUBTITLE: 'text-slate-600 mt-2',
    CARD_HEADER: 'flex items-center gap-2',
    CARD_CONTENT: 'space-y-4',
  },
  
  TABLES: {
    CONTAINER: 'overflow-x-auto',
    STANDARD: 'w-full',
    HEADER_ROW: 'border-b border-slate-200 bg-slate-500',
    HEADER_CELL: 'text-left p-4 font-semibold text-xs uppercase tracking-wider text-white',
    DATA_ROW: 'table-row-animate border-b border-slate-200',
    DATA_CELL: 'p-4 text-teal-800',
    DATA_CELL_RIGHT: 'p-4 text-teal-800 text-right',
    ACTIONS_CELL: 'p-4 text-right',
  },
  
  BUTTONS: {
    PRIMARY: 'btn-animate hover-glow',
    SECONDARY: 'btn-animate',
    GHOST: 'btn-animate hover-glow',
    OUTLINE: 'btn-animate',
    SM: 'h-8 px-3 text-xs',
    MD: 'h-10 px-4',
    LG: 'h-12 px-6',
  },
  
  FORMS: {
    INPUT_STANDARD: 'input-animate focus-ring',
    SEARCH_CONTAINER: 'flex-1 relative',
    SEARCH_INPUT: 'pl-10 input-animate focus-ring',
    SEARCH_ICON: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4',
  },
  
  STATES: {
    LOADING: 'flex items-center justify-center py-12',
    LOADING_SPINNER: 'h-8 w-8 animate-spin text-orange-600',
    LOADING_TEXT: 'ml-2 text-slate-600',
    EMPTY: 'text-center py-12',
    EMPTY_TEXT: 'text-slate-400 mb-4',
  },
  
  PAGINATION: {
    CONTAINER: 'flex items-center justify-between pt-4',
    INFO: 'text-sm text-slate-600',
    CONTROLS: 'flex items-center gap-2',
    BUTTON: 'btn-animate',
  },
} as const;

export const ICONS = {
  SEARCH: 'h-5 w-5 text-orange-600',
  EYE: 'h-4 w-4',
  EDIT: 'h-4 w-4',
  PLUS: 'h-4 w-4 mr-2',
  FILTER: 'h-4 w-4 mr-2',
  CHEVRON_LEFT: 'h-4 w-4',
  CHEVRON_RIGHT: 'h-4 w-4',
  LOADER: 'h-8 w-8 animate-spin text-orange-600',
} as const;

export const SPACING = {
  PAGE_PADDING: 'p-6',
  CARD_SPACING: 'space-y-6',
  SECTION_SPACING: 'space-y-4',
  ITEM_SPACING: 'gap-4',
  BUTTON_SPACING: 'gap-2',
} as const;

export const SIZES = {
  TEXT_XS: 'text-xs',
  TEXT_SM: 'text-sm',
  TEXT_BASE: 'text-base',
  TEXT_LG: 'text-lg',
  TEXT_XL: 'text-xl',
  TEXT_2XL: 'text-2xl',
  TEXT_3XL: 'text-3xl',
} as const;

export const FONTS = {
  WEIGHT_NORMAL: 'font-normal',
  WEIGHT_MEDIUM: 'font-medium',
  WEIGHT_SEMIBOLD: 'font-semibold',
  WEIGHT_BOLD: 'font-bold',
} as const; 