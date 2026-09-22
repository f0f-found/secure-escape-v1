# Customer session handling

Customer sessions retain the existing ten-minute inactivity limit. The mobile
app records touch/scroll activity, keyboard opening, and web keyboard/input
events. It sends authenticated activity updates at most once every fifteen
seconds during interaction, with an additional validation on foregrounding
and an attempted flush before backgrounding. Idle polling does not renew the
session. Native system dialogs and individual native soft-keyboard keystrokes
are not captured by the root view's touch handlers.

The mobile timer signs out idle users and checks elapsed time when returning
from the background. API rejection of an activity update clears local login
state and returns to sign-in. Network failures alone do not sign users out;
the backend can still expire a session while the device is offline.

The API activity endpoint is `POST /api/v1/auth/activity`. Existing session
middleware validates it before recording activity. Both middleware and admin
cleanup use `SessionPolicy.InactivityTimeout`. JWT expiry remains 24 hours.
Backend logs distinguish inactivity expiry from missing or terminated sessions
without logging authentication tokens or PINs.

## Deployment

Deploy the updated API to Azure before releasing the updated mobile/web app.
No database migration is needed. Existing app installations must receive the
updated client code to gain activity tracking. A Git push alone is sufficient
only if external deployment/release automation is already configured; this
repository contains no GitHub Actions deployment workflow. Generated `bin`,
`obj`, and `publish` copies are not the source of this change.

The previously reported early expiry on Azure has not been reproduced against
the deployed service. If it persists after deployment, inspect the session
rejection logs for status, last activity, and elapsed idle time.

## Verification

- `dotnet test SecureEscape.Api.Tests/SecureEscape.Api.Tests.csproj`
- From `secure-escape-mobile`: `node --test tests/session-activity.test.cjs`
- On a device, sign in with a PIN, interact for more than ten minutes, and
  verify that the session remains valid. Switch away for two minutes and
  return; then leave idle for ten minutes and verify the sign-in screen.
- Repeat on web and check offline/reconnect behaviour. The automated client
  tests simulate lifecycle events; they do not replace a device check.
