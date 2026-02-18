// Game configuration and clothing data
export const CONFIG = {
  // Weather types
  WEATHER: {
    HOT: 'Hot',
    VERY_HOT: 'Very Hot',
    RAINY: 'Rainy',
    COLD: 'Cold',
    SNOWY: 'Snowy'
  }
};

// Weather configurations
export const WEATHER_DATA = {
  'Hot': {
    background: 'https://rosebud.ai/assets/sunny-bg.webp?1vrc',
    speech: "It's a hot sunny day! I better wear...",
    color: '#87CEEB'
  },
  'Very Hot': {
    background: 'https://rosebud.ai/assets/hot-bg.webp?s48d',
    speech: "It's very hot today! I better wear...",
    color: '#FFA500'
  },
  'Rainy': {
    background: 'https://rosebud.ai/assets/rainy-bg.webp?TCVz',
    speech: "It's raining! I better wear...",
    color: '#708090'
  },
  'Cold': {
    background: 'https://rosebud.ai/assets/cold-bg.webp?KlzH',
    speech: "It's cold and windy! I better wear...",
    color: '#A9A9A9'
  },
  'Snowy': {
    background: 'https://rosebud.ai/assets/snowy-bg.webp?tYLu',
    speech: "It's snowing! I better wear...",
    color: '#E0E8F0'
  }
};

// Avatar data
export const AVATARS = {
  boy: {
    name: 'Boy',
    url: 'https://rosebud.ai/assets/boy-avatar.webp?Q2NT'
  },
  girl: {
    name: 'Girl',
    url: 'https://rosebud.ai/assets/girl-avatar.webp?jWs6'
  }
};

