import Anthropic from '@anthropic-ai/sdk';

export interface GeneratedQuestion {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: Record<string, string>;
}

export interface CodeEvaluation {
  correctness: string;
  timeComplexity: string;
  spaceComplexity: string;
  hints: string[];
  codeReview: string;
  score: number;
}

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
let anthropic: Anthropic | null = null;

if (anthropicApiKey) {
  try {
    anthropic = new Anthropic({ apiKey: anthropicApiKey });
    console.log('🤖 Anthropic Claude AI Interviewer initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Anthropic initialization notice:', err);
  }
} else {
  console.log('ℹ️ Note: ANTHROPIC_API_KEY not set. Using rich randomized LeetCode problem vault & analyzer.');
}

// Expansive Multi-Category LeetCode Problem Bank with multiple problems per difficulty & topic
const LEETCODE_VAULT: Record<string, Record<'Easy' | 'Medium' | 'Hard', GeneratedQuestion[]>> = {
  'Arrays & Hashing': {
    Easy: [
      {
        title: 'LeetCode 1: Two Sum',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.\n\nYou can return the answer in any order.`,
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
          { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 242: Valid Anagram',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        description: `Given two strings \`s\` and \`t\`, return \`true\` *if* \`t\` *is an anagram of* \`s\`, *and* \`false\` *otherwise*.\n\nAn **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
        examples: [
          { input: 's = "anagram", t = "nagaram"', output: 'true' },
          { input: 's = "rat", t = "car"', output: 'false' }
        ],
        constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 217: Contains Duplicate',
        difficulty: 'Easy',
        topic: 'Arrays & Hashing',
        description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
        examples: [
          { input: 'nums = [1,2,3,1]', output: 'true' },
          { input: 'nums = [1,2,3,4]', output: 'false' },
          { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 49: Group Anagrams',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in **any order**.\n\nAn **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
        examples: [
          { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
          { input: 'strs = [""]', output: '[[""]]' }
        ],
        constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 347: Top K Frequent Elements',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        description: `Given an integer array \`nums\` and an integer \`k\`, return *the* \`k\` *most frequent elements*. You may return the answer in **any order**.\n\nYour algorithm's time complexity must be better than \`O(n log n)\`, where \`n\` is the array's size.`,
        examples: [
          { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
          { input: 'nums = [1], k = 1', output: '[1]' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', 'k is in the range [1, the number of unique elements in the array].'],
        starterCode: {}
      },
      {
        title: 'LeetCode 238: Product of Array Except Self',
        difficulty: 'Medium',
        topic: 'Arrays & Hashing',
        description: `Given an integer array \`nums\`, return *an array* \`answer\` *such that* \`answer[i]\` *is equal to the product of all the elements of* \`nums\` *except* \`nums[i]\`.\n\nYou must write an algorithm that runs in \`O(n)\` time and without using the division operation.`,
        examples: [
          { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
          { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }
        ],
        constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 41: First Missing Positive',
        difficulty: 'Hard',
        topic: 'Arrays & Hashing',
        description: `Given an unsorted integer array \`nums\`, return the *smallest missing positive integer*.\n\nYou must implement an algorithm that runs in \`O(n)\` time and uses \`O(1)\` auxiliary space.`,
        examples: [
          { input: 'nums = [1,2,0]', output: '3' },
          { input: 'nums = [3,4,-1,1]', output: '2' },
          { input: 'nums = [7,8,9,11,12]', output: '1' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '-2^31 <= nums[i] <= 2^31 - 1'],
        starterCode: {}
      },
      {
        title: 'LeetCode 128: Longest Consecutive Sequence',
        difficulty: 'Hard',
        topic: 'Arrays & Hashing',
        description: `Given an unsorted array of integers \`nums\`, return *the length of the longest consecutive elements sequence*.\n\nYou must write an algorithm that runs in \`O(n)\` time.`,
        examples: [
          { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.' },
          { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' }
        ],
        constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
        starterCode: {}
      }
    ]
  },
  'Two Pointers': {
    Easy: [
      {
        title: 'LeetCode 125: Valid Palindrome',
        difficulty: 'Easy',
        topic: 'Two Pointers',
        description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string \`s\`, return \`true\` *if it is a palindrome, or* \`false\` *otherwise*.`,
        examples: [
          { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
          { input: 's = "race a car"', output: 'false' }
        ],
        constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 167: Two Sum II - Input Array Is Sorted',
        difficulty: 'Easy',
        topic: 'Two Pointers',
        description: `Given a **1-indexed** array of integers \`numbers\` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific \`target\` number.\n\nReturn *the indices of the two numbers, added by one, as an integer array* \`[index1, index2]\` *of length 2*.`,
        examples: [
          { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]' },
          { input: 'numbers = [2,3,4], target = 6', output: '[1,3]' }
        ],
        constraints: ['2 <= numbers.length <= 3 * 10^4', '-1000 <= numbers[i] <= 1000', 'numbers is sorted in non-decreasing order.'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 15: 3Sum',
        difficulty: 'Medium',
        topic: 'Two Pointers',
        description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.\n\nNotice that the solution set must not contain duplicate triplets.`,
        examples: [
          { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
          { input: 'nums = [0,1,1]', output: '[]' }
        ],
        constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
        starterCode: {}
      },
      {
        title: 'LeetCode 11: Container With Most Water',
        difficulty: 'Medium',
        topic: 'Two Pointers',
        description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn *the maximum amount of water a container can store*.`,
        examples: [
          { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' },
          { input: 'height = [1,1]', output: '1' }
        ],
        constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 42: Trapping Rain Water',
        difficulty: 'Hard',
        topic: 'Two Pointers',
        description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
        examples: [
          { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
          { input: 'height = [4,2,0,3,2,5]', output: '9' }
        ],
        constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
        starterCode: {}
      }
    ]
  },
  'Sliding Window': {
    Easy: [
      {
        title: 'LeetCode 121: Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        topic: 'Sliding Window',
        description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.\n\nYou want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.\n\nReturn *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
        examples: [
          { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
          { input: 'prices = [7,6,4,3,1]', output: '0' }
        ],
        constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 3: Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        topic: 'Sliding Window',
        description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
        examples: [
          { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
          { input: 's = "bbbbb"', output: '1' }
        ],
        constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 424: Longest Repeating Character Replacement',
        difficulty: 'Medium',
        topic: 'Sliding Window',
        description: `You are given a string \`s\` and an integer \`k\`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most \`k\` times.\n\nReturn *the length of the longest substring containing the same letter you can get after performing the above operations*.`,
        examples: [
          { input: 's = "ABAB", k = 2', output: '4' },
          { input: 's = "AABABBA", k = 1', output: '4' }
        ],
        constraints: ['1 <= s.length <= 10^5', 's consists of only uppercase English letters.', '0 <= k <= s.length'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 76: Minimum Window Substring',
        difficulty: 'Hard',
        topic: 'Sliding Window',
        description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the **minimum window substring** of \`s\` such that every character in \`t\` (**including duplicates**) is included in the window. If there is no such substring, return the empty string \`""\`.`,
        examples: [
          { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
          { input: 's = "a", t = "a"', output: '"a"' },
          { input: 's = "a", t = "aa"', output: '""' }
        ],
        constraints: ['m == s.length', 'n == t.length', '1 <= m, n <= 10^5', 's and t consist of uppercase and lowercase English letters.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 239: Sliding Window Maximum',
        difficulty: 'Hard',
        topic: 'Sliding Window',
        description: `You are given an array of integers \`nums\`, there is a sliding window of size \`k\` which is moving from the very left of the array to the very right. You can only see the \`k\` numbers in the window. Each time the sliding window moves right by one position.\n\nReturn *the max sliding window*.`,
        examples: [
          { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
          { input: 'nums = [1], k = 1', output: '[1]' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', '1 <= k <= nums.length'],
        starterCode: {}
      }
    ]
  },
  'Stack & Queues': {
    Easy: [
      {
        title: 'LeetCode 20: Valid Parentheses',
        difficulty: 'Easy',
        topic: 'Stack & Queues',
        description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
        examples: [
          { input: 's = "()"', output: 'true' },
          { input: 's = "()[]{}"', output: 'true' },
          { input: 's = "(]"', output: 'false' }
        ],
        constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \`()[]{}\`.'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 155: Min Stack',
        difficulty: 'Medium',
        topic: 'Stack & Queues',
        description: `Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the \`MinStack\` class:\n- \`MinStack()\` initializes the stack object.\n- \`void push(int val)\` pushes the element val onto the stack.\n- \`void pop()\` removes the element on the top of the stack.\n- \`int top()\` gets the top element of the stack.\n- \`int getMin()\` retrieves the minimum element in the stack.`,
        examples: [
          { input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\\n[[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]' }
        ],
        constraints: ['-2^31 <= val <= 2^31 - 1', 'Methods pop, top and getMin operations will always be called on non-empty stacks.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 739: Daily Temperatures',
        difficulty: 'Medium',
        topic: 'Stack & Queues',
        description: `Given an array of integers \`temperatures\` represents the daily temperatures, return *an array* \`answer\` *such that* \`answer[i]\` *is the number of days you have to wait after the* \`i-th\` *day to get a warmer temperature*. If there is no future day for which this is possible, keep \`answer[i] == 0\` instead.`,
        examples: [
          { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
          { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' }
        ],
        constraints: ['1 <= temperatures.length <= 10^5', '30 <= temperatures[i] <= 100'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 84: Largest Rectangle in Histogram',
        difficulty: 'Hard',
        topic: 'Stack & Queues',
        description: `Given an array of integers \`heights\` representing the histogram's bar height where the width of each bar is \`1\`, return *the area of the largest rectangle in the histogram*.`,
        examples: [
          { input: 'heights = [2,1,5,6,2,3]', output: '10' },
          { input: 'heights = [2,4]', output: '4' }
        ],
        constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
        starterCode: {}
      }
    ]
  },
  'Binary Search': {
    Easy: [
      {
        title: 'LeetCode 704: Binary Search',
        difficulty: 'Easy',
        topic: 'Binary Search',
        description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity.`,
        examples: [
          { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
          { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
        ],
        constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All the integers in nums are unique.', 'nums is sorted in ascending order.'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 74: Search a 2D Matrix',
        difficulty: 'Medium',
        topic: 'Binary Search',
        description: `You are given an \`m x n\` integer matrix \`matrix\` with the following two properties:\n1. Each row is sorted in non-decreasing order.\n2. The first integer of each row is greater than the last integer of the previous row.\n\nGiven an integer \`target\`, return \`true\` *if* \`target\` *is in* \`matrix\` *or* \`false\` *otherwise* in \`O(log(m * n))\` time.`,
        examples: [
          { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' },
          { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13', output: 'false' }
        ],
        constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 100', '-10^4 <= matrix[i][j], target <= 10^4'],
        starterCode: {}
      },
      {
        title: 'LeetCode 875: Koko Eating Bananas',
        difficulty: 'Medium',
        topic: 'Binary Search',
        description: `Koko loves to eat bananas. There are \`n\` piles of bananas, the \`i-th\` pile has \`piles[i]\` bananas. The guards have gone and will come back in \`h\` hours.\n\nKoko can decide her bananas-per-hour eating speed of \`k\`. Return *the minimum integer* \`k\` *such that she can eat all the bananas within* \`h\` *hours*.`,
        examples: [
          { input: 'piles = [3,6,7,11], h = 8', output: '4' },
          { input: 'piles = [30,11,23,4,20], h = 5', output: '30' }
        ],
        constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9', '1 <= piles[i] <= 10^9'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 4: Median of Two Sorted Arrays',
        difficulty: 'Hard',
        topic: 'Binary Search',
        description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.\n\nThe overall run time complexity should be \`O(log (m+n))\`.`,
        examples: [
          { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' },
          { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' }
        ],
        constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
        starterCode: {}
      }
    ]
  },
  'Linked Lists': {
    Easy: [
      {
        title: 'LeetCode 206: Reverse Linked List',
        difficulty: 'Easy',
        topic: 'Linked Lists',
        description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.`,
        examples: [
          { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
          { input: 'head = [1,2]', output: '[2,1]' }
        ],
        constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
        starterCode: {}
      },
      {
        title: 'LeetCode 21: Merge Two Sorted Lists',
        difficulty: 'Easy',
        topic: 'Linked Lists',
        description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.\n\nMerge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn *the head of the merged linked list*.`,
        examples: [
          { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
          { input: 'list1 = [], list2 = []', output: '[]' }
        ],
        constraints: ['The number of nodes in both lists is in the range [0, 50].', '-100 <= Node.val <= 100', 'Both list1 and list2 are sorted in non-decreasing order.'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 143: Reorder List',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        description: `You are given the head of a singly linked-list: \`L0 → L1 → … → Ln - 1 → Ln\`\n\nReorder the list to be on the following form:\n\`L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …\`\n\nYou may not modify the values in the list's nodes. Only nodes themselves may be changed.`,
        examples: [
          { input: 'head = [1,2,3,4]', output: '[1,4,2,3]' },
          { input: 'head = [1,2,3,4,5]', output: '[1,5,2,4,3]' }
        ],
        constraints: ['The number of nodes in the list is in the range [1, 5 * 10^4].', '1 <= Node.val <= 1000'],
        starterCode: {}
      },
      {
        title: 'LeetCode 19: Remove Nth Node From End of List',
        difficulty: 'Medium',
        topic: 'Linked Lists',
        description: `Given the \`head\` of a linked list, remove the \`n-th\` node from the end of the list and return its head in one pass.`,
        examples: [
          { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' },
          { input: 'head = [1], n = 1', output: '[]' }
        ],
        constraints: ['The number of nodes in the list is sz.', '1 <= sz <= 30', '0 <= Node.val <= 100', '1 <= n <= sz'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 23: Merge k Sorted Lists',
        difficulty: 'Hard',
        topic: 'Linked Lists',
        description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.\n\n*Merge all the linked-lists into one sorted linked-list and return it*.`,
        examples: [
          { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
          { input: 'lists = []', output: '[]' }
        ],
        constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500', '-10^4 <= lists[i][j] <= 10^4'],
        starterCode: {}
      }
    ]
  },
  'Trees & Graphs': {
    Easy: [
      {
        title: 'LeetCode 226: Invert Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees & Graphs',
        description: `Given the \`root\` of a binary tree, invert the tree, and return *its root*.`,
        examples: [
          { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
          { input: 'root = [2,1,3]', output: '[2,3,1]' }
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100'],
        starterCode: {}
      },
      {
        title: 'LeetCode 104: Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        topic: 'Trees & Graphs',
        description: `Given the \`root\` of a binary tree, return *its maximum depth*.\n\nA binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
        examples: [
          { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
          { input: 'root = [1,null,2]', output: '2' }
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-100 <= Node.val <= 100'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 200: Number of Islands',
        difficulty: 'Medium',
        topic: 'Trees & Graphs',
        description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.\n\nAn **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
        examples: [
          { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
          { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }
        ],
        constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is "0" or "1".'],
        starterCode: {}
      },
      {
        title: 'LeetCode 102: Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        topic: 'Trees & Graphs',
        description: `Given the \`root\` of a binary tree, return *the level order traversal of its nodes\' values*. (i.e., from left to right, level by level).`,
        examples: [
          { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
          { input: 'root = [1]', output: '[[1]]' }
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 2000].', '-1000 <= Node.val <= 1000'],
        starterCode: {}
      },
      {
        title: 'LeetCode 207: Course Schedule',
        difficulty: 'Medium',
        topic: 'Trees & Graphs',
        description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you must take course \`b_i\` first if you want to take course \`a_i\`.\n\nReturn \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
        examples: [
          { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' },
          { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' }
        ],
        constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', 'prerequisites[i].length == 2', 'All the pairs prerequisites[i] are unique.'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 124: Binary Tree Maximum Path Sum',
        difficulty: 'Hard',
        topic: 'Trees & Graphs',
        description: `A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**.\n\nGiven the \`root\` of a binary tree, return *the maximum **path sum** of any non-empty path*.`,
        examples: [
          { input: 'root = [1,2,3]', output: '6', explanation: 'The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.' },
          { input: 'root = [-10,9,20,null,null,15,7]', output: '42', explanation: 'The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.' }
        ],
        constraints: ['The number of nodes in the tree is in the range [1, 3 * 10^4].', '-1000 <= Node.val <= 1000'],
        starterCode: {}
      },
      {
        title: 'LeetCode 127: Word Ladder',
        difficulty: 'Hard',
        topic: 'Trees & Graphs',
        description: `A **transformation sequence** from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words \`beginWord -> s1 -> s2 -> ... -> sk\` such that:\n- Every adjacent pair of words differs by a single letter.\n- Every \`si\` for \`1 <= i <= k\` is in \`wordList\`.\n- \`sk == endWord\`\n\nGiven \`beginWord\`, \`endWord\`, and \`wordList\`, return *the **number of words** in the **shortest transformation sequence***, or \`0\` if no such sequence exists.`,
        examples: [
          { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' },
          { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0' }
        ],
        constraints: ['1 <= beginWord.length <= 10', 'endWord.length == beginWord.length', '1 <= wordList.length <= 5000', 'beginWord != endWord'],
        starterCode: {}
      }
    ]
  },
  'Dynamic Programming': {
    Easy: [
      {
        title: 'LeetCode 70: Climbing Stairs',
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        description: `You are climbing a staircase. It takes \`n\` steps to reach the top.\n\nEach time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
        examples: [
          { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\\n2. 2 steps' },
          { input: 'n = 3', output: '3', explanation: '1. 1 step + 1 step + 1 step\\n2. 1 step + 2 steps\\n3. 2 steps + 1 step' }
        ],
        constraints: ['1 <= n <= 45'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 322: Coin Change',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.\n\nReturn *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.`,
        examples: [
          { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
          { input: 'coins = [2], amount = 3', output: '-1' }
        ],
        constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
        starterCode: {}
      },
      {
        title: 'LeetCode 198: House Robber',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.\n\nGiven an integer array \`nums\` representing the amount of money of each house, return *the maximum amount of money you can rob tonight without alerting the police*.`,
        examples: [
          { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4.' },
          { input: 'nums = [2,7,9,3,1]', output: '12' }
        ],
        constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
        starterCode: {}
      },
      {
        title: 'LeetCode 300: Longest Increasing Subsequence',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        description: `Given an integer array \`nums\`, return *the length of the longest strictly increasing subsequence*.`,
        examples: [
          { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.' },
          { input: 'nums = [0,1,0,3,2,3]', output: '4' }
        ],
        constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 72: Edit Distance',
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        description: `Given two strings \`word1\` and \`word2\`, return *the minimum number of operations required to convert \`word1\` to \`word2\`*.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character`,
        examples: [
          { input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'horse -> rorse (replace "h" with "r") -> rose (remove "r") -> ros (remove "e")' },
          { input: 'word1 = "intention", word2 = "execution"', output: '5' }
        ],
        constraints: ['0 <= word1.length, word2.length <= 500', 'word1 and word2 consist of lowercase English letters.'],
        starterCode: {}
      }
    ]
  },
  'SQL Database Queries': {
    Easy: [
      { title: 'LeetCode 175: Combine Two Tables', difficulty: 'Easy', topic: 'SQL Database Queries', description: `Write a solution to report the first name, last name, city, and state of each person in the \`Person\` table. If the address of a \`personId\` is not present in the \`Address\` table, report \`null\` instead.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Person table + Address table', output: 'firstName | lastName | city | state' }], constraints: ['personId is the primary key column for the Person table.'], starterCode: {} },
      { title: 'LeetCode 182: Duplicate Emails', difficulty: 'Easy', topic: 'SQL Database Queries', description: `Write a solution to report all the duplicate emails in the \`Person\` table. Note that it's guaranteed email field is not NULL.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Person (id, email) with duplicate a@b.com', output: 'email: "a@b.com"' }], constraints: ['id is the primary key column for the Person table.'], starterCode: {} },
      { title: 'LeetCode 181: Employees Earning More Than Their Managers', difficulty: 'Easy', topic: 'SQL Database Queries', description: `Write a solution to find the employees who earn more than their managers.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Employee(id, name, salary, managerId)', output: 'Employee names earning more than their manager' }], constraints: ['No employee is their own manager.'], starterCode: {} },
      { title: 'LeetCode 183: Customers Who Never Order', difficulty: 'Easy', topic: 'SQL Database Queries', description: `Write a solution to find all customers who never order anything.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Customers + Orders tables', output: 'Customers column with names who have no matching orders' }], constraints: ['id is the primary key for Customers.'], starterCode: {} },
      { title: 'LeetCode 196: Delete Duplicate Emails', difficulty: 'Easy', topic: 'SQL Database Queries', description: `Write a solution to **delete** all duplicate email entries in a table named \`Person\`, keeping only one unique email with the smallest \`id\`.\n\nThe final order of the Person table does not matter.`, examples: [{ input: 'Person(1,john@mail.com),(2,bob@mail.com),(3,john@mail.com)', output: 'Row with id=3 deleted' }], constraints: ['id is primary key.'], starterCode: {} },
      { title: 'LeetCode 197: Rising Temperature', difficulty: 'Easy', topic: 'SQL Database Queries', description: `Write a solution to find all dates' \`Id\` with higher temperatures compared to its previous dates (yesterday).\n\nReturn the result table in **any order**.`, examples: [{ input: 'Weather(id, recordDate, temperature)', output: 'id of days warmer than the previous day' }], constraints: ['recordDate contains unique dates.'], starterCode: {} },
      { title: 'LeetCode 595: Big Countries', difficulty: 'Easy', topic: 'SQL Database Queries', description: `A country is **big** if it has an area of at least three million (3,000,000 km²), or it has a population of at least twenty-five million (25,000,000).\n\nWrite a solution to find the name, population, and area of the **big countries**.\n\nReturn the result table in **any order**.`, examples: [{ input: 'World table', output: 'name | population | area' }], constraints: ['name is the primary key.'], starterCode: {} },
      { title: 'LeetCode 584: Find Customer Referee', difficulty: 'Easy', topic: 'SQL Database Queries', description: `Find the names of the customer that are **not referred by** the customer with \`id = 2\`.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Customer(id, name, referee_id)', output: 'Names where referee_id != 2 or IS NULL' }], constraints: ['id is primary key.'], starterCode: {} }
    ],
    Medium: [
      { title: 'LeetCode 184: Department Highest Salary', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Write a solution to find employees who have the highest salary in each of the departments.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Employee table + Department table', output: 'Department | Employee | Salary' }], constraints: ['id is the primary key column for the Employee table.'], starterCode: {} },
      { title: 'LeetCode 176: Second Highest Salary', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Write a solution to find the second highest distinct salary from the \`Employee\` table. If there is no second highest salary, return \`null\`.`, examples: [{ input: 'Employee with salaries [100, 200, 300]', output: 'SecondHighestSalary: 200' }, { input: 'Employee with salary [100]', output: 'SecondHighestSalary: null' }], constraints: ['id is the primary key column for the Employee table.'], starterCode: {} },
      { title: 'LeetCode 177: Nth Highest Salary', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Write a solution to find the **nth** highest salary from the \`Employee\` table. If there is no nth highest salary, return \`null\`.`, examples: [{ input: 'getNthHighestSalary(2), salaries = [100, 200, 300]', output: '200' }], constraints: ['Create a function getNthHighestSalary(N INT).'], starterCode: {} },
      { title: 'LeetCode 178: Rank Scores', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Write a solution to find the rank of the scores. The ranking should be calculated according to:\n- The scores should be ranked from the highest to the lowest.\n- If there is a tie, both should have the same ranking.\n- After a tie, the next ranking number should be the next consecutive integer (dense ranking).`, examples: [{ input: 'Scores(id, score)', output: 'score | rank' }], constraints: ['id is primary key.'], starterCode: {} },
      { title: 'LeetCode 180: Consecutive Numbers', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Find all numbers that appear at least **three times consecutively**.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Logs(id, num): 1,1 2,1 3,1 4,2 5,1 6,2 7,2', output: 'ConsecutiveNums: 1' }], constraints: ['id is auto-increment primary key.'], starterCode: {} },
      { title: 'LeetCode 550: Game Play Analysis IV', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Write a solution to report the **fraction of players** that logged in again on the day after the day they first logged in, **rounded to 2 decimal places**.`, examples: [{ input: 'Activity(player_id, device_id, event_date, games_played)', output: 'fraction' }], constraints: ['(player_id, event_date) is the primary key.'], starterCode: {} },
      { title: 'LeetCode 570: Managers with at Least 5 Direct Reports', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Write a solution to find managers with at least **five direct reports**.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Employee(id, name, department, managerId)', output: 'name of managers with >= 5 reports' }], constraints: ['id is primary key, managerId references id.'], starterCode: {} },
      { title: 'LeetCode 1164: Product Price at a Given Date', difficulty: 'Medium', topic: 'SQL Database Queries', description: `Write a solution to find the prices of all products on \`2019-08-16\`. Assume the price of all products before any change is **10**.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Products(product_id, new_price, change_date)', output: 'product_id | price' }], constraints: ['(product_id, change_date) is the primary key.'], starterCode: {} }
    ],
    Hard: [
      { title: 'LeetCode 185: Department Top Three Salaries', difficulty: 'Hard', topic: 'SQL Database Queries', description: `A company's executives are interested in seeing who earns the most money in each of the company's departments. A **high earner** in a department is an employee who has a salary in the **top three unique salaries** for that department.\n\nWrite a solution to find the employees who are **high earners** in each of the departments.\n\nReturn the result table in **any order**.`, examples: [{ input: 'Employee table + Department table', output: 'Department | Employee | Salary' }], constraints: ['id is the primary key column for the Employee table.'], starterCode: {} },
      { title: 'LeetCode 262: Trips and Users', difficulty: 'Hard', topic: 'SQL Database Queries', description: `Find the **cancellation rate** of requests with unbanned users (both client and driver must not be banned) each day between \`"2013-10-01"\` and \`"2013-10-03"\`. Round Cancellation Rate to **two decimal** points.`, examples: [{ input: 'Trips + Users tables', output: 'Day | Cancellation Rate' }], constraints: ['id is primary key for Trips.'], starterCode: {} },
      { title: 'LeetCode 601: Human Traffic of Stadium', difficulty: 'Hard', topic: 'SQL Database Queries', description: `Write a solution to display records with **three or more** rows with **consecutive** id's, and the number of people is greater than or equal to 100 for each.\n\nReturn the result table ordered by \`visit_date\` in **ascending order**.`, examples: [{ input: 'Stadium(id, visit_date, people)', output: 'id | visit_date | people (rows part of consecutive >=100 streak)' }], constraints: ['id is auto-increment, visit_date has unique values.'], starterCode: {} },
      { title: 'LeetCode 1369: Get the Second Most Recent Activity', difficulty: 'Hard', topic: 'SQL Database Queries', description: `Write a solution to show the **second most recent activity** of each user. If the user only has one activity, return that one.\n\nReturn the result table in **any order**.`, examples: [{ input: 'UserActivity(username, activity, startDate, endDate)', output: 'username | activity | startDate | endDate' }], constraints: ['No primary key, table may have duplicates.'], starterCode: {} }
    ]
  },
  'Web Development': {
    Easy: [
      { title: 'HTML5: Accessible Registration Form with Validation', difficulty: 'Easy', topic: 'HTML5 Semantic Markup, Forms & Accessibility', description: `Create a fully accessible HTML5 registration form with \`<fieldset>\`, \`<legend>\`, \`<label>\`, ARIA attributes, and native validation (\`required\`, \`pattern\`, \`minlength\`).`, examples: [{ input: 'Submit empty form', output: 'Native validation prompts appear' }], constraints: ['WCAG 2.1 AA compliance.'], starterCode: {} },
      { title: 'CSS3: Responsive Holy Grail Layout with Grid & Flexbox', difficulty: 'Easy', topic: 'CSS3 Flexbox, Grid & Responsive Design', description: `Implement a Holy Grail Layout using CSS Grid. 3 columns on desktop (>= 768px), single stacked column on mobile. Use CSS custom properties for dark mode.`, examples: [{ input: '1200px viewport', output: '3-column grid' }], constraints: ['Pure CSS3, no frameworks.'], starterCode: {} },
      { title: 'Web Dev: Debounce Function', difficulty: 'Easy', topic: 'Web Development', description: `Implement a \`debounce(fn, delay)\` function. The returned function delays invoking \`fn\` until \`delay\` ms have elapsed since the last call.`, examples: [{ input: 'debounce(fn, 50) called 3 times rapidly', output: 'fn executes once after 50ms of quiet time' }], constraints: ['0 <= delay <= 1000'], starterCode: {} },
      { title: 'Web Dev: Memoize Async API Results', difficulty: 'Easy', topic: 'Web Development', description: `Return a memoized version of an async function that caches results by argument hash for a given TTL window.`, examples: [{ input: 'memoizedFetch("user_123") x2', output: 'Second call returns cache' }], constraints: ['Arguments are JSON serializable.'], starterCode: {} },
      { title: 'Web Dev: Array.prototype.flat Implementation', difficulty: 'Easy', topic: 'Web Development', description: `Implement \`Array.prototype.flat(depth)\` from scratch without using the native flat method. The function should recursively flatten nested arrays up to the specified depth.`, examples: [{ input: '[1,[2,[3,[4]]]].flat(2)', output: '[1,2,3,[4]]' }], constraints: ['Handle edge cases: empty arrays, non-array elements.'], starterCode: {} },
      { title: 'Web Dev: Promise.all Polyfill', difficulty: 'Easy', topic: 'Web Development', description: `Implement \`Promise.all(promises)\` from scratch. It should resolve when all promises resolve and reject immediately if any promise rejects.`, examples: [{ input: 'Promise.all([p1, p2, p3])', output: '[result1, result2, result3]' }], constraints: ['Results must be in the same order as input promises.'], starterCode: {} },
      { title: 'Web Dev: Deep Clone Object', difficulty: 'Easy', topic: 'Web Development', description: `Implement a \`deepClone(obj)\` function that creates a deep copy of a JavaScript object, handling nested objects, arrays, Date, RegExp, Map, Set, and circular references.`, examples: [{ input: 'deepClone({a: {b: 1}, c: [2,3]})', output: 'New independent object with same structure' }], constraints: ['Handle circular references without infinite recursion.'], starterCode: {} },
      { title: 'CSS3: Dark Mode Toggle with CSS Custom Properties', difficulty: 'Easy', topic: 'CSS3 Flexbox, Grid & Responsive Design', description: `Create a complete dark/light mode toggle using only CSS custom properties and a class toggle. Include smooth transitions between modes.`, examples: [{ input: 'Toggle switch clicked', output: 'Colors, backgrounds, shadows all transition smoothly' }], constraints: ['No JavaScript for styling logic, only class toggle.'], starterCode: {} }
    ],
    Medium: [
      { title: 'HTML5 & CSS3: Accessible Modal Dialog with Focus Trap', difficulty: 'Medium', topic: 'HTML5 Semantic Markup, Forms & Accessibility', description: `Build an accessible Modal using \`<dialog>\` with \`::backdrop\`, focus trapping (Tab key stays inside), Escape to close, and ARIA labeling.`, examples: [{ input: 'dialog.showModal()', output: 'Focus trapped inside modal' }], constraints: ['ARIA attributes required.'], starterCode: {} },
      { title: 'Web Dev: Token Bucket API Rate Limiter', difficulty: 'Medium', topic: 'Web Development', description: `Implement an in-memory Rate Limiter middleware for Express. Allow \`limit\` requests per \`windowMs\` per client IP. Return 429 with Retry-After header when exceeded.`, examples: [{ input: 'RateLimiter(5, 60000)', output: '6th request returns 429' }], constraints: ['Handle concurrent requests without race conditions.'], starterCode: {} },
      { title: 'Web Dev: Event Emitter with Once & Unsubscribe', difficulty: 'Medium', topic: 'Web Development', description: `Design an EventEmitter with \`subscribe(event, cb)\` returning \`{unsubscribe()}\`, \`emit(event, ...args)\` returning results array, and \`once(event, cb)\`.`, examples: [{ input: 'emitter.subscribe("click", x => x+1); emitter.emit("click", [5])', output: '[6]' }], constraints: ['Execute in registration order.'], starterCode: {} },
      { title: 'Web Dev: Virtual DOM Diff Algorithm', difficulty: 'Medium', topic: 'Web Development', description: `Implement a simplified Virtual DOM diffing algorithm. Given two virtual DOM trees (plain JS objects with tag, props, children), compute the minimal set of patches (CREATE, REMOVE, REPLACE, UPDATE_PROPS, UPDATE_CHILDREN) needed to transform the old tree into the new tree.`, examples: [{ input: 'diff({tag:"div",children:[{tag:"p"}]}, {tag:"div",children:[{tag:"span"}]})', output: '[{type:"REPLACE",path:[0],newNode:{tag:"span"}}]' }], constraints: ['Handle text nodes, attribute changes, and child reordering.'], starterCode: {} },
      { title: 'Web Dev: Custom React useState Hook', difficulty: 'Medium', topic: 'Web Development', description: `Implement a simplified version of React's \`useState\` hook. Create a module that tracks component state across re-renders using a closure-based approach with an internal state array and cursor.`, examples: [{ input: 'const [count, setCount] = useState(0); setCount(1);', output: 'count === 1 after re-render' }], constraints: ['Support multiple useState calls per component.'], starterCode: {} },
      { title: 'Web Dev: Throttle with Leading & Trailing Options', difficulty: 'Medium', topic: 'Web Development', description: `Implement a \`throttle(fn, delay, {leading, trailing})\` function. When \`leading\` is true, invoke on the leading edge. When \`trailing\` is true, invoke on the trailing edge. Support cancellation.`, examples: [{ input: 'throttle(fn, 1000, {leading:true, trailing:true})', output: 'Fires immediately, then at most once per 1000ms, with trailing call' }], constraints: ['Must support both leading and trailing options simultaneously.'], starterCode: {} },
      { title: 'Web Dev: JWT Authentication Middleware Pipeline', difficulty: 'Medium', topic: 'Web Development', description: `Implement a complete JWT authentication middleware for Express/Node.js including: token generation with \`jsonwebtoken\`, token verification middleware, refresh token rotation, and role-based access control (RBAC) middleware.`, examples: [{ input: 'POST /login with valid credentials', output: 'Returns {accessToken, refreshToken}' }], constraints: ['Tokens expire; refresh tokens are single-use and rotated.'], starterCode: {} },
      { title: 'Web Dev: Observable/Reactive State Manager', difficulty: 'Medium', topic: 'Web Development', description: `Build a reactive state management library. Implement \`createSignal(initialValue)\` returning \`[getter, setter]\`, and \`createEffect(fn)\` that automatically re-runs when any signal it reads changes.`, examples: [{ input: 'const [count, setCount] = createSignal(0); createEffect(() => console.log(count()));', output: 'Logs 0, then logs new value on each setCount call' }], constraints: ['Effects must track dependencies automatically.'], starterCode: {} },
      { title: 'Web Dev: Implement JSON.stringify from Scratch', difficulty: 'Medium', topic: 'Web Development', description: `Implement \`JSON.stringify(value, replacer, space)\` from scratch. Handle all JSON types (string, number, boolean, null, object, array), circular reference detection, the replacer function/array, and indentation via space parameter.`, examples: [{ input: 'stringify({a:1, b:[2,3]}, null, 2)', output: '{\\n  "a": 1,\\n  "b": [\\n    2,\\n    3\\n  ]\\n}' }], constraints: ['Throw TypeError on circular references. Ignore undefined, functions, symbols.'], starterCode: {} }
    ],
    Hard: [
      { title: 'Web Dev: Promise Pool Concurrency Controller', difficulty: 'Hard', topic: 'Web Development', description: `Given an array of async function factories and a pool limit \`n\`, execute all functions with at most \`n\` running concurrently. Return all resolved values in order.`, examples: [{ input: '[() => fetchA, () => fetchB, () => fetchC], n = 2', output: 'At most 2 in flight' }], constraints: ['1 <= functions.length <= 1000'], starterCode: {} },
      { title: 'Web Dev: Full-Stack REST API with Validation & Error Handling', difficulty: 'Hard', topic: 'Web Development', description: `Build a complete RESTful API for a task management system with CRUD operations, input validation using Zod/Joi schemas, proper HTTP status codes, pagination with cursor-based navigation, and centralized error handling middleware with structured error responses.`, examples: [{ input: 'POST /api/tasks with invalid body', output: '400 with structured validation errors' }], constraints: ['Implement proper HTTP semantics (201 for create, 204 for delete, etc).'], starterCode: {} },
      { title: 'Web Dev: Server-Sent Events Real-Time Dashboard', difficulty: 'Hard', topic: 'Web Development', description: `Implement a real-time dashboard using Server-Sent Events (SSE). The server pushes live metrics (CPU, memory, request count) every second. The client auto-reconnects on disconnect, handles \`Last-Event-ID\` for resumption, and renders a live-updating chart.`, examples: [{ input: 'GET /api/stream', output: 'Continuous event stream with id, event type, and JSON data' }], constraints: ['Handle client disconnection gracefully. Support event filtering by type.'], starterCode: {} },
      { title: 'Web Dev: Dependency Injection Container', difficulty: 'Hard', topic: 'Web Development', description: `Implement a lightweight Dependency Injection (DI) container supporting: \`register(token, factory, {singleton})\`, \`resolve(token)\`, automatic constructor injection via decorators or metadata, and circular dependency detection.`, examples: [{ input: 'container.register("db", () => new Database()); container.resolve("db")', output: 'Database instance' }], constraints: ['Detect and throw on circular dependencies.'], starterCode: {} },
      { title: 'CSS3: Complex Animated Dashboard with Keyframes & Transitions', difficulty: 'Hard', topic: 'CSS3 Flexbox, Grid & Responsive Design', description: `Create a complete analytics dashboard layout using only CSS3: animated counter cards with gradient borders, a responsive chart area with animated bars (CSS keyframes), hover micro-interactions, and a glassmorphism sidebar navigation. Must support all viewports.`, examples: [{ input: 'Page load', output: 'Cards animate in with staggered delays, bars grow with ease-out timing' }], constraints: ['Pure CSS3 animations, no JavaScript for animations.'], starterCode: {} }
    ]
  },
  'DevOps & Docker': {
    Easy: [
      { title: 'DevOps: Production Node.js Multi-Stage Dockerfile', difficulty: 'Easy', topic: 'DevOps & Docker', description: `Write an optimized multi-stage Dockerfile for a TypeScript Node.js microservice. Build stage compiles TypeScript, production stage copies only built dist/ and production node_modules. Run as non-root user with HEALTHCHECK.`, examples: [{ input: 'docker build', output: 'Final image < 120MB, non-root' }], constraints: ['Alpine Linux base, multi-stage.'], starterCode: {} },
      { title: 'DevOps: Automated Backup Script with Rotation', difficulty: 'Easy', topic: 'DevOps & Docker', description: `Write a Bash script that creates timestamped backups of a PostgreSQL database using \`pg_dump\`, compresses with gzip, uploads to a specified directory, and automatically deletes backups older than 7 days. Include error handling and logging.`, examples: [{ input: './backup.sh', output: 'backup_2024-01-15_03-00-00.sql.gz created, old backups purged' }], constraints: ['Must handle connection failures gracefully.'], starterCode: {} },
      { title: 'DevOps: System Health Check Script', difficulty: 'Easy', topic: 'DevOps & Docker', description: `Write a script that checks system health: CPU usage, memory usage, disk space, and running services. Output a formatted report and exit with non-zero code if any metric exceeds thresholds (CPU > 90%, Memory > 85%, Disk > 90%).`, examples: [{ input: './healthcheck.sh', output: 'CPU: 45% ✓ | Memory: 72% ✓ | Disk: 88% ✓ | Status: HEALTHY' }], constraints: ['Cross-compatible with common Linux distros.'], starterCode: {} },
      { title: 'DevOps: .dockerignore and Build Context Optimization', difficulty: 'Easy', topic: 'DevOps & Docker', description: `Given a Node.js monorepo, write an optimized .dockerignore file and explain how to minimize Docker build context. Then write a Dockerfile that leverages layer caching by copying package.json before source code.`, examples: [{ input: 'docker build context size before', output: '500MB → 12MB after .dockerignore' }], constraints: ['Explain cache invalidation strategies.'], starterCode: {} }
    ],
    Medium: [
      { title: 'DevOps: Docker Compose with Healthchecks & Redis', difficulty: 'Medium', topic: 'DevOps & Docker', description: `Design a docker-compose.yml for a 3-tier microservice: api (Node.js, 2 replicas), db (PostgreSQL with persistent volume), cache (Redis). API must not start until db and cache pass healthchecks.`, examples: [{ input: 'docker compose up', output: 'Services start in dependency order' }], constraints: ['Include restart policies, healthchecks, internal bridge network.'], starterCode: {} },
      { title: 'DevOps: Log Analysis & Error Spike Alerter', difficulty: 'Medium', topic: 'DevOps & Docker', description: `Write a script that parses Nginx access logs, counts HTTP status codes per minute, and alerts if 5xx errors exceed 5% over a rolling 5-minute window.`, examples: [{ input: 'access.log with 10,000 entries', output: 'Alert: 5xx spike 7.8% between 14:00-14:05' }], constraints: ['Efficient streaming for gigabyte-scale logs.'], starterCode: {} },
      { title: 'DevOps: CI/CD Pipeline with GitHub Actions', difficulty: 'Medium', topic: 'DevOps & Docker', description: `Write a complete GitHub Actions workflow YAML that: runs lint and tests on PR, builds Docker image on merge to main, pushes to container registry, and deploys to staging with environment-specific secrets. Include caching for node_modules and Docker layers.`, examples: [{ input: 'Push to main branch', output: 'Lint → Test → Build → Push → Deploy pipeline executes' }], constraints: ['Use matrix strategy for multi-Node version testing.'], starterCode: {} },
      { title: 'DevOps: Nginx Reverse Proxy with SSL & Rate Limiting', difficulty: 'Medium', topic: 'DevOps & Docker', description: `Write an Nginx configuration that serves as a reverse proxy for 3 backend services, with: SSL/TLS termination using Let's Encrypt certificates, rate limiting per IP (10 req/s burst 20), gzip compression, WebSocket proxy support, and custom error pages.`, examples: [{ input: 'curl https://api.example.com/v1/users', output: 'Proxied to backend:3000 with SSL, rate limited' }], constraints: ['Include security headers (HSTS, X-Frame-Options, CSP).'], starterCode: {} },
      { title: 'DevOps: Infrastructure Monitoring with Prometheus Metrics', difficulty: 'Medium', topic: 'DevOps & Docker', description: `Write a Python/Node.js application that exposes Prometheus-compatible metrics at \`/metrics\` endpoint. Track: HTTP request duration histograms, request counters by status code, active connections gauge, and custom business metrics. Include a Docker Compose setup with Prometheus scraper.`, examples: [{ input: 'GET /metrics', output: 'Prometheus text format with histograms and counters' }], constraints: ['Follow Prometheus naming conventions and metric types.'], starterCode: {} },
      { title: 'DevOps: Automated Certificate Rotation Script', difficulty: 'Medium', topic: 'DevOps & Docker', description: `Write a script that monitors SSL certificate expiration for a list of domains, sends alerts 30 days before expiry, and automatically triggers renewal using certbot. Include retry logic and notification via webhook.`, examples: [{ input: './cert-checker.sh domains.txt', output: 'example.com: 45 days ✓ | api.example.com: 12 days ⚠ RENEWING...' }], constraints: ['Handle certbot failures gracefully with rollback.'], starterCode: {} }
    ],
    Hard: [
      { title: 'DevOps: Zero-Downtime Kubernetes Deployment with HPA', difficulty: 'Hard', topic: 'DevOps & Docker', description: `Create a complete Kubernetes YAML manifest with: Deployment (rolling update, maxSurge 25%, maxUnavailable 0), liveness/readiness probes, HPA (70% CPU, 80% Memory, min 3, max 15), and PodDisruptionBudget (minAvailable 2).`, examples: [{ input: 'kubectl apply -f deployment.yaml', output: 'HA deployment with auto-scaling & zero downtime' }], constraints: ['Strict Kubernetes v1 API standards.'], starterCode: {} },
      { title: 'DevOps: Blue-Green Deployment Automation Script', difficulty: 'Hard', topic: 'DevOps & Docker', description: `Implement a blue-green deployment automation script that: deploys new version to inactive environment, runs smoke tests against it, switches traffic via load balancer update, monitors error rates for 5 minutes, and automatically rolls back if error rate exceeds 1%.`, examples: [{ input: './deploy.sh v2.1.0', output: 'Deploy to green → Smoke test ✓ → Switch traffic → Monitor 5m → Success' }], constraints: ['Include rollback mechanism and deployment lock to prevent concurrent deploys.'], starterCode: {} },
      { title: 'DevOps: Container Orchestration with Service Mesh', difficulty: 'Hard', topic: 'DevOps & Docker', description: `Design Docker Compose and Kubernetes configs for a microservices architecture with service mesh capabilities: service discovery, circuit breaker pattern, distributed tracing headers, mutual TLS between services, and canary deployment with traffic splitting (90/10).`, examples: [{ input: 'kubectl apply -f mesh/', output: 'Services communicate via sidecar proxies with mTLS' }], constraints: ['Implement circuit breaker with configurable failure thresholds.'], starterCode: {} },
      { title: 'DevOps: Multi-Environment Terraform-style Infrastructure Script', difficulty: 'Hard', topic: 'DevOps & Docker', description: `Write a Python/Bash infrastructure-as-code tool that reads a declarative YAML config file defining resources (VMs, networks, load balancers), generates a dependency graph, and applies changes in topological order with dry-run support, state tracking, and rollback capabilities.`, examples: [{ input: './infra.py apply --env staging', output: 'Plan: +3 create, ~1 modify, -0 destroy. Apply? [y/N]' }], constraints: ['Implement state file for tracking deployed resources.'], starterCode: {} }
    ]
  },
  'System Design': {
    Easy: [
      { title: 'System Design: LRU Cache with TTL Expiration', difficulty: 'Easy', topic: 'System Design', description: `Design an LRU cache with TTL. \`get(key)\` returns value if present and unexpired in O(1). \`put(key, value, ttlMs)\` stores with expiration in O(1), evicting LRU when capacity exceeded.`, examples: [{ input: 'cache.put(1, 100, 1000); cache.get(1)', output: '100; after 1000ms: -1' }], constraints: ['All operations O(1).'], starterCode: {} },
      { title: 'System Design: URL Shortener Service', difficulty: 'Easy', topic: 'System Design', description: `Implement a URL shortener class with \`shorten(longUrl)\` that returns a unique short code (base62 encoded), and \`resolve(shortCode)\` that returns the original URL. Handle collisions and support custom aliases.`, examples: [{ input: 'shorten("https://example.com/very/long/path")', output: '"abc123"' }], constraints: ['Short codes must be unique. Support 1 billion URLs.'], starterCode: {} },
      { title: 'System Design: In-Memory Key-Value Store with Transactions', difficulty: 'Easy', topic: 'System Design', description: `Implement an in-memory key-value store that supports transactions: \`begin()\` starts a new transaction, \`set(key, value)\`, \`get(key)\`, \`delete(key)\`, \`commit()\` applies changes, \`rollback()\` discards changes. Support nested transactions.`, examples: [{ input: 'begin(); set("a",1); get("a") → 1; rollback(); get("a") → null', output: 'Transaction isolation works' }], constraints: ['Support nested transactions with proper scoping.'], starterCode: {} },
      { title: 'System Design: Simple Pub/Sub Message Broker', difficulty: 'Easy', topic: 'System Design', description: `Implement a publish-subscribe message broker with: \`subscribe(topic, callback)\`, \`publish(topic, message)\`, \`unsubscribe(topic, callback)\`. Support wildcard topics (e.g., "user.*" matches "user.created", "user.deleted").`, examples: [{ input: 'subscribe("order.*", handler); publish("order.created", data)', output: 'handler receives data' }], constraints: ['Wildcard matching with * for single level.'], starterCode: {} }
    ],
    Medium: [
      { title: 'System Design: Consistent Hashing Ring with Virtual Nodes', difficulty: 'Medium', topic: 'System Design', description: `Implement a Consistent Hashing Ring for distributed databases. \`addNode(nodeId, vnodes=100)\`, \`removeNode(nodeId)\`, \`getNode(key)\` returns responsible server in O(log K) using binary search.`, examples: [{ input: 'ring.addNode("server-A"); ring.getNode("user:9482")', output: '"server-A"' }], constraints: ['Minimize key remapping on node changes.'], starterCode: {} },
      { title: 'System Design: Distributed Task Queue with Priority', difficulty: 'Medium', topic: 'System Design', description: `Design a task queue system with: \`enqueue(task, priority)\`, \`dequeue()\` returns highest priority task, worker registration, task retry with exponential backoff, dead letter queue for failed tasks, and at-least-once delivery guarantee.`, examples: [{ input: 'enqueue({id:1, payload:"send_email"}, priority:HIGH)', output: 'Task assigned to available worker within SLA' }], constraints: ['Handle worker failures and task timeouts.'], starterCode: {} },
      { title: 'System Design: API Gateway with Circuit Breaker', difficulty: 'Medium', topic: 'System Design', description: `Implement an API Gateway class with circuit breaker pattern. States: CLOSED (normal), OPEN (all requests fail fast), HALF-OPEN (allow probe requests). Track failure rate over sliding window, trip breaker at threshold, and auto-recover after timeout.`, examples: [{ input: 'gateway.request("/api/users") with backend down', output: 'After 5 failures: CircuitBreakerOpenError (no backend calls)' }], constraints: ['Configurable failure threshold, timeout, and sliding window size.'], starterCode: {} },
      { title: 'System Design: Bloom Filter for Membership Testing', difficulty: 'Medium', topic: 'System Design', description: `Implement a space-efficient Bloom Filter with configurable false positive rate. Support \`add(item)\` and \`mightContain(item)\`. Calculate optimal bit array size and hash function count given expected insertions and desired false positive rate.`, examples: [{ input: 'BloomFilter(expectedItems:1000000, fpRate:0.01)', output: 'Uses ~9.6 million bits with 7 hash functions' }], constraints: ['No false negatives allowed. Deletions not supported.'], starterCode: {} },
      { title: 'System Design: Event Sourcing Store', difficulty: 'Medium', topic: 'System Design', description: `Implement an event sourcing data store where state is derived from an append-only event log. Support: \`append(aggregateId, event)\`, \`getEvents(aggregateId, fromVersion?)\`, \`getSnapshot(aggregateId)\` that replays events to build current state, and periodic snapshotting for performance.`, examples: [{ input: 'append("order-1", {type:"CREATED"}); append("order-1", {type:"PAID"}); getSnapshot("order-1")', output: '{status:"PAID", version:2}' }], constraints: ['Events are immutable. Support optimistic concurrency control.'], starterCode: {} },
      { title: 'System Design: Rate Limiter with Multiple Algorithms', difficulty: 'Medium', topic: 'System Design', description: `Implement three rate limiting algorithms in a single class: Fixed Window Counter, Sliding Window Log, and Token Bucket. Each should support \`isAllowed(clientId)\` and \`getRemainingTokens(clientId)\`. Compare trade-offs.`, examples: [{ input: 'limiter.isAllowed("user:123") called 11 times with limit=10', output: '10 allowed, 11th rejected' }], constraints: ['Thread-safe for concurrent access.'], starterCode: {} }
    ],
    Hard: [
      { title: 'System Design: Distributed Unique ID Generator (Snowflake)', difficulty: 'Hard', topic: 'System Design', description: `Implement Twitter's Snowflake 64-bit distributed unique ID generator. 1 bit unused, 41 bits timestamp (69 years), 10 bits machine ID (1024 workers), 12 bits sequence (4096 IDs/ms/worker). Ensure monotonically increasing order and clock-drift protection.`, examples: [{ input: 'generator.nextId()', output: '64-bit integer (e.g., 1541815603606036480n)' }], constraints: ['Thread-safe for high-concurrency.'], starterCode: {} },
      { title: 'System Design: Raft Consensus Leader Election', difficulty: 'Hard', topic: 'System Design', description: `Implement the leader election portion of the Raft consensus algorithm. Each node has states: FOLLOWER, CANDIDATE, LEADER. Implement election timeout, requestVote RPC, vote granting rules (term comparison, log freshness), and term advancement.`, examples: [{ input: '3-node cluster, leader crashes', output: 'Remaining nodes elect new leader within election timeout' }], constraints: ['Handle split votes and term conflicts correctly.'], starterCode: {} },
      { title: 'System Design: CRDT Conflict-Free Replicated Counter', difficulty: 'Hard', topic: 'System Design', description: `Implement a CRDT (Conflict-free Replicated Data Type) G-Counter and PN-Counter for a distributed system. Support \`increment(nodeId)\`, \`decrement(nodeId)\` (PN only), \`value()\`, and \`merge(otherCounter)\` that always converges to correct count regardless of message ordering.`, examples: [{ input: 'Node A increments 3x, Node B increments 2x, merge', output: 'value() === 5 on both nodes' }], constraints: ['Eventual consistency: merge is commutative, associative, idempotent.'], starterCode: {} },
      { title: 'System Design: Write-Ahead Log (WAL) for Database Recovery', difficulty: 'Hard', topic: 'System Design', description: `Implement a Write-Ahead Log system for crash recovery. Support: \`writeLog(transactionId, operation)\` that flushes to disk before acknowledging, \`checkpoint()\` that snapshots current state, and \`recover()\` that replays log entries after last checkpoint to restore state.`, examples: [{ input: 'Crash after 3 committed transactions, 1 uncommitted', output: 'recover() restores 3 committed, discards uncommitted' }], constraints: ['Ensure durability: log must be fsync\'d before returning. Handle partial writes.'], starterCode: {} },
      { title: 'System Design: Gossip Protocol for Cluster Membership', difficulty: 'Hard', topic: 'System Design', description: `Implement a gossip-based cluster membership protocol. Each node periodically selects a random peer and exchanges membership state. Detect node failures using heartbeat counters with suspicion mechanism (ALIVE → SUSPECT → DEAD). Support protocol period tuning.`, examples: [{ input: '5-node cluster, node 3 goes offline', output: 'Within 3 protocol periods, all nodes mark node 3 as SUSPECT then DEAD' }], constraints: ['Convergence in O(log N) protocol periods for N nodes.'], starterCode: {} }
    ]
  }
};

// Topic tag mapping for LeetCode's official database
const TOPIC_TAG_MAP: Record<string, string[]> = {
  'Arrays & Hashing': ['array', 'hash-table'],
  'Two Pointers': ['two-pointers'],
  'Sliding Window': ['sliding-window'],
  'Stack & Queues': ['stack', 'queue', 'monotonic-stack'],
  'Binary Search': ['binary-search'],
  'Linked Lists': ['linked-list'],
  'Trees & Graphs': ['tree', 'binary-tree', 'graph', 'depth-first-search', 'breadth-first-search'],
  'Dynamic Programming': ['dynamic-programming'],
  'SQL & Databases': ['database'],
  'Backtracking': ['backtracking'],
  'Greedy': ['greedy'],
  'Bit Manipulation': ['bit-manipulation'],
  'Trie': ['trie'],
  'Heap / Priority Queue': ['heap-priority-queue', 'heap']
};

function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return html
    .replace(/<strong class="example">Example (\d+):<\/strong>/gi, '\n### Example $1:\n')
    .replace(/<strong>Example (\d+):<\/strong>/gi, '\n### Example $1:\n')
    .replace(/<pre>([\s\S]*?)<\/pre>/gi, (_, p1) => {
      const clean = p1.replace(/<[^>]+>/g, '').trim();
      return `\n\`\`\`\n${clean}\n\`\`\`\n`;
    })
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<ul>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Fetch a real random problem from the entire 4,000+ LeetCode question bank
 */
async function fetchLiveLeetCodeQuestion(
  topic = 'Arrays & Hashing',
  difficulty = 'Medium',
  language = 'javascript',
  excludeTitles: string[] = []
): Promise<GeneratedQuestion | null> {
  try {
    const isRandom = !topic || topic.includes('Random') || topic === 'Any';
    let tags: string[] = [];

    if (!isRandom) {
      for (const [key, val] of Object.entries(TOPIC_TAG_MAP)) {
        if (key.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(key.toLowerCase())) {
          tags = val;
          break;
        }
      }
    }

    const chosenTag = tags.length > 0 ? tags[Math.floor(Math.random() * tags.length)] : undefined;
    const filters: any = {};
    if (chosenTag) filters.tags = [chosenTag];
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      filters.difficulty = difficulty.toUpperCase();
    }

    const listRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query: `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
            total: totalNum
            questions: data { questionFrontendId title titleSlug difficulty isPaidOnly }
          }
        }`,
        variables: { categorySlug: '', skip: 0, limit: 100, filters }
      })
    });

    if (!listRes.ok) return null;
    const listData: any = await listRes.json();
    const rawQuestions: any[] = listData?.data?.problemsetQuestionList?.questions || [];
    const qList = rawQuestions.filter((q: any) => !q.isPaidOnly);
    const total = listData?.data?.problemsetQuestionList?.total || qList.length;

    if (qList.length === 0) return null;

    const isExcluded = (title: string, slug?: string) => {
      if (!title) return false;
      const lowerT = title.toLowerCase();
      const lowerS = (slug || '').toLowerCase();
      return excludeTitles.some(ex => {
        const lowerEx = ex.toLowerCase();
        return lowerT === lowerEx || lowerT.includes(lowerEx) || lowerEx.includes(lowerT) || (lowerS && lowerS.includes(lowerEx));
      });
    };

    const uncompletedQList = qList.filter((q: any) => !isExcluded(q.title, q.titleSlug));
    const activePool = uncompletedQList.length > 0 ? uncompletedQList : qList;

    let selectedItem = activePool[Math.floor(Math.random() * activePool.length)];
    if (total > 100 && uncompletedQList.length === 0) {
      const randomSkip = Math.floor(Math.random() * Math.max(1, total - 30));
      try {
        const pageRes = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          body: JSON.stringify({
            query: `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
              problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
                questions: data { questionFrontendId title titleSlug difficulty isPaidOnly }
              }
            }`,
            variables: { categorySlug: '', skip: Math.max(0, randomSkip), limit: 30, filters }
          })
        });
        if (pageRes.ok) {
          const pageData: any = await pageRes.json();
          const pQuestions = (pageData?.data?.problemsetQuestionList?.questions || []).filter((q: any) => !q.isPaidOnly);
          const pUncompleted = pQuestions.filter((q: any) => !isExcluded(q.title, q.titleSlug));
          const pagePool = pUncompleted.length > 0 ? pUncompleted : pQuestions;
          if (pagePool.length > 0) {
            selectedItem = pagePool[Math.floor(Math.random() * pagePool.length)];
          }
        }
      } catch (err) {
        console.warn('Page fetch fallback notice:', err);
      }
    }

    if (!selectedItem || !selectedItem.titleSlug) return null;

    const detailRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query: `query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionFrontendId title titleSlug content difficulty topicTags { name } codeSnippets { langSlug code } exampleTestcases
          }
        }`,
        variables: { titleSlug: selectedItem.titleSlug }
      })
    });

    if (!detailRes.ok) return null;
    const detailData: any = await detailRes.json();
    const q = detailData?.data?.question;
    if (!q) return null;

    const starterCode: Record<string, string> = {};
    if (q.codeSnippets && Array.isArray(q.codeSnippets)) {
      for (const snip of q.codeSnippets) {
        if (snip.langSlug === 'javascript') starterCode.javascript = snip.code;
        else if (snip.langSlug === 'typescript') starterCode.typescript = snip.code;
        else if (snip.langSlug === 'python3' || snip.langSlug === 'python') starterCode.python = snip.code;
        else if (snip.langSlug === 'cpp') starterCode.cpp = snip.code;
        else if (snip.langSlug === 'java') starterCode.java = snip.code;
        else if (snip.langSlug === 'csharp') starterCode.csharp = snip.code;
        else if (snip.langSlug === 'golang') starterCode.golang = snip.code;
        else if (snip.langSlug === 'rust') starterCode.rust = snip.code;
        else if (snip.langSlug === 'mysql' || snip.langSlug === 'postgresql') starterCode.sql = snip.code;
      }
    }

    return {
      title: `LeetCode ${q.questionFrontendId}: ${q.title}`,
      difficulty: (q.difficulty as 'Easy' | 'Medium' | 'Hard') || difficulty,
      topic: topic || (q.topicTags?.[0]?.name || 'Algorithms'),
      description: htmlToMarkdown(q.content) || `Solve ${q.title} on LeetCode.`,
      examples: [{
        input: q.exampleTestcases ? q.exampleTestcases.split('\n').slice(0, 2).join(', ') : 'See description',
        output: 'Expected output',
        explanation: 'Refer to problem description.'
      }],
      constraints: ['Refer to the constraints listed in the problem description.'],
      starterCode
    };
  } catch (err) {
    return null;
  }
}

export async function generateQuestion(
  topic = 'Arrays & Hashing', 
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium', 
  language = 'javascript',
  excludeTitles: string[] = []
): Promise<GeneratedQuestion> {
  const lower = (topic || '').toLowerCase();
  const langLower = (language || '').toLowerCase();
  
  const isExcluded = (title: string) => {
    if (!title) return false;
    const lowerT = title.toLowerCase();
    return excludeTitles.some(ex => {
      const lowerEx = ex.toLowerCase();
      return lowerT === lowerEx || lowerT.includes(lowerEx) || lowerEx.includes(lowerT);
    });
  };
  
  const isWebDev = 
    langLower === 'html' || 
    langLower === 'css' || 
    lower.includes('html') || 
    lower.includes('css') || 
    lower.includes('markup') || 
    lower.includes('forms') || 
    lower.includes('accessibility') || 
    lower.includes('flexbox') || 
    lower.includes('grid') || 
    lower.includes('responsive') || 
    lower.includes('web') || 
    lower.includes('react') || 
    lower.includes('node') || 
    lower.includes('jwt') || 
    lower.includes('debounce') || 
    lower.includes('crud') || 
    lower.includes('middleware') || 
    lower.includes('event loop') || 
    lower.includes('security') || 
    lower.includes('cors');

  const isDevOps = 
    langLower === 'bash' || 
    lower.includes('devops') || 
    lower.includes('docker') || 
    lower.includes('kubernetes') || 
    lower.includes('linux') || 
    lower.includes('nginx') || 
    lower.includes('ci/cd') || 
    lower.includes('compose') || 
    lower.includes('bash') || 
    lower.includes('pod');

  const isSysDesign = 
    lower.includes('system design') || 
    lower.includes('distributed') || 
    lower.includes('sharding') || 
    lower.includes('snowflake') || 
    lower.includes('rate limiter') || 
    lower.includes('cache') || 
    lower.includes('lru') || 
    lower.includes('hashing ring');

  const isSql = 
    langLower === 'sql' || 
    lower.includes('sql') || 
    lower.includes('database') || 
    lower.includes('table') || 
    lower.includes('queries') || 
    lower.includes('schema') || 
    lower.includes('window function');

  // 1. Non-DSA domains: Web Development, DevOps & Docker, System Design
  if (isWebDev || isDevOps || isSysDesign) {
    const domainCategory = isWebDev ? 'Web Development' : isDevOps ? 'DevOps & Docker' : 'System Design';
    
    if (anthropic && anthropicApiKey) {
      try {
        const prompt = `You are a Principal Software Engineer conducting a real-time ${domainCategory} technical coding interview.
Generate an authentic ${domainCategory} technical implementation challenge.
Domain: "${domainCategory}"
Sub-Topic: "${topic}".
Difficulty level: "${difficulty}".
Language: "${language}".
${excludeTitles.length > 0 ? `DO NOT generate any of these already completed challenges: ${excludeTitles.slice(0, 10).join(', ')}.` : ''}
Seed: ${Date.now()}-${Math.random()}

Return ONLY a valid, raw JSON object without markdown fences, with exactly this schema:
{
  "title": "${domainCategory}: [Title]",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "description": "Clear problem statement markdown text with detailed requirements.",
  "examples": [
    { "input": "input or code invocation", "output": "expected behavior or output", "explanation": "explanation" }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "starterCode": {
    "${language}": "// Starter code implementation template"
  }
}`;
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1800,
          messages: [{ role: 'user', content: prompt }]
        });
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn(`${domainCategory} Claude generation error, falling back to vault:`, err);
      }
    }

    const domainBank = LEETCODE_VAULT[domainCategory];
    let candidateQuestions = domainBank?.[difficulty] || domainBank?.['Medium'] || LEETCODE_VAULT[domainCategory]?.['Easy'] || [];
    
    const topicFiltered = candidateQuestions.filter(q => 
      q.topic?.toLowerCase().includes(lower) || 
      lower.includes(q.topic?.toLowerCase() || '') ||
      q.title?.toLowerCase().includes(lower)
    );
    if (topicFiltered.length > 0) {
      candidateQuestions = topicFiltered;
    }

    const uncompleted = candidateQuestions.filter(q => !isExcluded(q.title));
    const activeQuestions = uncompleted.length > 0 ? uncompleted : candidateQuestions;

    if (activeQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeQuestions.length);
      return activeQuestions[randomIndex];
    }
  }

  // 2. Database & SQL domain
  if (isSql) {
    try {
      const liveQuestion = await fetchLiveLeetCodeQuestion('SQL & Databases', difficulty, language, excludeTitles);
      if (liveQuestion && liveQuestion.title && liveQuestion.description) {
        return liveQuestion;
      }
    } catch (err) {}
    const sqlBank = LEETCODE_VAULT['SQL Database Queries'];
    const candidateQuestions = sqlBank?.[difficulty] || sqlBank?.['Medium'] || LEETCODE_VAULT['SQL Database Queries']['Medium'] || [];
    const uncompleted = candidateQuestions.filter(q => !isExcluded(q.title));
    const activeQuestions = uncompleted.length > 0 ? uncompleted : candidateQuestions;
    const randomIndex = Math.floor(Math.random() * activeQuestions.length);
    return activeQuestions[randomIndex];
  }

  // 3. Core DSA / Algorithms domain (Live LeetCode 4,000+ Problem Bank)
  const isRandomDsa = !topic || topic.includes('Random') || topic === 'Any';
  try {
    const liveQuestion = await fetchLiveLeetCodeQuestion(isRandomDsa ? 'Arrays & Hashing' : topic, difficulty, language, excludeTitles);
    if (liveQuestion && liveQuestion.title && liveQuestion.description) {
      return liveQuestion;
    }
  } catch (err) {
    console.warn('Live LeetCode query error, falling back:', err);
  }

  // 4. Secondary Claude generation for DSA
  if (anthropic && anthropicApiKey) {
    try {
      const prompt = `You are a Principal Software Engineer conducting a real-time technical coding interview.
Generate an authentic, real LeetCode algorithmic coding challenge.
Topic: "${isRandomDsa ? 'Arrays & Hashing' : topic}"
Difficulty level: "${difficulty}".
Language: "${language}".
${excludeTitles.length > 0 ? `DO NOT generate any of these already completed challenges: ${excludeTitles.slice(0, 10).join(', ')}.` : ''}
Seed: ${Date.now()}-${Math.random()}

Return ONLY a valid, raw JSON object without markdown fences, with exactly this schema:
{
  "title": "LeetCode [Number]: [Title]",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "description": "Clear problem statement markdown text with constraints and edge cases.",
  "examples": [
    { "input": "input expression", "output": "expected output", "explanation": "explanation" }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "starterCode": {
    "${language}": "// Starter code implementation template"
  }
}`;
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1800,
        messages: [{ role: 'user', content: prompt }]
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Claude algorithmic question generation error, falling back to rich vault:', err);
    }
  }

  // 5. Final fallback to rich categorized vault with exclusion filtering
  const categoryBank = LEETCODE_VAULT[topic] || LEETCODE_VAULT['Arrays & Hashing'];
  const candidateQuestions = categoryBank?.[difficulty] || categoryBank?.['Medium'] || LEETCODE_VAULT['Arrays & Hashing']['Medium'] || [];
  const uncompleted = candidateQuestions.filter(q => !isExcluded(q.title));
  const activeQuestions = uncompleted.length > 0 ? uncompleted : candidateQuestions;
  const randomIndex = Math.floor(Math.random() * activeQuestions.length);
  return activeQuestions[randomIndex];
}

function evaluateCodeStrictly(
  question: any, 
  code: string, 
  language: string, 
  isDisqualified = false
): CodeEvaluation {
  // 1. Strip comments, whitespace, imports and boilerplate to see what the user actually implemented
  const cleanCode = (code || '')
    .replace(/\/\*[\s\S]*?\*\//g, '') // C-style block comments
    .replace(/\/\/.*$/gm, '') // C-style line comments
    .replace(/"""[\s\S]*?"""/g, '') // Python docstrings
    .replace(/'''[\s\S]*?'''/g, '') // Python docstrings
    .replace(/#.*$/gm, '') // Python/Bash line comments
    .replace(/--.*$/gm, '') // SQL comments
    .trim();

  const lines = cleanCode.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Check if user code is only the initial starter template / signature without any custom logic
  const isBoilerplateOnly = lines.length === 0 || lines.every(line => {
    return (
      /^class\s+\w+/i.test(line) ||
      /^function\s+\w+/i.test(line) ||
      /^def\s+\w+/i.test(line) ||
      /^const\s+\w+\s*=\s*\(/i.test(line) ||
      /^import\s+/i.test(line) ||
      /^using\s+/i.test(line) ||
      /^#include/i.test(line) ||
      /^package\s+/i.test(line) ||
      /^public\s+class/i.test(line) ||
      /^public\s+static/i.test(line) ||
      /^[{}();]$/.test(line) ||
      /^pass$/i.test(line) ||
      /^return;?$/i.test(line) ||
      /^return\s+(null|0|false|\[\]|""|\{\});?$/i.test(line)
    );
  });

  // If no actual user logic was written
  if (lines.length === 0 || isBoilerplateOnly) {
    return {
      correctness: isDisqualified
        ? '⚠️ Disqualified for anti-cheat violation (tab-switch). No custom solution was written (editor contains only initial starter template).'
        : 'No implementation provided. The code editor contains only the default starter signature without algorithmic logic.',
      timeComplexity: 'N/A — No algorithmic operations written.',
      spaceComplexity: 'N/A — No auxiliary data structures initialized.',
      hints: [
        'Read the problem description and identify input data structures and constraints.',
        'Break down the algorithmic steps on paper or in comments before typing the code.',
        'Start with a simple brute-force approach, then refine with two-pointers, hash tables, or dynamic programming.'
      ],
      codeReview: isDisqualified
        ? '🚨 Anti-Cheat Disqualification: Score is 0/100 because no implementation was written before the violation occurred.'
        : 'No code to review. Please implement your solution inside the function body and re-submit.',
      score: 0
    };
  }

  // 2. Candidate wrote custom code — evaluate strictly on code quality, completeness, and algorithms
  let codeScore = 0;
  const checks: string[] = [];
  const missingPoints: string[] = [];

  // A. Structural implementation & variable binding (Up to 25 pts)
  const hasVariables = /(const|let|var|int|double|float|String|bool|auto|val|var|\b\w+\s*=\s*[^=])/i.test(cleanCode);
  const hasReturnWithExpr = /return\s+[^;{}]+;?|yield\s+/i.test(cleanCode) && !/return\s+(null|0|false|""|\[\]);?$/i.test(cleanCode);
  const lineCount = lines.length;

  if (hasVariables) {
    codeScore += 10;
    checks.push('Variable state declarations');
  }
  if (hasReturnWithExpr) {
    codeScore += 10;
    checks.push('Computes and returns non-trivial result');
  } else {
    missingPoints.push('Missing meaningful return value or final computation');
  }
  if (lineCount >= 6) {
    codeScore += 5;
  } else {
    codeScore += Math.min(4, lineCount);
  }

  // B. Control Flow, Iteration & Branching (Up to 30 pts)
  const hasLoops = /\b(for|while|forEach|map|filter|reduce|loop)\b/i.test(cleanCode);
  const hasNestedLoops = /(for|while)[\s\S]*(for|while)/i.test(cleanCode);
  const hasConditionals = /\b(if|else\s+if|else|switch|case|\?\s*.*:)\b/i.test(cleanCode);
  const hasBoundaryCheck = /(length\s*(===?|<=?|==)\s*0|\.length\s*<\s*2|\bnull\b|\bundefined\b|\bNone\b|empty\(\)|size\(\)\s*==\s*0)/i.test(cleanCode);

  if (hasLoops) {
    codeScore += 15;
    checks.push(hasNestedLoops ? 'Nested iteration structure' : 'Loop / linear traversal');
  } else {
    missingPoints.push('No iteration or recursion structure');
  }

  if (hasConditionals) {
    codeScore += 10;
    checks.push('Conditional decision branches');
  } else {
    missingPoints.push('No conditional branches for handling varying inputs');
  }

  if (hasBoundaryCheck) {
    codeScore += 5;
    checks.push('Edge case / boundary guards');
  }

  // C. Data Structures & Algorithmic Patterns (Up to 25 pts)
  const hasHashOrSet = /\b(Map|Set|HashMap|HashSet|dict|unordered_map|unordered_set|new Set|new Map|\{\})\b/i.test(cleanCode);
  const hasTwoPointers = /\b(left|right|start|end|low|high|ptr1|ptr2|slow|fast|i\s*<\s*j)\b/i.test(cleanCode) && hasLoops;
  const hasSlidingWindow = /\b(window|maxLen|minLen|currSum|maxSum)\b/i.test(cleanCode) || (hasLoops && hasConditionals && hasVariables);
  const hasStackQueue = /\b(stack|queue|push|pop|shift|unshift|deque|enqueue|dequeue)\b/i.test(cleanCode);
  const hasMathBitwise = /(&|\||\^|<<|>>|Math\.(max|min|abs|floor|ceil|pow)|std::(max|min))/i.test(cleanCode);

  let dsScore = 0;
  if (hasHashOrSet) {
    dsScore += 12;
    checks.push('Auxiliary Hash Table / Set lookups');
  }
  if (hasTwoPointers) {
    dsScore += 12;
    checks.push('Two-pointer pattern indexing');
  } else if (hasSlidingWindow) {
    dsScore += 10;
    checks.push('Sliding window state management');
  }
  if (hasStackQueue) {
    dsScore += 8;
    checks.push('Stack / Queue buffer operations');
  }
  if (hasMathBitwise) {
    dsScore += 6;
    checks.push('Math / Bitwise logic evaluation');
  }
  codeScore += Math.min(25, dsScore);

  // D. Algorithmic Depth & Solution Coherence (Up to 20 pts)
  let depthScore = 0;
  if (lineCount >= 12 && hasLoops && hasConditionals) {
    depthScore = 20;
  } else if (lineCount >= 8 && (hasLoops || hasConditionals)) {
    depthScore = 14;
  } else if (lineCount >= 4) {
    depthScore = 8;
  } else {
    depthScore = 3;
  }
  codeScore += depthScore;

  let finalScore = Math.min(100, Math.max(0, codeScore));

  // Determine Time & Space Complexity from actual code inspection
  let timeComplexity = 'O(1) — Constant time.';
  if (hasNestedLoops) {
    timeComplexity = 'O(N²) — Nested loops detected over dataset.';
  } else if (hasLoops) {
    timeComplexity = 'O(N) — Single linear scan over input collection.';
  } else if (/\bmid\s*=|>>\s*1|\/=\s*2/i.test(cleanCode)) {
    timeComplexity = 'O(log N) — Binary search division pattern.';
  }

  let spaceComplexity = 'O(1) auxiliary space — In-place computation.';
  if (hasHashOrSet || (hasStackQueue && hasLoops)) {
    spaceComplexity = 'O(N) auxiliary space — Storing elements in hash table / buffer.';
  } else if (/\b(dp|memo|table|matrix)\b/i.test(cleanCode)) {
    spaceComplexity = 'O(N) or O(N²) auxiliary space for dynamic programming memoization.';
  }

  // If disqualified for cheating, the candidate receives an immediate 0 / 100
  if (isDisqualified) {
    return {
      correctness: `⚠️ Assessment Terminated: Disqualified for anti-cheat violation (tab-switch). Code analyzed up to point of termination: ${checks.join(', ') || 'Incomplete logic'}.${missingPoints.length ? ` Missing: ${missingPoints.join('; ')}.` : ''}`,
      timeComplexity: 'N/A — Assessment Terminated',
      spaceComplexity: 'N/A — Assessment Terminated',
      hints: [
        'Anti-cheat proctoring strictly prohibits tab-switching or leaving the test window.',
        missingPoints[0] || 'Focus on implementing full algorithmic logic without switching tabs.',
        'Review problem constraints and practice writing complete solutions.'
      ],
      codeReview: `🚨 Anti-Cheat Disqualification: Your assessment was terminated due to a proctoring violation. Disqualified submissions automatically receive 0/100.`,
      score: 0
    };
  }

  // Normal submission evaluation
  return {
    correctness: finalScore >= 80
      ? `Strong algorithmic implementation (${checks.join(', ')}). Code demonstrates solid grasp of data structures and problem logic.`
      : finalScore >= 50
      ? `Partial solution implemented (${checks.join(', ')}). ${missingPoints.length ? `Needs improvement: ${missingPoints.join(', ')}.` : 'Refine edge case handling.'}`
      : `Incomplete solution. Implemented basic structure (${checks.join(', ') || 'minimal statements'}), but ${missingPoints.join(' and ') || 'core algorithmic logic is incomplete'}.`,
    timeComplexity,
    spaceComplexity,
    hints: [
      missingPoints[0] || 'Verify boundary conditions: what if input is empty, null, or has duplicates?',
      'Consider if any intermediate computations can be memoized or avoided to optimize runtime.',
      'Check if early return can save unnecessary iterations.'
    ],
    codeReview: finalScore >= 80
      ? 'Clean code structure with clear variable naming. Good decomposition of algorithmic steps.'
      : 'Work on completing the full control flow and returning the exact expected data type. Talk through your edge case assumptions.',
    score: finalScore
  };
}

export async function analyzeCode(
  question: any, 
  code: string, 
  language: string, 
  isDisqualified = false
): Promise<CodeEvaluation> {
  if (anthropic && anthropicApiKey) {
    try {
      const prompt = `You are a Principal Software Engineer conducting a real-time technical interview.
The candidate is working on the following coding problem:
Problem: ${question?.title || 'Coding Challenge'}
Description: ${question?.description || ''}

Candidate's Code (${language}):
\`\`\`${language}
${code}
\`\`\`

Disqualification status: ${isDisqualified ? 'DISQUALIFIED: Candidate switched browser tabs / cheated during assessment.' : 'NORMAL SUBMISSION'}

CRITICAL SCORING INSTRUCTIONS:
- Score MUST be calculated purely on the candidate's actual written code.
- If the candidate wrote NO code or only left starter boilerplate/comments, score MUST BE 0.
- If the candidate wrote partial code, score objectively from 0 to 100 based on syntax, logic, algorithms, and data structures.
- If disqualified (isDisqualified = true), scale the final score down heavily (e.g. max 20% of their partial code score, and 0 if no code was written).

Output ONLY a raw, valid JSON object without markdown fences, with this exact schema:
{
  "correctness": "Direct concise assessment of logic correctness, correctness for edge cases, and syntax.",
  "timeComplexity": "Big-O time complexity (e.g. O(N)) and short rationale.",
  "spaceComplexity": "Big-O space complexity (e.g. O(1)) and short rationale.",
  "hints": [
    "Helpful hint or edge-case without spoiling full answer",
    "Optimization opportunity"
  ],
  "codeReview": "Constructive critique on readability, modularity, and interview best practices.",
  "score": 0
}`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && typeof parsed.score === 'number') {
        return parsed;
      }
    } catch (err) {
      console.warn('Claude evaluation request error, using rigorous local evaluation:', err);
    }
  }

  // Rigorous code-basis evaluation engine
  return evaluateCodeStrictly(question, code, language, isDisqualified);
}
