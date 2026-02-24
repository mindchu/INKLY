// Other Users' Notes Data - Notes from other students for home, bookmarks, etc.

export const otherNotes = [
  {
    id: 101,
    title: "Calculus II - Integration techniques",
    author: "Student 1",
    description: "Comprehensive notes covering integration by parts, trigonometric substitution, partial fractions, and improper integrals. Includes worked examples for each technique with detailed step-by-step solutions. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly.",
    attachments: 1,
    tags: ["Calculus", "Integration", "Math"],
    likes: 133,
    comments: 55,
    views: 334,
    createdAt: "2024-01-10",
    isOwn: false,
    isBookmarked: false
  },
  {
    id: 102,
    title: "Data Structures : Tree and graph",
    author: "Student 3",
    description: "Implementation guide for binary trees, BST, AVL trees, and graph traversal algorithms. Includes pseudocode and complexity analysis for each data structure. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Contains practical coding examples in multiple programming languages.",
    attachments: 1,
    tags: ["Algorithm", "Datastructure"],
    likes: 24,
    comments: 2,
    views: 321,
    createdAt: "2024-01-12",
    isOwn: false,
    isBookmarked: false
  },
  {
    id: 103,
    title: "World History : Industrial Revolution",
    author: "Student 4",
    description: "Timeline and key events of the Industrial Revolution across Europe and America. Social, economic, and technological impacts are thoroughly examined. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Covers major inventions, factory systems, and labor movements.",
    attachments: 1,
    tags: ["History", "Revolution", "Society"],
    likes: 87,
    comments: 15,
    views: 542,
    createdAt: "2024-01-18",
    isOwn: false,
    isBookmarked: true
  },
  {
    id: 104,
    title: "Microeconomics : Supply and Demand",
    author: "Student 5",
    description: "Market equilibrium analysis, elasticity concepts, consumer and producer surplus with real-world examples and graphs. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Features case studies from actual markets and price determination analysis.",
    attachments: 2,
    tags: ["Economics", "Markets", "Theory"],
    likes: 112,
    comments: 28,
    views: 671,
    createdAt: "2024-01-22",
    isOwn: false,
    isBookmarked: false
  },
  {
    id: 105,
    title: "Python Programming : OOP Concepts",
    author: "Student 6",
    description: "Object-oriented programming in Python covering classes, inheritance, polymorphism, encapsulation with code examples. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Multiple practical projects demonstrating OOP principles in real applications.",
    attachments: 1,
    tags: ["Python", "Programming", "OOP"],
    likes: 198,
    comments: 42,
    views: 923,
    createdAt: "2024-01-25",
    isOwn: false,
    isBookmarked: true
  },
  {
    id: 106,
    title: "Statistics : Hypothesis Testing",
    author: "Student 7",
    description: "Complete guide to null hypothesis, p-values, t-tests, chi-square tests with step-by-step procedures and interpretation. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Covers type I and type II errors with real research examples.",
    attachments: 2,
    tags: ["Statistics", "Math", "DataScience"],
    likes: 145,
    comments: 33,
    views: 789,
    createdAt: "2024-01-28",
    isOwn: false,
    isBookmarked: false
  },
  {
    id: 107,
    title: "Constitutional Law : First Amendment",
    author: "Student 8",
    description: "Analysis of free speech, religion, press, and assembly rights. Landmark Supreme Court cases and modern applications are discussed in detail. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Includes recent judicial interpretations and contemporary controversies.",
    attachments: 1,
    tags: ["Law", "Constitution", "Rights"],
    likes: 76,
    comments: 18,
    views: 445,
    createdAt: "2024-02-02",
    isOwn: false,
    isBookmarked: true
  },
  {
    id: 108,
    title: "Anatomy : Cardiovascular System",
    author: "Student 9",
    description: "Detailed notes on heart structure, blood vessels, circulation pathways, and cardiac cycle with labeled diagrams. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Features anatomical illustrations and physiological mechanisms of blood flow.",
    attachments: 1,
    tags: ["Anatomy", "Medicine", "Biology"],
    likes: 167,
    comments: 24,
    views: 834,
    createdAt: "2024-02-04",
    isOwn: false,
    isBookmarked: false
  },
  {
    id: 109,
    title: "Machine Learning : Neural Networks",
    author: "Student 10",
    description: "Introduction to artificial neural networks, backpropagation, activation functions, and deep learning architectures. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Contains implementation examples using TensorFlow and PyTorch frameworks.",
    attachments: 1,
    tags: ["ML", "AI", "DeepLearning"],
    likes: 234,
    comments: 51,
    views: 1245,
    createdAt: "2024-02-06",
    isOwn: false,
    isBookmarked: true
  },
  {
    id: 110,
    title: "Spanish Grammar : Subjunctive Mood",
    author: "Student 11",
    description: "Rules and usage of the subjunctive mood in Spanish with present, past, and future forms. Practice exercises included for all conjugation patterns. This comprehensive guide includes detailed explanations, comparative analysis, and visual aids to help you understand the concepts thoroughly. Features common phrases and idiomatic expressions using subjunctive.",
    attachments: 1,
    tags: ["Spanish", "Language", "Grammar"],
    likes: 91,
    comments: 12,
    views: 528,
    createdAt: "2024-02-09",
    isOwn: false,
    isBookmarked: false
  }
];

// Helper function to get bookmarked notes
export const getBookmarkedNotes = () => {
  return otherNotes.filter(note => note.isBookmarked);
};

// Helper function to get notes by tag
export const getNotesByTag = (tag) => {
  return otherNotes.filter(note => 
    note.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

// Helper function to sort notes by popularity
export const getPopularNotes = () => {
  return [...otherNotes].sort((a, b) => b.likes - a.likes);
};

export default otherNotes;