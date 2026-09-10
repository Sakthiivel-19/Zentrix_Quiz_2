export const QUESTION_PROMPTS: Record<string, { prompt: string; detail?: string }> = {
  q1: {
    prompt: 'The code below is scrambled into 9 pieces. What is the correct sequence of code pieces to assemble a valid, working Python program?',
    detail: 'Drag or click the code pieces into slots 1 through 9 in the interactive board below.',
  },
  q2: {
    prompt: 'Fill in lines 5–7 using function pointers to make the program print: Result: 15',
    detail: 'Review the C program logic and select the syntactically and logically correct pointer implementation.',
  },
  q3: {
    prompt: 'Which relationship has a many-to-many cardinality, and what is the primary key of ENROLLMENT?',
    detail: 'Analyze the given Entity-Relationship (ER) diagram schemas, entities, and attributes.',
  },
  q4: {
    prompt: 'Which password is MOST likely to be valid under all known security specifications and attacker logs?',
    detail: 'Evaluate the security policy rules and eliminate candidates that violate password requirements.',
  },
  q5: {
    prompt: 'What is the exact console output of this Java program?',
    detail: 'Trace the Java string creation, string pool interning, and reference equality comparison.',
  },
  q6: {
    prompt: 'Starting from node A: Which option correctly shows the exact order of edges added to form the MST, along with the total minimum weight?',
    detail: 'Execute Prim’s algorithm edge by edge from source node A to compute the minimum spanning tree.',
  },
  q7: {
    prompt: 'The code pieces define prime checking, string reversal, and execution. What is the correct sequence of code pieces to assemble the program?',
    detail: 'Drag or click the code pieces into slots 1 through 9 in the interactive board below.',
  },
  q8: {
    prompt: 'Starting from START and ending at T in the multistage graph, what is the minimum-cost path?',
    detail: 'Trace edge weights across the consecutive stages from START to destination node T.',
  },
  q9: {
    prompt: 'Given the encoded bitstream (0100 0011 0001 0101 0010 0110), what is the original decoded text message?',
    detail: 'Map each 4-bit binary group to its corresponding character in the encoding table.',
  },
  q10: {
    prompt: 'Execute the given stack operations in sequential order. Which element is directly above 4 at the end?',
    detail: 'Track stack state after executing all 7 sequential push and pop operations.',
  },
};
