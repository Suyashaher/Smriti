export interface StoryQuestion {
  id: string;
  questionKey: string;
  choicesKeys: string[];
  correctIndex: number;
}

export interface StoryData {
  id: string;
  difficulty: 1 | 2 | 3;
  titleKey: string;
  textKey: string;
  questions: StoryQuestion[];
}

export const STORIES: StoryData[] = [
  // Difficulty 1: Easy
  {
    id: "market_morning",
    difficulty: 1,
    titleKey: "story.market_morning.title",
    textKey: "story.market_morning.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.market_morning.q1",
        choicesKeys: ["story.market_morning.q1_c0", "story.market_morning.q1_c1"],
        correctIndex: 0
      },
      {
        id: "q2",
        questionKey: "story.market_morning.q2",
        choicesKeys: ["story.market_morning.q2_c0", "story.market_morning.q2_c1"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "dog_walk",
    difficulty: 1,
    titleKey: "story.dog_walk.title",
    textKey: "story.dog_walk.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.dog_walk.q1",
        choicesKeys: ["story.dog_walk.q1_c0", "story.dog_walk.q1_c1"],
        correctIndex: 0
      },
      {
        id: "q2",
        questionKey: "story.dog_walk.q2",
        choicesKeys: ["story.dog_walk.q2_c0", "story.dog_walk.q2_c1"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "making_tea",
    difficulty: 1,
    titleKey: "story.making_tea.title",
    textKey: "story.making_tea.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.making_tea.q1",
        choicesKeys: ["story.making_tea.q1_c0", "story.making_tea.q1_c1"],
        correctIndex: 1
      },
      {
        id: "q2",
        questionKey: "story.making_tea.q2",
        choicesKeys: ["story.making_tea.q2_c0", "story.making_tea.q2_c1"],
        correctIndex: 0
      }
    ]
  },
  // Difficulty 2: Medium
  {
    id: "festival_day",
    difficulty: 2,
    titleKey: "story.festival_day.title",
    textKey: "story.festival_day.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.festival_day.q1",
        choicesKeys: ["story.festival_day.q1_c0", "story.festival_day.q1_c1", "story.festival_day.q1_c2"],
        correctIndex: 2
      },
      {
        id: "q2",
        questionKey: "story.festival_day.q2",
        choicesKeys: ["story.festival_day.q2_c0", "story.festival_day.q2_c1", "story.festival_day.q2_c2"],
        correctIndex: 0
      },
      {
        id: "q3",
        questionKey: "story.festival_day.q3",
        choicesKeys: ["story.festival_day.q3_c0", "story.festival_day.q3_c1", "story.festival_day.q3_c2"],
        correctIndex: 1
      }
    ]
  },
  {
    id: "lost_keys",
    difficulty: 2,
    titleKey: "story.lost_keys.title",
    textKey: "story.lost_keys.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.lost_keys.q1",
        choicesKeys: ["story.lost_keys.q1_c0", "story.lost_keys.q1_c1", "story.lost_keys.q1_c2"],
        correctIndex: 1
      },
      {
        id: "q2",
        questionKey: "story.lost_keys.q2",
        choicesKeys: ["story.lost_keys.q2_c0", "story.lost_keys.q2_c1", "story.lost_keys.q2_c2"],
        correctIndex: 2
      },
      {
        id: "q3",
        questionKey: "story.lost_keys.q3",
        choicesKeys: ["story.lost_keys.q3_c0", "story.lost_keys.q3_c1", "story.lost_keys.q3_c2"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "visiting_friend",
    difficulty: 2,
    titleKey: "story.visiting_friend.title",
    textKey: "story.visiting_friend.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.visiting_friend.q1",
        choicesKeys: ["story.visiting_friend.q1_c0", "story.visiting_friend.q1_c1", "story.visiting_friend.q1_c2"],
        correctIndex: 0
      },
      {
        id: "q2",
        questionKey: "story.visiting_friend.q2",
        choicesKeys: ["story.visiting_friend.q2_c0", "story.visiting_friend.q2_c1", "story.visiting_friend.q2_c2"],
        correctIndex: 1
      },
      {
        id: "q3",
        questionKey: "story.visiting_friend.q3",
        choicesKeys: ["story.visiting_friend.q3_c0", "story.visiting_friend.q3_c1", "story.visiting_friend.q3_c2"],
        correctIndex: 2
      }
    ]
  },
  // Difficulty 3: Hard
  {
    id: "childhood_home",
    difficulty: 3,
    titleKey: "story.childhood_home.title",
    textKey: "story.childhood_home.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.childhood_home.q1",
        choicesKeys: ["story.childhood_home.q1_c0", "story.childhood_home.q1_c1", "story.childhood_home.q1_c2", "story.childhood_home.q1_c3"],
        correctIndex: 0
      },
      {
        id: "q2",
        questionKey: "story.childhood_home.q2",
        choicesKeys: ["story.childhood_home.q2_c0", "story.childhood_home.q2_c1", "story.childhood_home.q2_c2", "story.childhood_home.q2_c3"],
        correctIndex: 3
      },
      {
        id: "q3",
        questionKey: "story.childhood_home.q3",
        choicesKeys: ["story.childhood_home.q3_c0", "story.childhood_home.q3_c1", "story.childhood_home.q3_c2", "story.childhood_home.q3_c3"],
        correctIndex: 1
      },
      {
        id: "q4",
        questionKey: "story.childhood_home.q4",
        choicesKeys: ["story.childhood_home.q4_c0", "story.childhood_home.q4_c1", "story.childhood_home.q4_c2", "story.childhood_home.q4_c3"],
        correctIndex: 2
      }
    ]
  },
  {
    id: "long_journey",
    difficulty: 3,
    titleKey: "story.long_journey.title",
    textKey: "story.long_journey.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.long_journey.q1",
        choicesKeys: ["story.long_journey.q1_c0", "story.long_journey.q1_c1", "story.long_journey.q1_c2", "story.long_journey.q1_c3"],
        correctIndex: 2
      },
      {
        id: "q2",
        questionKey: "story.long_journey.q2",
        choicesKeys: ["story.long_journey.q2_c0", "story.long_journey.q2_c1", "story.long_journey.q2_c2", "story.long_journey.q2_c3"],
        correctIndex: 1
      },
      {
        id: "q3",
        questionKey: "story.long_journey.q3",
        choicesKeys: ["story.long_journey.q3_c0", "story.long_journey.q3_c1", "story.long_journey.q3_c2", "story.long_journey.q3_c3"],
        correctIndex: 3
      },
      {
        id: "q4",
        questionKey: "story.long_journey.q4",
        choicesKeys: ["story.long_journey.q4_c0", "story.long_journey.q4_c1", "story.long_journey.q4_c2", "story.long_journey.q4_c3"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "special_recipe",
    difficulty: 3,
    titleKey: "story.special_recipe.title",
    textKey: "story.special_recipe.text",
    questions: [
      {
        id: "q1",
        questionKey: "story.special_recipe.q1",
        choicesKeys: ["story.special_recipe.q1_c0", "story.special_recipe.q1_c1", "story.special_recipe.q1_c2", "story.special_recipe.q1_c3"],
        correctIndex: 1
      },
      {
        id: "q2",
        questionKey: "story.special_recipe.q2",
        choicesKeys: ["story.special_recipe.q2_c0", "story.special_recipe.q2_c1", "story.special_recipe.q2_c2", "story.special_recipe.q2_c3"],
        correctIndex: 3
      },
      {
        id: "q3",
        questionKey: "story.special_recipe.q3",
        choicesKeys: ["story.special_recipe.q3_c0", "story.special_recipe.q3_c1", "story.special_recipe.q3_c2", "story.special_recipe.q3_c3"],
        correctIndex: 0
      },
      {
        id: "q4",
        questionKey: "story.special_recipe.q4",
        choicesKeys: ["story.special_recipe.q4_c0", "story.special_recipe.q4_c1", "story.special_recipe.q4_c2", "story.special_recipe.q4_c3"],
        correctIndex: 2
      }
    ]
  }
];

export function getStoryForDifficulty(difficultyLevel: number): StoryData {
  // Map difficulty level (1-10) to 1, 2, or 3
  let cat: 1 | 2 | 3 = 1;
  if (difficultyLevel > 3 && difficultyLevel <= 7) cat = 2;
  if (difficultyLevel > 7) cat = 3;

  const validStories = STORIES.filter(s => s.difficulty === cat);
  const randomIndex = Math.floor(Math.random() * validStories.length);
  return validStories[randomIndex];
}
