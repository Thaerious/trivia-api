curl -X POST 127.0.0.1:8080/credentials/login \
-H "Content-Type: application/json" \
-d '{"username":"adam", "password":"whatapple?"}' \
--cookie-jar ./cookies \
--cookie ./cookies
