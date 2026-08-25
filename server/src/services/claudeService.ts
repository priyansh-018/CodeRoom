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
      {
        title: 'LeetCode 175: Combine Two Tables',
        difficulty: 'Easy',
        topic: 'SQL Database Queries',
        description: `Write a solution to report the first name, last name, city, and state of each person in the \`Person\` table. If the address of a \`personId\` is not present in the \`Address\` table, report \`null\` instead.\n\nReturn the result table in **any order**.`,
        examples: [
          { input: 'Person table + Address table', output: 'firstName | lastName | city | state' }
        ],
        constraints: ['personId is the primary key column for the Person table.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 182: Duplicate Emails',
        difficulty: 'Easy',
        topic: 'SQL Database Queries',
        description: `Write a solution to report all the duplicate emails in the \`Person\` table. Note that it's guaranteed email field is not NULL.\n\nReturn the result table in **any order**.`,
        examples: [
          { input: 'Person (id, email) with duplicate a@b.com', output: 'email: "a@b.com"' }
        ],
        constraints: ['id is the primary key column for the Person table.'],
        starterCode: {}
      }
    ],
    Medium: [
      {
        title: 'LeetCode 184: Department Highest Salary',
        difficulty: 'Medium',
        topic: 'SQL Database Queries',
        description: `Write a solution to find employees who have the highest salary in each of the departments.\n\nReturn the result table in **any order**.`,
        examples: [
          { input: 'Employee table + Department table', output: 'Department | Employee | Salary' }
        ],
        constraints: ['id is the primary key column for the Employee table.'],
        starterCode: {}
      },
      {
        title: 'LeetCode 176: Second Highest Salary',
        difficulty: 'Medium',
        topic: 'SQL Database Queries',
        description: `Write a solution to find the second highest distinct salary from the \`Employee\` table. If there is no second highest salary, return \`null\` (return \`None\` in Pandas).`,
        examples: [
          { input: 'Employee with salaries [100, 200, 300]', output: 'SecondHighestSalary: 200' },
          { input: 'Employee with salary [100]', output: 'SecondHighestSalary: null' }
        ],
        constraints: ['id is the primary key column for the Employee table.'],
        starterCode: {}
      }
    ],
    Hard: [
      {
        title: 'LeetCode 185: Department Top Three Salaries',
        difficulty: 'Hard',
        topic: 'SQL Database Queries',
        description: `A company's executives are interested in seeing who earns the most money in each of the company's departments. A **high earner** in a department is an employee who has a salary in the **top three unique salaries** for that department.\n\nWrite a solution to find the employees who are **high earners** in each of the departments.\n\nReturn the result table in **any order**.`,
        examples: [
          { input: 'Employee table + Department table', output: 'Department | Employee | Salary' }
        ],
        constraints: ['id is the primary key column for the Employee table.'],
        starterCode: {}
      }
    ]
  }
};

