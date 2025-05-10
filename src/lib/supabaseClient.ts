// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fewxlrfepeidboogmhbv.supabase.co"!;
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld3hscmZlcGVpZGJvb2dtaGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMjAyNDEsImV4cCI6MjA1MDg5NjI0MX0.5aeJiGJVDTN0mpOSbpq9BsyjF9l0rxSRWUHO2oT1uG4"!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);