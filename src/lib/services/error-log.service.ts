import type { SupabaseClient } from "@supabase/supabase-js";

interface ErrorLogEntry {
  userId: string;
  errorCode: string;
  errorMessage: string;
  errorStack?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class ErrorLogService {
  constructor(private supabase: SupabaseClient) {}

  async logError(entry: ErrorLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase.from("error_logs").insert({
        user_id: entry.userId,
        error_code: entry.errorCode,
        error_message: entry.errorMessage,
        error_stack: entry.errorStack,
        metadata: entry.metadata,
        created_at: entry.timestamp.toISOString(),
      });

      if (error) {
        // If we can't log to the database, log to console as fallback
        // console.error("Failed to save error log:", error);
        // console.error("Original error:", entry);
      }
    } catch {
      // Fallback to console logging if database is unavailable
      // console.error("Error logging failed:", error);
      // console.error("Original error:", entry);
    }
  }

  async getRecentErrors(userId: string, limit = 10): Promise<ErrorLogEntry[]> {
    const { data, error } = await this.supabase
      .from("error_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch error logs: ${error.message}`);
    }

    return data.map((log) => ({
      userId: log.user_id,
      errorCode: log.error_code,
      errorMessage: log.error_message,
      errorStack: log.error_stack,
      metadata: log.metadata,
      timestamp: new Date(log.created_at),
    }));
  }
}

// Helper function to format error objects
export function formatError(error: unknown): {
  code: string;
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      code: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: String(error),
  };
}
