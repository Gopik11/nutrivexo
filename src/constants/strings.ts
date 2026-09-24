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
        subtitle: 'How you generally like to eat — pick as many as apply.',
        options: [
          'No specific pattern',
          'Vegetarian',
          'Vegan',
          'Pescatarian',
          'Gluten-free',
          'Low sodium',
          'Low sugar',
          'Keto',
          'Halal',
          'Kosher',
          'Low FODMAP',
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
    modeCamera: 'Camera',
    modeBarcode: 'Barcode',
    modeManual: 'Type it in',
    productNameLabel: 'Product name (optional)',
    productNamePlaceholder: 'e.g. Whole grain crackers',
    ingredientsLabel: 'Ingredients (and nutrition facts, if you have them)',
    ingredientsPlaceholder: 'Ingredients: Whole wheat flour, water, salt, yeast…',
    analyze: 'Analyze',
    cameraPermissionTitle: 'Camera access needed',
    cameraPermissionBody:
      'Nutrivexo needs your camera to scan ingredient labels. You can also type ingredients in manually instead.',
    enableCamera: 'Enable camera',
    openSettings: 'Open settings',
    readingLabel: 'Reading label…',
    ocrUnavailable:
      'On-device text recognition isn’t available in this build. Try typing the ingredients instead.',
    ocrFailed:
      'We had trouble reading that photo. Try again with better lighting, or type the ingredients instead.',
    noTextFound: 'We couldn’t find any ingredient text. Try again or type it in manually.',
    tryAgain: 'Try again',
    typeInstead: 'Type instead',
    barcodeInstructions: 'Point your camera at the barcode.',
    barcodeLookingUp: 'Looking up product…',
    barcodeNotFound:
      'We couldn’t find this product in the Open Food Facts database. Try the camera or type it in instead.',
    barcodeLookupFailed:
      'We couldn’t reach the product database — check your connection and try again, or type the ingredients in instead.',
    barcodeNoIngredients:
      'We found this product, but its ingredient list isn’t in the database yet. Try the camera or type it in instead.',
  },

  results: {
    saveToHistory: 'Save to history',
    savedToHistory: 'Saved to history',
    backToScan: 'Back to Scan',
    notFound: 'This scan is no longer available — it may have been deleted.',
    recommendations: 'Recommendations',
    whyThisScore: 'Why this score',
    ingredientsRecognized: 'Ingredients recognized',
    notInDatabase: 'Not in our database yet',
    notInDatabaseBody:
      'These terms weren’t recognized — they’re not necessarily concerning, we just don’t have data on them yet.',
    disclaimer: 'General wellness information, not medical advice.',
    delete: 'Delete',
    lowConfidenceTitle: 'Not enough data to score this',
    lowConfidenceBody:
      'We couldn’t recognize enough of this label to give a reliable score. Try a clearer photo, or type the ingredients in manually.',
    betterAlternatives: 'Better alternatives nearby',
    betterAlternativesLoading: 'Looking for better alternatives…',
    betterAlternativesSubtitle: 'Other products in this category that score higher for you, from Open Food Facts.',
  },

  settings: {
    title: 'Settings',
    notifications: 'Notifications',
    notificationsEnabledDesc: 'Enabled for this device.',
    notificationsDisabledDesc: 'Grant permission to receive scan and digest alerts.',
    weeklyDigest: 'Weekly digest',
    weeklyDigestDesc: 'A Monday morning summary of your scans and trends.',
    highConcernAlerts: 'High-concern alerts',
    highConcernAlertsDesc:
      'Notify me right away when a saved scan matches one of my allergies.',
    ambiguousAlerts: 'Ambiguous-ingredient alerts',
    ambiguousAlertsDesc:
      'Mute "may contain" cautions for specific allergies triggered by unspecified flavors or spices. Direct matches are never muted.',
  },

  dataPrivacy: {
    title: 'Data & privacy',
    intro:
      'Nutrivexo runs almost entirely on your device. Camera and manual scans are analyzed fully locally — nothing about them is sent anywhere. The one exception is barcode lookup: scanning a barcode sends that barcode number (nothing else about you) to Open Food Facts, an independent open database, to fetch the product’s name and ingredients. Your health profile and scan history always stay on this phone unless you delete the app.',
    storedHeading: 'What’s stored on this device',
    deleteHeading: 'Delete your data',
    deleteBody: 'Permanently erase your health profile and scan history from this device.',
    deleteButton: 'Delete all my data',
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
      dietaryConflict: "Doesn't fit your diet",
    },
  },
} as const;

export type Strings = typeof strings;
