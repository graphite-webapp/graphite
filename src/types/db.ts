export type TableName = 'sessions' | 'chapters' | 'goals';

export interface BaseRow {
  id?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
// export interface sessionsRow extends BaseRow {
//   date: string;
//   start_time: string;
//   end_time: string;
//   start_count: number;
//   end_count: number;
//   words_written: number;
//   session_duration: string;
//   wpm: number;
// }

// export interface chaptersRow extends BaseRow {
//   date: string;
//   chapter_completed: number;
// }

// export interface goalsRow extends BaseRow {
//   type: 'writing' | 'editing';
//   yearly: number;
//   monthly: number;
// }