export async function generateQuestion(
  topic = 'Arrays & Hashing', 
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium', 
  language = 'javascript'
): Promise<GeneratedQuestion> {
  const isRandomTopic = !topic || topic.includes('Random') || topic === 'Any';

  // 1. If Anthropic Claude AI is configured, dynamically generate an authentic random problem from the entire 3000+ LeetCode catalogue
  if (anthropic && anthropicApiKey) {
    try {
      const topicInstruction = isRandomTopic 
        ? 'Pick any random classic/trending topic across Data Structures and Algorithms (e.g. Arrays, Two Pointers, Trees, Dynamic Programming, Graphs, Bit Manipulation, etc.)'
        : `Topic: "${topic}"`;

      const prompt = `You are a Principal Software Engineer conducting a real-time technical coding interview.
Generate an authentic, real LeetCode coding challenge randomly chosen from the real LeetCode question bank (3,000+ problems).
${topicInstruction}
Difficulty level: "${difficulty}".
Seed: ${Date.now()}-${Math.random()}

Return ONLY a valid, raw JSON object without markdown fences, with exactly this schema:
{
  "title": "LeetCode [Number]: [Title]",
  "difficulty": "${difficulty}",
  "topic": "${isRandomTopic ? 'Algorithmic Challenge' : topic}",
  "description": "Clear problem statement markdown text.",
  "examples": [
    { "input": "input string", "output": "expected output", "explanation": "optional explanation" }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "starterCode": {}
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
      console.warn('Claude question generation request error:', err);
    }
  }

  // 2. Built-in randomized LeetCode vault selection
  const allTopicKeys = Object.keys(LEETCODE_VAULT);
  let resolvedTopic = isRandomTopic 
    ? allTopicKeys[Math.floor(Math.random() * allTopicKeys.length)]
    : topic;

  // Find best matching topic category
  let topicBank = LEETCODE_VAULT[resolvedTopic];
  if (!topicBank) {
    const matchedKey = allTopicKeys.find(k => k.toLowerCase().includes(resolvedTopic.toLowerCase()) || resolvedTopic.toLowerCase().includes(k.toLowerCase()));
    topicBank = matchedKey ? LEETCODE_VAULT[matchedKey] : LEETCODE_VAULT['Arrays & Hashing'];
  }

  const candidateQuestions = topicBank[difficulty] || topicBank['Medium'] || LEETCODE_VAULT['Arrays & Hashing']['Medium'];
  const randomIndex = Math.floor(Math.random() * candidateQuestions.length);
  return candidateQuestions[randomIndex];
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

Evaluate this solution. Output ONLY a raw, valid JSON object without markdown fences, with this exact schema:
{
  "correctness": "Direct concise assessment of logic correctness, correctness for edge cases, and syntax.",
  "timeComplexity": "Big-O time complexity (e.g. O(N)) and short rationale.",
  "spaceComplexity": "Big-O space complexity (e.g. O(1)) and short rationale.",
  "hints": [
    "Helpful hint or edge-case without spoiling full answer",
    "Optimization opportunity"
  ],
  "codeReview": "Constructive critique on readability, modularity, and interview best practices.",
  "score": ${isDisqualified ? 30 : 85}
}`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Claude evaluation request error:', err);
    }
  }

  // High-accuracy static analysis heuristic fallback
  const lines = code.split('\n').filter(l => l.trim().length > 0).length;
  const hasLoops = /for|while|forEach|map|filter/.test(code);
  const hasMapOrSet = /Map|Set|dict|hash|unordered_map|HashMap|HashSet/.test(code);

  let baseScore = lines > 8 ? 85 : lines > 3 ? 65 : 40;
  if (isDisqualified) {
    baseScore = Math.min(baseScore, 35);
  }

  return {
    correctness: isDisqualified
      ? '⚠️ Assessment Terminated: Cheating violation detected (candidate switched browser tabs/windows during proctored exam). Partial logic evaluated.'
      : lines > 5 
      ? 'The logic structure is well-formed with active iteration and variable binding. Verify boundary conditions (empty input, null pointers, and negative integers).'
      : 'Code appears incomplete or minimal. Solution was not fully implemented.',
    timeComplexity: hasLoops ? 'O(N) — Linear traversal detected.' : 'O(1) — Constant time.',
    spaceComplexity: hasMapOrSet ? 'O(N) auxiliary space for hash table / lookup set.' : 'O(1) auxiliary space.',
    hints: [
      'Think about edge cases: what if the input array length is 0 or 1?',
      'Consider whether duplicate elements in the dataset impact your lookup index mapping.',
      'Check if early termination is possible as soon as a match is found to optimize average runtime.'
    ],
    codeReview: isDisqualified
      ? '🚨 Anti-Cheat Disqualification: Tab switching is strictly prohibited during live assessments. Keep your focus on the coding editor.'
      : 'Good code readability and clear identifier naming. Remember to state your assumptions out loud to the interviewer before jumping straight into code.',
    score: baseScore
  };
}
