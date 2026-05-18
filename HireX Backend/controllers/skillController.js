const User = require('../models/User');
const Progress = require('../models/Progress');

// Built-in coding challenges pool
const codingProblems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    hint: 'Use a hash map to store complements.',
    solution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}'
  },
  {
    id: 2,
    title: 'Reverse a String',
    difficulty: 'Easy',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    examples: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
    hint: 'Use two pointers, one at the start and one at the end.',
    solution: 'function reverseString(s) {\n  let left = 0, right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++; right--;\n  }\n  return s;\n}'
  },
  {
    id: 3,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nA string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.',
    examples: 'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
    hint: 'Use a stack data structure.',
    solution: 'function isValid(s) {\n  const stack = [];\n  const map = { "(": ")", "{": "}", "[": "]" };\n  for (const c of s) {\n    if (map[c]) stack.push(map[c]);\n    else if (stack.pop() !== c) return false;\n  }\n  return stack.length === 0;\n}'
  },
  {
    id: 4,
    title: 'FizzBuzz',
    difficulty: 'Easy',
    description: 'Given an integer n, return a string array answer where:\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above.',
    examples: 'Input: n = 5\nOutput: ["1","2","Fizz","4","Buzz"]',
    hint: 'Use modulo operator to check divisibility.',
    solution: 'function fizzBuzz(n) {\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) result.push("FizzBuzz");\n    else if (i % 3 === 0) result.push("Fizz");\n    else if (i % 5 === 0) result.push("Buzz");\n    else result.push(String(i));\n  }\n  return result;\n}'
  },
  {
    id: 5,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: 'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.',
    hint: 'Use Kadane\'s algorithm.',
    solution: 'function maxSubArray(nums) {\n  let maxSum = nums[0], currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}'
  },
  {
    id: 6,
    title: 'Palindrome Check',
    difficulty: 'Easy',
    description: 'Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    examples: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true',
    hint: 'Clean the string first, then use two pointers.',
    solution: 'function isPalindrome(s) {\n  const clean = s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();\n  let l = 0, r = clean.length - 1;\n  while (l < r) {\n    if (clean[l] !== clean[r]) return false;\n    l++; r--;\n  }\n  return true;\n}'
  },
  {
    id: 7,
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    description: 'You are given two sorted arrays. Merge them into one sorted array.',
    examples: 'Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]',
    hint: 'Use two pointers, one for each array.',
    solution: 'function mergeLists(l1, l2) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < l1.length && j < l2.length) {\n    if (l1[i] <= l2[j]) result.push(l1[i++]);\n    else result.push(l2[j++]);\n  }\n  return result.concat(l1.slice(i)).concat(l2.slice(j));\n}'
  }
];

exports.getDailyProblem = async (req, res) => {
  try {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const problem = codingProblems[dayOfYear % codingProblems.length];
    res.json({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
      examples: problem.examples,
      hint: problem.hint
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching problem.' });
  }
};

exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code } = req.body;
    const problem = codingProblems.find(p => p.id === problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found.' });

    // Simple scoring: give credit for submission
    const score = code && code.trim().length > 10 ? 80 : 40;

    const user = await User.findById(req.userId);
    user.codingScore = Math.round((user.codingScore + score) / 2);
    user.dailyCodingDone = true;
    await user.save();

    await Progress.create({
      userId: req.userId,
      codingScore: score,
      codingCompleted: true,
      weekNumber: getWeekNumber()
    });

    res.json({
      score,
      solution: problem.solution,
      message: score >= 80 ? 'Great job! Your solution looks good.' : 'Good attempt! Review the solution below.'
    });
  } catch (err) {
    console.error('Submit solution error:', err);
    res.status(500).json({ message: 'Error submitting solution.' });
  }
};

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
}
