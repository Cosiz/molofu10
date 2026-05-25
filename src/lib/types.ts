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
    delete(): {
      eq(column: string, value: any): {
        then<TResult1 = { error: any }, TResult2 = never>(
          onfulfilled?: ((value: { error: any }) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
        ): Promise<TResult1 | TResult2>;
      };
    };
  };
  auth: {
    getUser(): Promise<{ data: { user: any } }>;
    updateUser(data: any): Promise<{ data: { user: any }; error: any }>;
  };
  rpc(method: string, params?: any): Promise<{ data: any; error: any }>;
}
