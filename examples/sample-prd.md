# Account lockout

This small example exists to exercise the planned ReqLens workflow.

## AUTH-01 — Email sign-in

As a registered user, I want to sign in with my email and password so that I can access my account.

### Acceptance criteria

- **AUTH-01-AC1** — Given valid credentials, when the user submits the sign-in form, then the system creates a session and returns the user to the application.
- **AUTH-01-AC2** — Given invalid credentials, when the user submits the sign-in form, then the system rejects the attempt without revealing whether the email exists.

## AUTH-02 — Failed-attempt lockout

As an account owner, I want repeated failed sign-in attempts to trigger a temporary lock so that automated guessing is limited.

### Acceptance criteria

- **AUTH-02-AC1** — Given four consecutive failed attempts, when a fifth invalid attempt occurs, then the account is locked for 15 minutes.
- **AUTH-02-AC2** — Given a locked account, when another sign-in is attempted, then authentication is rejected even if the password is correct.
- **AUTH-02-AC3** — Given that the lock period has expired, when valid credentials are submitted, then sign-in succeeds and the failed-attempt counter is reset.

## AUTH-03 — Authentication audit trail

As an operator, I want authentication outcomes to be recorded so that suspicious activity can be investigated.

### Acceptance criteria

- **AUTH-03-AC1** — Every successful or failed attempt records its timestamp, outcome, and account identifier.
- **AUTH-03-AC2** — Authentication records never contain plaintext passwords or session secrets.
