// Discussion Forum Data - Forum posts and discussions

export const discussionPosts = [
  {
    id: 201,
    title: "How to approach complex integration problems?",
    author: "Student 1",
    description: "I'm struggling with trigonometric substitution in integration. Can someone explain the intuition behind choosing the right substitution?",
    attachments: 1,
    tags: ["Calculus", "Integration", "Math"],
    likes: 332,
    comments: 44,
    views: 1277,
    replies: 156,
    createdAt: "2024-02-10",
    lastActivity: "2 hours ago",
    isResolved: false,
    isPinned: false
  },
  {
    id: 202,
    title: "Best resources for learning Data Structures?",
    author: "Student 5",
    description: "I'm looking for comprehensive resources to master data structures. What books, courses, or YouTube channels would you recommend for beginners?",
    attachments: 0,
    tags: ["DataStructures", "Programming", "Learning"],
    likes: 245,
    comments: 67,
    views: 892,
    replies: 203,
    createdAt: "2024-02-09",
    lastActivity: "5 hours ago",
    isResolved: true,
    isPinned: true
  },
  {
    id: 203,
    title: "Confused about Quantum Mechanics interpretations",
    author: "Student 8",
    description: "Can someone explain the difference between Copenhagen interpretation and Many-Worlds interpretation? Which one is more widely accepted in modern physics?",
    attachments: 2,
    tags: ["Physics", "Quantum", "Theory"],
    likes: 178,
    comments: 52,
    views: 634,
    replies: 89,
    createdAt: "2024-02-08",
    lastActivity: "1 day ago",
    isResolved: false,
    isPinned: false
  },
  {
    id: 204,
    title: "Study group for Machine Learning final exam",
    author: "Student 12",
    description: "Looking to form a study group for the upcoming ML final. We can meet twice a week to review concepts, solve problems, and discuss past exams. DM if interested!",
    attachments: 0,
    tags: ["ML", "StudyGroup", "Exam"],
    likes: 156,
    comments: 38,
    views: 445,
    replies: 124,
    createdAt: "2024-02-07",
    lastActivity: "3 hours ago",
    isResolved: false,
    isPinned: false
  },
  {
    id: 205,
    title: "Tips for writing better research papers?",
    author: "Student 15",
    description: "I'm working on my first research paper and feeling overwhelmed. What are some tips for structuring arguments, citing sources properly, and making the writing more academic?",
    attachments: 1,
    tags: ["Writing", "Research", "Academic"],
    likes: 289,
    comments: 71,
    views: 1023,
    replies: 178,
    createdAt: "2024-02-06",
    lastActivity: "6 hours ago",
    isResolved: true,
    isPinned: true
  },
  {
    id: 206,
    title: "Error in my React component - useEffect infinite loop",
    author: "Student 20",
    description: "My useEffect hook keeps triggering infinitely. I've tried adding dependencies but it's still not working. Here's my code snippet - can anyone spot the issue?",
    attachments: 1,
    tags: ["React", "JavaScript", "Programming"],
    likes: 92,
    comments: 29,
    views: 356,
    replies: 67,
    createdAt: "2024-02-05",
    lastActivity: "4 hours ago",
    isResolved: true,
    isPinned: false
  },
  {
    id: 207,
    title: "Organic Chemistry nomenclature help needed",
    author: "Student 23",
    description: "I keep getting confused with IUPAC naming conventions for complex organic molecules. Does anyone have a good mnemonic or systematic approach they use?",
    attachments: 2,
    tags: ["Chemistry", "Organic", "Nomenclature"],
    likes: 134,
    comments: 41,
    views: 567,
    replies: 95,
    createdAt: "2024-02-04",
    lastActivity: "1 day ago",
    isResolved: false,
    isPinned: false
  },
  {
    id: 208,
    title: "Debate: Is learning multiple programming languages necessary?",
    author: "Student 27",
    description: "Some say master one language, others say learn multiple. What's your take? Does knowing Python, JavaScript, and Java make you a better programmer or just spread you thin?",
    attachments: 0,
    tags: ["Programming", "Career", "Discussion"],
    likes: 421,
    comments: 103,
    views: 1834,
    replies: 312,
    createdAt: "2024-02-03",
    lastActivity: "2 hours ago",
    isResolved: false,
    isPinned: true
  },
  {
    id: 209,
    title: "Linear Algebra applications in real world?",
    author: "Student 30",
    description: "Struggling to see the practical applications of linear algebra beyond the textbook. Can anyone share real-world examples of where this is actually used in industry or research?",
    attachments: 0,
    tags: ["Math", "LinearAlgebra", "Applications"],
    likes: 267,
    comments: 58,
    views: 789,
    replies: 145,
    createdAt: "2024-02-02",
    lastActivity: "8 hours ago",
    isResolved: true,
    isPinned: false
  },
  {
    id: 210,
    title: "Best way to prepare for technical interviews?",
    author: "Student 35",
    description: "I have a technical interview coming up at a big tech company. What platforms do you use for practice? LeetCode, HackerRank, or something else? Any specific topics I should focus on?",
    attachments: 1,
    tags: ["Interview", "Career", "Programming"],
    likes: 543,
    comments: 127,
    views: 2145,
    replies: 389,
    createdAt: "2024-02-01",
    lastActivity: "1 hour ago",
    isResolved: false,
    isPinned: true
  },
  {
    id: 211,
    title: "Philosophy essay - Is free will an illusion?",
    author: "Student 38",
    description: "Writing an essay on determinism vs free will. Looking for perspectives and good philosophical arguments from both sides. What are your thoughts?",
    attachments: 0,
    tags: ["Philosophy", "Essay", "Ethics"],
    likes: 189,
    comments: 76,
    views: 612,
    replies: 234,
    createdAt: "2024-01-31",
    lastActivity: "5 hours ago",
    isResolved: false,
    isPinned: false
  },
  {
    id: 212,
    title: "Time management tips for balancing work and study?",
    author: "Student 42",
    description: "Working part-time while taking 5 classes. Any productivity hacks or time management strategies that actually work? Feeling burnt out lately.",
    attachments: 0,
    tags: ["Productivity", "Study", "WorkLife"],
    likes: 412,
    comments: 94,
    views: 1456,
    replies: 278,
    createdAt: "2024-01-30",
    lastActivity: "3 hours ago",
    isResolved: true,
    isPinned: false
  }
];

// Helper function to get pinned posts
export const getPinnedPosts = () => {
  return discussionPosts.filter(post => post.isPinned);
};

// Helper function to get resolved posts
export const getResolvedPosts = () => {
  return discussionPosts.filter(post => post.isResolved);
};

// Helper function to get posts by tag
export const getPostsByTag = (tag) => {
  return discussionPosts.filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

// Helper function to sort posts by activity
export const getRecentPosts = () => {
  return [...discussionPosts].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
};

// Helper function to sort posts by popularity
export const getPopularPosts = () => {
  return [...discussionPosts].sort((a, b) => b.likes - a.likes);
};

export default discussionPosts;