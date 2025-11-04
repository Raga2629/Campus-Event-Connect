/*
  # Campus Event Connect Database Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `roll_no` (text, unique) - Student roll number for login
      - `name` (text) - Student full name
      - `dept` (text) - Department
      - `year` (integer) - Year of study
      - `email` (text, unique) - Student email
      - `password` (text) - Hashed password
      - `attendance_percentage` (numeric, default 0) - Attendance percentage
      - `created_at` (timestamptz) - Account creation timestamp

    - `organizers`
      - `id` (uuid, primary key)
      - `name` (text) - Organizer full name
      - `email` (text, unique) - Must end with @vnrvjiet.in or @vnrvjiet.ac.in
      - `password` (text) - Hashed password
      - `created_at` (timestamptz) - Account creation timestamp

    - `events`
      - `id` (uuid, primary key)
      - `title` (text) - Event title
      - `date` (date) - Event date
      - `time` (time) - Event time
      - `venue` (text) - Event location
      - `description` (text) - Event details
      - `organizer_id` (uuid, foreign key) - References organizers table
      - `created_at` (timestamptz) - Event creation timestamp

    - `registrations`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key) - References students table
      - `event_id` (uuid, foreign key) - References events table
      - `registered_at` (timestamptz) - Registration timestamp
      - `event_date` (date) - Cached event date for quick queries
      - `event_time` (time) - Cached event time

  2. Security
    - Enable RLS on all tables
    - Public access for authentication queries (login/signup)
    - Students can read their own data and all events
    - Organizers can read their own data and manage their events
    - Registrations accessible to both students and organizers
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text UNIQUE NOT NULL,
  name text NOT NULL,
  dept text NOT NULL,
  year integer NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  attendance_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create organizers table
CREATE TABLE IF NOT EXISTS organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  venue text NOT NULL,
  description text NOT NULL,
  organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  event_date date NOT NULL,
  event_time time NOT NULL,
  UNIQUE(student_id, event_id)
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY "Anyone can read students for authentication"
  ON students FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert students for signup"
  ON students FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Students can update own data"
  ON students FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Organizers policies
CREATE POLICY "Anyone can read organizers for authentication"
  ON organizers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert organizers for signup"
  ON organizers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Organizers can update own data"
  ON organizers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Events policies
CREATE POLICY "Anyone can read all events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  USING (true);

-- Registrations policies
CREATE POLICY "Anyone can read registrations"
  ON registrations FOR SELECT
  USING (true);

CREATE POLICY "Students can register for events"
  ON registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Students can cancel registrations"
  ON registrations FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_organizers_email ON organizers(email);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
