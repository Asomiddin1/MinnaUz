export interface AuthenticatedUserClaims {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  isPro: boolean;
  coins?: number;
  streakDays?: number;
}

export class McpSecurityError extends Error {
  public readonly code: number;
  public readonly data?: Record<string, unknown>;

  constructor(message: string, code = -32001, data?: Record<string, unknown>) {
    super(message);
    this.name = 'McpSecurityError';
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, McpSecurityError.prototype);
  }
}

export class SecurityContext {
  public readonly requestId: string;
  public readonly isAuthenticated: boolean;
  public readonly user?: AuthenticatedUserClaims;
  public readonly rawBearerToken?: string;
  public readonly scopes: ReadonlySet<string>;

  constructor(options: {
    requestId: string;
    rawBearerToken?: string;
    user?: AuthenticatedUserClaims;
    scopes?: string[];
  }) {
    this.requestId = options.requestId;
    this.rawBearerToken = options.rawBearerToken;
    this.user = options.user;
    this.isAuthenticated = Boolean(options.user && options.rawBearerToken);
    this.scopes = new Set(options.scopes ?? []);
  }

  public assertAuthenticated(toolName: string): asserts this is {
    user: AuthenticatedUserClaims;
    rawBearerToken: string;
  } {
    if (!this.isAuthenticated || !this.user || !this.rawBearerToken) {
      throw new McpSecurityError(
        `Tool '${toolName}' requires user authentication. Connect your MinnaUz account via OAuth.`,
        -32001,
        { tool: toolName, error: 'unauthorized' }
      );
    }
  }

  public assertScope(requiredScope: string, toolName: string): void {
    this.assertAuthenticated(toolName);
    if (this.scopes.size > 0 && !this.scopes.has(requiredScope)) {
      throw new McpSecurityError(
        `Tool '${toolName}' requires OAuth scope '${requiredScope}'.`,
        -32003,
        { tool: toolName, error: 'insufficient_scope', requiredScope }
      );
    }
  }
}