// Clothing items by category
export const CLOTHING = {
  top: [
    { 
      name: 'Red T-Shirt', 
      url: 'https://rosebud.ai/assets/t-shirt-red.webp?oL1C',
      good: ['Hot', 'Very Hot', 'Rainy'],
      scale: 0.35,
      yOffset: -0.05
    },
    { 
      name: 'Blue T-Shirt', 
      url: 'https://rosebud.ai/assets/t-shirt-blue.webp?cw0X',
      good: ['Hot', 'Very Hot', 'Rainy'],
      scale: 0.35,
      yOffset: -0.05
    },
    { 
      name: 'Yellow Tank Top', 
      url: 'https://rosebud.ai/assets/tank-top-yellow.webp?ThLT',
      good: ['Very Hot'],
      scale: 0.35,
      yOffset: -0.05
    },
    { 
      name: 'Green Long Sleeve', 
      url: 'https://rosebud.ai/assets/long-sleeve-green.webp?k2ZL',
      good: ['Cold', 'Rainy'],
      scale: 0.35,
      yOffset: -0.05
    },
    { 
      name: 'Orange Sweater', 
      url: 'https://rosebud.ai/assets/sweater-orange.webp?bX13',
      good: ['Cold', 'Snowy'],
      scale: 0.35,
      yOffset: -0.05
    },
    { 
      name: 'None', 
      url: null,
      good: [],
      scale: 1,
      yOffset: 0
    }
  ],
  bottom: [
    { 
      name: 'Blue Shorts', 
      url: 'https://rosebud.ai/assets/shorts-blue.webp?FlI9',
      good: ['Hot', 'Very Hot'],
      scale: 0.3,
      yOffset: 0.15
    },
    { 
      name: 'Pink Skirt', 
      url: 'https://rosebud.ai/assets/skirt-pink.webp?bape',
      good: ['Hot', 'Very Hot'],
      scale: 0.3,
      yOffset: 0.15
    },
    { 
      name: 'Jeans', 
      url: 'https://rosebud.ai/assets/pants-jeans.webp?SUXk',
      good: ['Hot', 'Rainy', 'Cold'],
      scale: 0.3,
      yOffset: 0.15
    },
    { 
      name: 'Winter Pants', 
      url: 'https://rosebud.ai/assets/pants-winter.webp?coVx',
      good: ['Cold', 'Snowy'],
      scale: 0.3,
      yOffset: 0.15
    },
    { 
      name: 'None', 
      url: null,
      good: [],
      scale: 1,
      yOffset: 0
    }
  ],
  shoes: [
    { 
      name: 'Red Sneakers', 
      url: 'https://rosebud.ai/assets/sneakers-red.webp?vwKj',
      good: ['Hot', 'Very Hot', 'Cold'],
      scale: 0.25,
      yOffset: 0.38
    },
    { 
      name: 'Blue Sandals', 
      url: 'https://rosebud.ai/assets/sandals-blue.webp?U6X9',
      good: ['Hot', 'Very Hot'],
      scale: 0.22,
      yOffset: 0.38
    },
    { 
      name: 'Yellow Rain Boots', 
      url: 'https://rosebud.ai/assets/boots-yellow.webp?E8yz',
      good: ['Rainy'],
      scale: 0.22,
      yOffset: 0.38
    },
    { 
      name: 'Winter Boots', 
      url: 'https://rosebud.ai/assets/winter-boots.webp?sH0E',
      good: ['Cold', 'Snowy'],
      scale: 0.25,
      yOffset: 0.38
    },
    { 
      name: 'None', 
      url: null,
      good: [],
      scale: 1,
      yOffset: 0
    }
  ],
  outerwear: [
    { 
      name: 'Yellow Raincoat', 
      url: 'https://rosebud.ai/assets/raincoat-yellow.webp?w2nR',
      good: ['Rainy'],
      scale: 0.4,
      yOffset: -0.05
    },
    { 
      name: 'Blue Jacket', 
      url: 'https://rosebud.ai/assets/jacket-blue.webp?3FzM',
      good: ['Cold'],
      scale: 0.4,
      yOffset: -0.05
    },
    { 
      name: 'Red Winter Coat', 
      url: 'https://rosebud.ai/assets/winter-coat.webp?s8ih',
      good: ['Snowy', 'Cold'],
      scale: 0.4,
      yOffset: -0.05
    },
    { 
      name: 'Orange Vest', 
      url: 'https://rosebud.ai/assets/vest-orange.webp?be6C',
      good: ['Cold'],
      scale: 0.35,
      yOffset: -0.05
    },
    { 
      name: 'None', 
      url: null,
      good: ['Hot', 'Very Hot'],
      scale: 1,
      yOffset: 0
    }
  ],
  accessory: [
    { 
      name: 'Sun Hat', 
      url: 'https://rosebud.ai/assets/hat-sun.webp?uoyj',
      good: ['Hot', 'Very Hot'],
      scale: 0.28,
      yOffset: -0.35
    },
    { 
      name: 'Red Beanie', 
      url: 'https://rosebud.ai/assets/hat-beanie.webp?QWdP',
      good: ['Cold', 'Snowy'],
      scale: 0.25,
      yOffset: -0.35
    },
    { 
      name: 'Red Umbrella', 
      url: 'https://rosebud.ai/assets/umbrella-red.webp?LurF',
      good: ['Rainy'],
      scale: 0.3,
      yOffset: -0.15,
      xOffset: 0.25
    },
    { 
      name: 'Sunglasses', 
      url: 'https://rosebud.ai/assets/sunglasses.webp?7Cze',
      good: ['Hot', 'Very Hot'],
      scale: 0.18,
      yOffset: -0.25
    },
    { 
      name: 'Blue Scarf', 
      url: 'https://rosebud.ai/assets/scarf-blue.webp?zVbI',
      good: ['Cold', 'Snowy'],
      scale: 0.25,
      yOffset: -0.1
    },
    { 
      name: 'Pink Earmuffs', 
      url: 'https://rosebud.ai/assets/earmuffs-pink.webp?50qc',
      good: ['Cold', 'Snowy'],
      scale: 0.25,
      yOffset: -0.28
    },
    { 
      name: 'None', 
      url: null,
      good: ['Hot', 'Very Hot', 'Rainy', 'Cold', 'Snowy'],
      scale: 1,
      yOffset: 0
    }
  ]
};

// Clothing sequence
export const CLOTHING_SEQUENCE = ['top', 'bottom', 'shoes', 'outerwear', 'accessory'];

// Nice labels for UI
export const CATEGORY_LABELS = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  outerwear: 'Outerwear',
  accessory: 'Accessory'
};
