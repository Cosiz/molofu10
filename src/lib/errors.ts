export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class FamilyError extends AppError {
  constructor(code: string, status: number, message: string) {
    super(code, status, message);
    this.name = 'FamilyError';
  }
}

export class InviteError extends AppError {
  constructor(code: string, status: number, message: string) {
    super(code, status, message);
    this.name = 'InviteError';
  }
}

export class ScheduleError extends AppError {
  constructor(code: string, status: number, message: string) {
    super(code, status, message);
    this.name = 'ScheduleError';
  }
}

export class HandshakeError extends AppError {
  constructor(code: string, status: number, message: string) {
    super(code, status, message);
    this.name = 'HandshakeError';
  }
}

export interface User {
  id: string;
  email?: string;
  family_id?: string;
  role?: string;
}

export interface SupabaseClient {
  from(table: string): {
    select(): {
      maybeSingle(): Promise<{ data: any; error: any }>;
      data: any;
      error: any;
    };
    insert(data: any): {
      select(): {
        single(): Promise<{ data: any; error: any }>;
      };
    };
    update(data: any): {
      eq(column: string, value: any): {
        select(): {
          single(): Promise<{ data: any; error: any }>;
        };
      };
    };
  };
  auth: {
    getUser(): Promise<{ data: { user: any } }>;
    updateUser(data: any): Promise<{ data: { user: any }; error: any }>;
  };
  rpc(method: string, params?: any): Promise<{ data: any; error: any }>;
}
