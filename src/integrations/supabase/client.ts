// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nlnweixrdzulgoyorasz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbndlaXhyZHp1bGdveW9yYXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MDM4NzQsImV4cCI6MjA1NDA3OTg3NH0.-BMgm53u2nPOUpSkZNdWFCPKli_99Jy36kswrdYHfhw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);