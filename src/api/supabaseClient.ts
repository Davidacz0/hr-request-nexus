import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdfbfdffcwntrxmeaoos.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZmJmZGZmY3dudHJ4bWVhb29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MDAxNzQsImV4cCI6MjA2Mjk3NjE3NH0.P1Ik5XYfpbo-2fqc-vndjRcH-ThZ8cRW3-QdpCuwKms"
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;