export const DEADBEAT_LEADERBOARD = [
  {
    id: 1,
    name: "John Doe",
    middleName: "The Ghost",
    subtitle: "Last seen dodging venmos",
    amount: 1200,
  },
  {
    id: 2,
    name: "Jane Doe",
    middleName: "The Witch",
    subtitle: "Last seen casting spells",
    amount: 2200,
  },
  {
    id: 3,
    name: "Jim Beam",
    middleName: "The Bear",
    subtitle: "Last seen drinking beer",
    amount: 100,
  },
];

export type RecentActivityItem = {
  id: number;
  title: string;
  subtitle: {
    timeStamp: string;
    category: string;
  };
  amount: number;
  split: string;
};

export const RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 1,
    title: "Oh My Chicken",
    subtitle: {
      timeStamp: "Fri, 8:45 PM",
      category: "Food",
    },
    amount: 1400,
    split: "4 ways",
  },
  {
    id: 2,
    title: "Pizza Circle",
    subtitle: {
      timeStamp: "Fri, 8:45 PM",
      category: "Food",
    },
    amount: 1400,
    split: "4 ways",
  },
  {
    id: 3,
    title: "Labim Mall",
    subtitle: {
      timeStamp: "Fri, 8:45 PM",
      category: "Movie",
    },
    amount: 200,
    split: "2 ways",
  },
];

/** Home recent activities plus extra rows for Splits tab. */
export const SPLITS_ACTIVITY_ROWS: RecentActivityItem[] = [
  ...RECENT_ACTIVITIES,
  {
    id: 4,
    title: "Blue Bottle Coffee",
    subtitle: {
      timeStamp: "Sat, 10:12 AM",
      category: "Coffee",
    },
    amount: 1860,
    split: "3 ways",
  },
  {
    id: 5,
    title: "Uber to Airport",
    subtitle: {
      timeStamp: "Sun, 6:30 AM",
      category: "Transport",
    },
    amount: 4800,
    split: "2 ways",
  },
  {
    id: 6,
    title: "Whole Foods Run",
    subtitle: {
      timeStamp: "Mon, 7:15 PM",
      category: "Groceries",
    },
    amount: 9230,
    split: "5 ways",
  },
  {
    id: 7,
    title: "Shell Station",
    subtitle: {
      timeStamp: "Tue, 5:40 PM",
      category: "Gas",
    },
    amount: 5200,
    split: "2 ways",
  },
  {
    id: 8,
    title: "Target Haul",
    subtitle: {
      timeStamp: "Wed, 2:20 PM",
      category: "Shopping",
    },
    amount: 6740,
    split: "4 ways",
  },
];
