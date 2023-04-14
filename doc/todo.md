
x sessions:  create session middleware that runs for all page accesses
x login (credentials): add username-pw login 
x sqlite: create a sqlite db for recording logins and account credentials

credentials route
* register
* login
* * success adds user object to session
* delete account (email)
* reset passsword (email)

google-login: validate google token and add notification on the session if login is successfull
update session store - currently using default memory store see [1]

# Email Chain
User registers account
    \_ Account status set to unconfirmed
    \_ Confirmation email sent (notify user)
    \_ Add confirmation hash to confirmation db table
User Logs in
    \_ Is account confirmed
        \_ Yes: continue to main screen
        \_ No: Notify user, give options:
            \_ Resend Email
                \_ Add confirmation hash to confirmation db table
            \_ Continue to main screen

Add confirm endpoint that takes a url parameter.

[1] https://www.npmjs.com/package/express-session
