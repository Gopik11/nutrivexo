export const strings = {
  app: {
    name: 'Nutrivexo',
    tagline: 'Your calm guide to ingredient clarity',
  },

  common: {
    continue: 'Continue',
    back: 'Back',
    skip: 'Skip for now',
    save: 'Save',
    cancel: 'Cancel',
    done: 'Done',
    learnMore: 'Learn more',
    getStarted: 'Get started',
  },

  onboarding: {
    welcome: {
      title: 'Clarity at the shelf',
      subtitle:
        'Scan any ingredient label and see how it fits your personal health profile — in seconds, with calm, specific guidance.',
      featureScan: 'Scan labels in-store',
      featureProfile: 'Personalized to your profile',
      featureExplain: 'Plain-language explanations',
    },
    healthProfile: {
      title: 'Your health profile',
      subtitle:
        'This helps us tailor every scan to you. You can update this anytime in Profile.',
      allergies: {
        title: 'Allergies & sensitivities',
        subtitle: 'Select any that apply. We will always surface these first.',
        options: [
          'Peanuts',
          'Tree nuts',
          'Milk',
          'Eggs',
          'Wheat',
          'Soy',
          'Fish',
          'Shellfish',
          'Sesame',
        ],
      },
      conditions: {
        title: 'Health considerations',
        subtitle: 'Optional. Helps us frame ingredient notes in context for you.',
        options: [
          'Diabetes',
          'Hypertension',
          'Celiac disease',
          'IBS',
          'Kidney disease',
          'Heart disease',
        ],
      },
      dietaryPattern: {
        title: 'Dietary pattern',
        subtitle: 'How you generally like to eat.',
        options: [
          'No specific pattern',
          'Vegetarian',
          'Vegan',
          'Pescatarian',
          'Gluten-free',
          'Low sodium',
          'Low sugar',
          'Keto',
        ],
      },
      goals: {
        title: 'Your goals',
        subtitle: 'What you are working toward right now.',
        options: [
          'Reduce added sugar',
          'Lower sodium',
          'More whole foods',
          'Manage weight',
          'Support heart health',
          'Support gut health',
        ],
      },
    },
    permissions: {
      title: 'A few permissions',
      subtitle:
        'Nutrivexo needs your camera to scan labels and optional notifications for helpful weekly summaries.',
      camera: {
        title: 'Camera access',
        description: 'Used only when you scan a product label.',
      },
      notifications: {
        title: 'Notifications',
        description: 'Weekly digest and goal-based nudges — you control these in Settings.',
      },
      enableCamera: 'Enable camera',
      enableNotifications: 'Enable notifications',
    },
    disclaimer: {
      title: 'Before we begin',
      subtitle: 'Please read and acknowledge the following.',
      notMedical: {
        title: 'Not medical advice',
        body:
          'Nutrivexo provides general wellness and ingredient information based on your profile. It is not a medical device and does not diagnose, treat, or prevent any condition. Always consult a qualified healthcare professional for medical decisions.',
      },
      dataPrivacy: {
        title: 'Your data',
        body:
          'Your health profile and scan history are stored securely and used only to personalize your experience. You can view or delete your data anytime in Profile.',
      },
      consent:
        'I understand Nutrivexo is not a substitute for professional medical advice, and I consent to storing my health profile data as described.',
      startUsing: 'Start using Nutrivexo',
    },
  },

  tabs: {
    scan: 'Scan',
    history: 'History',
    insights: 'Insights',
    profile: 'Profile',
  },

  scan: {
    title: 'Scan a label',
    subtitle: 'Point your camera at the ingredient list. We will guide you to a clear capture.',
    placeholder: 'Camera view will appear here in Phase 2',
  },

  history: {
    title: 'Scan history',
    subtitle: 'Your past scans will appear here.',
    empty: 'No scans yet. Scan your first product to start building your history.',
  },

  insights: {
    title: 'Insights',
    subtitle: 'Trends and patterns from your scans will appear here.',
    empty: 'Scan a few products to unlock personalized insights.',
  },

  profile: {
    title: 'Profile',
    healthProfile: 'Health profile',
    settings: 'Settings',
    disclaimer: 'Disclaimer & legal',
    dataPrivacy: 'Data & privacy',
    editProfile: 'Edit health profile',
    version: 'Version',
  },

  components: {
    scoreRing: {
      label: 'Health score',
      outOf: 'out of 100',
    },
    alertBanner: {
      contains: 'Contains',
      mayContain: 'May contain',
      crossReactive: 'Cross-reactive',
    },
  },
} as const;

export type Strings = typeof strings;
