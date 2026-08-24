import type { LanguageConfig, SupportedLanguage } from '../types';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    monacoLanguage: 'javascript',
    judge0Id: 63,
    icon: '⚡',
    defaultCode: `// Problem: Two Sum
// Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test case
const nums = [2, 7, 11, 15];
const target = 9;
console.log("Result:", twoSum(nums, target)); // Expected: [0, 1]
`
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    monacoLanguage: 'typescript',
    judge0Id: 74,
    icon: '🔷',
    defaultCode: `// Problem: Valid Palindrome
// Given a string s, return true if it is a palindrome, or false otherwise.

function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

// Test cases
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // false
`
  },
  python: {
    id: 'python',
    name: 'Python 3',
    monacoLanguage: 'python',
    judge0Id: 71,
    icon: '🐍',
    defaultCode: `# Problem: Best Time to Buy and Sell Stock
# You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

def maxProfit(prices: list[int]) -> int:
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit

# Test case
prices = [7, 1, 5, 3, 6, 4]
print(f"Max Profit: {maxProfit(prices)}") # Expected: 5
`
  },
  cpp: {
    id: 'cpp',
    name: 'C++ (GCC 9.2)',
    monacoLanguage: 'cpp',
    judge0Id: 54,
    icon: '⚙️',
    defaultCode: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "Result: [" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`
  },
  java: {
    id: 'java',
    name: 'Java (OpenJDK 13)',
    monacoLanguage: 'java',
    judge0Id: 62,
    icon: '☕',
    defaultCode: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] res = twoSum(nums, target);
        System.out.println("Result: [" + res[0] + ", " + res[1] + "]");
    }
}
`
  },
  go: {
    id: 'go',
    name: 'Go (1.13)',
    monacoLanguage: 'go',
    judge0Id: 60,
    icon: '🐹',
    defaultCode: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if idx, ok := seen[complement]; ok {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return nil
}

func main() {
    nums := []int{2, 7, 11, 15}
    target := 9
    result := twoSum(nums, target)
    fmt.Printf("Result: %v\n", result)
}
`
  },
  rust: {
    id: 'rust',
    name: 'Rust (1.40)',
    monacoLanguage: 'rust',
    judge0Id: 73,
    icon: '🦀',
    defaultCode: `use std::collections::HashMap;

fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut map = HashMap::new();
    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        if let Some(&prev_index) = map.get(&complement) {
            return vec![prev_index as i32, i as i32];
        }
        map.insert(num, i);
    }
    vec![]
}

fn main() {
    let nums = vec![2, 7, 11, 15];
    let target = 9;
    let result = two_sum(nums, target);
    println!("Result: {:?}", result);
}
`
  },
  csharp: {
    id: 'csharp',
    name: 'C# (Mono 6.6)',
    monacoLanguage: 'csharp',
    judge0Id: 51,
    icon: '🟣',
    defaultCode: `using System;
using System.Collections.Generic;

public class Program {
    public static int[] TwoSum(int[] nums, int target) {
        Dictionary<int, int> map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int complement = target - nums[i];
            if (map.ContainsKey(complement)) {
                return new int[] { map[complement], i };
            }
            map[nums[i]] = i;
        }
        return new int[0];
    }

    public static void Main() {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] res = TwoSum(nums, target);
        Console.WriteLine($"Result: [{res[0]}, {res[1]}]");
    }
}
`
  }
};

export const USER_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}
