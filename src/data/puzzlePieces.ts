export interface PuzzlePiece {
  id: string; // e.g. '1', '2', ...
  number: number;
  label: string;
  code: string;
}

export interface PuzzleQuestionData {
  questionId: string;
  totalPieces: number;
  description: string;
  pieces: PuzzlePiece[];
}

export const PUZZLE_QUESTIONS: Record<string, PuzzleQuestionData> = {
  q1: {
    questionId: 'q1',
    totalPieces: 9,
    description: 'Drag and arrange the 9 code pieces into the sequential slots to assemble the Python program.',
    pieces: [
      { id: '1', number: 1, label: 'Piece 1', code: 'if num % 2 == 0:' },
      { id: '2', number: 2, label: 'Piece 2', code: 'print("Even")' },
      { id: '3', number: 3, label: 'Piece 3', code: 'num = int(input())' },
      { id: '4', number: 4, label: 'Piece 4', code: 'else:' },
      { id: '5', number: 5, label: 'Piece 5', code: 'print("Odd")' },
      { id: '6', number: 6, label: 'Piece 6', code: 'print("Enter a number:")' },
      { id: '7', number: 7, label: 'Piece 7', code: 'try:' },
      { id: '8', number: 8, label: 'Piece 8', code: 'except ValueError:' },
      { id: '9', number: 9, label: 'Piece 9', code: 'print("Invalid input")' },
    ],
  },
  q7: {
    questionId: 'q7',
    totalPieces: 9,
    description: 'Drag and arrange the 9 function and execution pieces into the correct sequence to assemble the program.',
    pieces: [
      { id: '1', number: 1, label: 'Piece 1', code: 'def is_prime(num):\n  if num < 2: return False' },
      { id: '2', number: 2, label: 'Piece 2', code: 'for n in range(2, num):\n  if num % n == 0: return False' },
      { id: '3', number: 3, label: 'Piece 3', code: 'return True' },
      { id: '4', number: 4, label: 'Piece 4', code: 'print("Enter a number:")\nn = int(input())' },
      { id: '5', number: 5, label: 'Piece 5', code: 'print("Prime" if is_prime(n) else "Not")' },
      { id: '6', number: 6, label: 'Piece 6', code: 'def reverse_string(s):\n  return s[::-1]' },
      { id: '7', number: 7, label: 'Piece 7', code: 's = input("Enter a string: ")' },
      { id: '8', number: 8, label: 'Piece 8', code: 'print(reverse_string(s))' },
      { id: '9', number: 9, label: 'Piece 9', code: 'if __name__ == "__main__":' },
    ],
  },
};
